let express = require('express');
let router = express.Router();
const getUser = require('../middleware/token-parser');
let db = require('../db');
let config = require('../config');
let messages = require('../shared/languages/lang-tr');

router.get('/studyBranches', async (req, res) => {

    try {

        let userStatu = +getUser(req).split(':')[1];

        let offset = 0;
        let searchString = '';
        let limit = req.query.limit;
        if (req.query.offset) {
            offset = req.query.offset;
        }
        if (req.query.search) {
            searchString = req.query.search;
        }

        if (userStatu === 0) {

            let studyBranchQuery = 'SELECT * FROM tbl_study_branch WHERE name ILIKE $1 AND state=$2 ORDER BY name LIMIT $3 OFFSET $4';

            let studyBranchResultCount = await db.query(studyBranchQuery, ['%' + searchString + '%', 1, null, null]);
            let studyBranchResult = await db.query(studyBranchQuery, ['%' + searchString + '%', 1, limit, offset]);

            studyBranchResult = studyBranchResult.rows;
            if (studyBranchResult) {

                let obj = {
                    count: studyBranchResultCount.rowCount,
                    result: studyBranchResult
                };

                res.status(200).send(obj);

            } else {
                return res.status(406).send({detail: messages['error.studyBranch.not.exist']});
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
        let studyBranchId = requestData.studyBranchId;

        if (userStatu === 0) {

            let studyBranchQuery = 'SELECT id,name FROM tbl_study_branch WHERE id=$1 AND state=$2';
            let studyBranchResult = await db.query(studyBranchQuery, [studyBranchId, 1]);

            studyBranchResult = studyBranchResult.rows[0];
            if (studyBranchResult) {

                res.status(200).send(studyBranchResult);

            } else {
                return res.status(406).send({detail: messages['error.studyBranch.not.exist']});
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/add', async (req, res) => {

    try {
        let userStatu = +getUser(req).split(':')[1];

        let requestData = req.body;
        let studyBranch = requestData.studyBranch;

        if (userStatu === 0) {

            const checkStudyBranchQuery = `SELECT name
                                           FROM tbl_study_branch
                                           WHERE name = $1
                                             AND state = $2`;
            let checkStudyBranchResult = await db.query(checkStudyBranchQuery, [studyBranch, 1]);
            checkStudyBranchResult = checkStudyBranchResult.rows[0];

            if (checkStudyBranchResult) {
                return res.status(400).send({detail: messages['error.studyBranch.save.studyBranch.exist']});
            } else {

                const studyBranchRegisterQuery = `INSERT INTO tbl_study_branch (name)
                                                  VALUES ($1)`;

                let checkStudyBranchResult = await db.query(studyBranchRegisterQuery, [studyBranch]);

                if (checkStudyBranchResult.rowCount >= 1) {
                    return res.status(200).send({detail: messages['success.studyBranch.save']});
                } else {
                    return res.status(400).send({detail: messages['error.studyBranch.save']});
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
        let studyBranch = requestData.studyBranch;
        let studyBranchId = requestData.studyBranchId;

        if (userStatu === 0) {

            const checkStudyBranchQuery = `SELECT name
                                           FROM tbl_study_branch
                                           WHERE name = $1
                                             AND state = $2
                                             AND id != $3`;
            let checkStudyBranchResult = await db.query(checkStudyBranchQuery, [studyBranch, 1, studyBranchId]);
            checkStudyBranchResult = checkStudyBranchResult.rows[0];

            if (checkStudyBranchResult) {
                return res.status(400).send({detail: messages['error.studyBranch.edit.studyBranch.exist']});
            } else {
                const updateStudyBranchQuery = 'UPDATE tbl_study_branch SET name=$1 WHERE id=$2';
                let updateStudyBranchResult = await db.query(updateStudyBranchQuery, [studyBranch, studyBranchId]);
                if (updateStudyBranchResult.rowCount >= 1) {

                    return res.status(200).send({detail: messages['success.studyBranch.edit']});
                } else {
                    return res.status(400).send({detail: messages['error.studyBranch.edit']});
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

        let studyBranchId = +requestData.studyBranchId;

        if (userStatu === 0) {

            const checkStudyBranchQuery = 'SELECT id FROM tbl_user WHERE advisor_study_branch_id=$1';
            let checkStudyBranchResult = await db.query(checkStudyBranchQuery, [studyBranchId]);

            checkStudyBranchResult = checkStudyBranchResult.rows[0];

            if (checkStudyBranchResult) {
                return res.status(400).send({detail: messages['error.users.edit.studyBranch.has.user']});
            } else {
                const deleteStudyBranchQuery = 'UPDATE tbl_study_branch SET state=$1 WHERE id=$2';
                let deleteStudyBranchResult = await db.query(deleteStudyBranchQuery, [0, studyBranchId]);
                if (deleteStudyBranchResult.rowCount >= 1) {

                    return res.status(200).send({detail: messages['success.studyBranch.delete']});
                } else {
                    return res.status(400).send({detail: messages['error.studyBranch.delete']});
                }
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

let studyBranch = {router};

module.exports = studyBranch;