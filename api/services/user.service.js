let express = require('express');
let router = express.Router();
const getUser = require('../middleware/token-parser');
const appYear = require('../middleware/application-year');
let db = require('../db');
let bcrypt = require('bcrypt');
let config = require('../config');
let messages = require('../shared/languages/lang-tr');

router.get('/users', async (req, res) => {

    try {

        let userStatu = +getUser(req).split(':')[1];

        let offset = 0;
        let searchString = '';
        let limit = req.query.limit;
        let requestUserType = +req.query.requestUserType;
        if (req.query.offset) {
            offset = req.query.offset;
        }
        if (req.query.search) {
            searchString = req.query.search;
        }

        if (userStatu === 0) {
            let findUsersQuery;
            let userCount;
            let users;

            if (!(requestUserType === 1 || requestUserType === 2)) {
                return res.status(406).send({detail: messages['error.user.not.exist']});
            } else {

                findUsersQuery = `SELECT tu.id,
                                         tu.full_name             as fullName,
                                         tu.username,
                                         tu.email,
                                         tu.education_type        as educationType,
                                         tu.daytime_student_count as daytimeStudentCount,
                                         tu.evening_student_count as eveningStudentCount,
                                         td.degree,
                                         td.id                    AS degreeId,
                                         tsb.study_branch         as studyBranch,
                                         tsb.id                   AS studyBranchId
                                  FROM tbl_user AS tu
                                           LEFT JOIN
                                       tbl_study_branch AS tsb ON tu.advisor_study_branch_id = tsb.id
                                           LEFT JOIN tbl_degree AS td ON tu.degree_id = td.id
                                  WHERE (tu.username ILIKE $1 OR tu.full_name ILIKE $1 OR
                                         td.degree ILIKE $1 OR tsb.study_branch ILIKE $1)
                                    AND tu.state = $2
                                    AND tu.user_type = $3
                                    AND tu.app_year = $4
                                  ORDER BY tu.id
                                  LIMIT $5
                                  OFFSET
                                  $6`;

                userCount = await db.query(findUsersQuery, ['%' + searchString + '%', 1, requestUserType, appYear.getAppYear(), null, null]);
                users = await db.query(findUsersQuery, ['%' + searchString + '%', 1, requestUserType, appYear.getAppYear(), limit, offset]);
            }
            users = users.rows;
            if (users) {

                let obj = {
                    count: userCount.rowCount,
                    result: users
                };

                res.status(200).send(obj);

            } else {
                return res.status(406).send({detail: messages['error.user.not.exist']});
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.get('/view', async (req, res) => {

    try {
        let userStatu = +getUser(req).split(':')[1];
        let requestData = req.query;
        let userId = requestData.userId;
        let requestUserType = +requestData.requestUserType;

        if (userStatu === 0) {
            let userResult;
            if (!(requestUserType === 1 || requestUserType === 2)) {
                return res.status(406).send({detail: messages['error.user.not.exist']});
            } else {
                let userQery = `SELECT tu.id,
                                       tu.full_name             as fullName,
                                       tu.username,
                                       tu.email,
                                       tu.education_type        as educationType,
                                       tu.daytime_student_count as daytimeStudentCount,
                                       tu.evening_student_count as eveningStudentCount,
                                       td.degree,
                                       td.id                    AS degreeId,
                                       tsb.study_branch         as studyBranch,
                                       tsb.id                   AS studyBranchId
                                FROM tbl_user AS tu
                                         LEFT JOIN
                                     tbl_study_branch AS tsb ON tu.advisor_study_branch_id = tsb.id
                                         LEFT JOIN tbl_degree AS td ON tu.degree_id = td.id
                                WHERE tu.id = $1`;
                userResult = await db.query(userQery, [userId]);
            }
            userResult = userResult.rows[0];
            if (userResult) {
                res.status(200).send(userResult);
            } else {
                return res.status(406).send({detail: messages['error.user.not.exist']});
            }
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/add', async (req, res) => {

    try {
        let userStatu = +getUser(req).split(':')[1];

        let requestData = req.body;
        let fullName = requestData.fullName;
        let username = requestData.username;
        let email = requestData.email;
        let educationType = requestData.educationType;
        let requestUserType = +requestData.requestUserType;
        let daytimeStudentCount = +requestData.daytimeStudentCount;
        let eveningStudentCount = +requestData.eveningStudentCount;
        let advisorStudyBranchId = +requestData.advisorStudyBranchId;
        let degreeId = +requestData.degreeId;

        if (requestUserType !== 1 || requestUserType !== 2) {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }

        let character_array = "1234567890abcdefghijKLMNOPQRSTuvwxyzABCDEFGHIJklmnopqrstUVWXYZ0987654321";
        let pwd = '';
        for (let i = 0; i < 8; i++) {
            pwd += character_array[Math.floor((Math.random() * 72))];
        }
        let password = pwd;

        if (userStatu === 0) {

            const checkUserQuery = `SELECT username, email
                                    FROM tbl_user
                                    WHERE ((username = $1 AND state = $2)
                                        OR (email = $3 AND state = $2))
                                      AND app_year = $4`;
            let checkUserResult = await db.query(checkUserQuery, [username, 1, email, appYear.getAppYear()]);
            checkUserResult = checkUserResult.rows[0];

            if (checkUserResult) {
                if (checkUserResult.username === username) {
                    return res.status(400).send({detail: messages['error.user.save.username.exist']});
                } else if (checkUserResult.email === email) {
                    return res.status(400).send({detail: messages['error.user.save.email.exist']});
                }
            } else {


                const saltRounds = config.saltRounds;

                let hash = bcrypt.hashSync(password, saltRounds);

                const userRegisterQuery = `INSERT INTO tbl_user (full_name, username, password, email, education_type,
                                                                 daytime_student_count, evening_student_count,
                                                                 advisor_study_branch_id, degree_id, user_type,
                                                                 app_year)
                                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

                let userRegisterResult = await db.query(userRegisterQuery, [fullName, username, hash, email, educationType, daytimeStudentCount, eveningStudentCount,
                    advisorStudyBranchId, degreeId, requestUserType, appYear.getAppYear()]);

                if (userRegisterResult.rowCount >= 1) {
                    return res.status(200).send({detail: messages['success.user.save']});
                } else {
                    return res.status(400).send({detail: messages['error.user.save']});
                }
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/view', async (req, res) => {

    try {

        let userStatu = +getUser(req).split(':')[1];

        let requestData = req.body;
        let fullName = requestData.fullName;
        let username = requestData.username;
        let email = requestData.email;
        let educationType = requestData.educationType;
        let daytimeStudentCount = +requestData.daytimeStudentCount;
        let eveningStudentCount = +requestData.eveningStudentCount;
        let advisorStudyBranchId = +requestData.advisorStudyBranchId;
        let degreeId = +requestData.degreeId;
        let userId = +requestData.userId;

        if (userStatu === 0) {

            const checkUserQuery = `SELECT username, email
                                    FROM tbl_user
                                    WHERE ((username = $1 AND state = $2)
                                        OR (email = $3 AND state = $2))
                                      AND app_year = $4
                                      AND id != $5`;
            let checkUserResult = await db.query(checkUserQuery, [username, 1, email, appYear.getAppYear(), userId]);
            checkUserResult = checkUserResult.rows[0];

            if (checkUserResult) {
                if (checkUserResult.username === username) {
                    return res.status(400).send({detail: messages['error.user.edit.username.exist']});
                } else if (checkUserResult.email === email) {
                    return res.status(400).send({detail: messages['error.user.edit.email.exist']});
                }
            } else {
                const userUpdateQuery = `UPDATE tbl_user
                                         SET full_name=$1,
                                             username=$2,
                                             email=$3,
                                             education_type=$4,
                                             daytime_student_count=$5,
                                             evening_student_count=$6,
                                             advisor_study_branch_id=$7,
                                             degree_id=$8
                                         WHERE id = $9`;
                let userUpdateResult = await db.query(userUpdateQuery, [fullName, username, email, educationType, daytimeStudentCount, eveningStudentCount, advisorStudyBranchId, degreeId, userId]);
                if (userUpdateResult.rowCount >= 1) {

                    return res.status(200).send({detail: messages['success.user.edit']});
                } else {
                    return res.status(400).send({detail: messages['error.user.edit']});
                }
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/delete', async (req, res) => {
    try {
        let userStatu = +getUser(req).split(':')[1];
        let requestData = req.body;
        let userId = +requestData.userId;

        if (userStatu === 0) {
            const checkAppealQuery = `SELECT id
                                      FROM tbl_appeal
                                      WHERE (advisor_id = $1 OR student_id = $1)
                                        AND (state = $2 OR state = $3)
                                        AND app_year = $4`;
            let checkAppealResult = await db.query(checkAppealQuery, [userId, 1, 2019]);
            checkAppealResult = checkAppealResult.rows[0];
            if (checkAppealResult) {
                return res.status(400).send({detail: messages['error.user.edit.advisor.has.appeal']});
            } else {
                const userDeleteQuery = `UPDATE tbl_user
                                         SET state=$1
                                         WHERE id = $2`;
                let userDeleteResult = await db.query(userDeleteQuery, [0, userId]);
                if (userDeleteResult.rowCount >= 1) {
                    return res.status(200).send({detail: messages['success.user.delete']});
                } else {
                    return res.status(400).send({detail: messages['error.user.delete']});
                }
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/import', async (req, res) => {

    try {
        let userStatu = +getUser(req).split(':')[1];
        let requestData = req.body;
        let datas = JSON.parse(requestData.datas);
        let requestUserType = +requestData.requestUserType;

        let notImportedUsers = [];
        let group_name;

        if (userStatu === 0) {
            if (datas.length > 0) {
                for (let i = 0; i < datas.length; i++) {

                    let fullName = datas[i].fullName;
                    let username = datas[i].username;
                    let email = datas[i].email;
                    let educationType = datas[i].educationType;
                    let requestUserType = +datas[i].requestUserType;
                    let daytimeStudentCount = +datas[i].daytimeStudentCount;
                    let eveningStudentCount = +datas[i].eveningStudentCount;
                    let advisorStudyBranchId = +datas[i].advisorStudyBranchId;
                    let degreeId = +datas[i].degreeId;

                    let character_array = "1234567890abcdefghijKLMNOPQRSTuvwxyzABCDEFGHIJklmnopqrstUVWXYZ0987654321";
                    let pwd = '';
                    for (let i = 0; i < 8; i++) {
                        pwd += character_array[Math.floor((Math.random() * 72) + 0)];
                    }

                    const saltRounds = config.saltRounds;
                    let password = bcrypt.hashSync(pwd, saltRounds);
                    const pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    const email_state = !!email.match(pattern);

                    if (!email_state || !fullName || namesurname.trim() === '' || !username || username.trim() === '' || (requestUserType == 2 && (!group_no_id || group_no_id == ''))) {
                        notImportedUsers.push(datas[i]);
                    } else {
                        if (group_no_id) {
                            group_no_id = group_no_id.id;
                        }
                        const check_user = 'SELECT username,email FROM tbl_users WHERE ((username=$1 AND state=$2) OR (email=$3 AND state=$2)) AND app_year=$4';
                        let check_result = await db.query(check_user, [username, 1, email, 2019]);
                        check_result = check_result.rows[0];

                        if (check_result) {
                            if (check_result.username === username || check_result.email === email) {
                                notImportedUsers.push(datas[i]);
                            }
                        } else {
                            const user_register_query = 'INSERT INTO tbl_users (namesurname, username, password, email, group_no_id, app_year, statu, state) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';

                            let user_register = await db.query(user_register_query, [namesurname, username, password, email, group_no_id, 2019, requestUserType, 1]);

                            if (user_register.rowCount < 1) {
                                notImportedUsers.push(datas[i]);
                            }
                        }
                    }
                }
                return res.status(200).send({detail: 'success', result: notImportedUsers})
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

let user = {router};

module.exports = user;