let express = require('express');
let router = express.Router();
let jwt = require('jwt-simple');
let bcrypt = require('bcrypt');

let db = require('../db');
let config = require('../config');
let messages = require('../shared/languages/lang-tr');
let mailler = require('./mailer.service');

router.post('', async (req, res) => {

    try {
        let userData = req.body;
        const userQuery = `SELECT *
                           FROM tbl_user
                           WHERE (username ~* $1 OR email ~* $1)
                             AND state = $2`;

        let user = await db.query(userQuery, [userData.username, 1]);
        user = user.rows[0];
        let hash;
        if (user) {
            if (user.login_try_count >= config.loginTryCount) {

                return res.status(401).send({detail: messages['error.account.blocked']})
            }

            hash = bcrypt.compareSync(userData.password, user.password); // true
        }
        if (!user || !hash || user.state === 0) {
            if (user) {
                let newTryCount = user.login_try_count + 1;
                const loginTryQuery = `UPDATE tbl_user
                                       SET login_try_count=$1
                                       WHERE id = $2`;
                await db.query(loginTryQuery, [newTryCount, user.id]);
            }
            return res.status(401).send({detail: messages['error.invalid.email.or.password']})
        } else {
            let payload = {'userId': user.id, 'userType': user.user_type};
            let token = jwt.encode(payload, config.payloadKey);

            let nowTime = (new Date()).getTime();
            const loginTryQuery = `UPDATE tbl_user
                                   SET login_try_count=$1,
                                       last_request_time=$2,
                                       token=$3
                                   WHERE id = $4`;
            let loginTry = await db.query(loginTryQuery, [0, nowTime, token, user.id]);

            if (loginTry.rowCount >= 1) {
                return res.status(200).send({token});
            }
        }

    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

router.post('/passwordRequest', async (req, res) => {

    try {
        let requestData = req.body;
        let email = requestData.email;

        if (email.trim() === '') {
            let resCode = 400;
            let resDetail = messages['error.password_request.email'];
            return res.status(resCode).send({
                detail: resDetail
            });
        }

        const pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let emailVal = !!email.match(pattern);

        if (emailVal) {

            const check_ = `SELECT id, email, full_name
                            FROM tbl_user
                            WHERE state = $1
                              AND email ~* $2`;
            let checkResult = await db.query(check_, [1, email]);
            checkResult = checkResult.rows[0];

            if (checkResult) {

                const check_4 = `SELECT request_time, id
                                 FROM tbl_password_request
                                 WHERE user_id = $1`;
                let checkResult4 = await db.query(check_4, [checkResult.id]);
                checkResult4 = checkResult4.rows[0];

                if (checkResult4) {
                    let now = (new Date()).getTime();
                    let fark = now - checkResult4.request_time;
                    var minutes = Math.floor(fark / 60000);

                    if (minutes < config.passwordResetRequestTime) {
                        let resCde = 400;
                        let resDetail = messages['error.password_request.request.too.quick'];
                        return res.status(resCde).send({
                            detail: resDetail
                        });
                    }
                }

                const saltRounds = config.saltRounds;
                const myPlaintextPassword = config.resetPasswordTokenHashKey;

                let hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

                const check_2 = `SELECT setting_value
                                 FROM tbl_application_setting
                                 WHERE state = $1
                                   AND setting = $2`;
                let checkResult2 = await db.query(check_2, [1, 'email_template']);
                checkResult2 = checkResult2.rows[0].setting_value;

                let resetUrl = config.frontEndUrl + '/password-reset/?token=' + hash;

                let email_variables = {};
                email_variables.email_subject = "Parola Sıfırlama";

                let emailContent;
                emailContent = checkResult2.replace('{{full_name}}', checkResult.full_name);
                emailContent = emailContent.replace('{{email_subject}}', email_variables.email_subject);
                emailContent = emailContent.replace('{{frontend_url}}', config.frontEndUrl);
                emailContent = emailContent.replace('{{email_content}}', 'Parola sıfırlama talebinde bulundunuz. <a href="' + resetUrl + '">Buraya</a> tıklayarak ya da aşağıdaki linki tarayıcınıza yapıştırarak yeni parola oluşturabilirsiniz.<br><br>' + resetUrl + '<br>Hesabınızın güvenliği için bu linki paylaşmayınız!');

                email_variables.to_email_address = checkResult.email;
                email_variables.email_text = emailContent;
                email_variables.email_html = emailContent;

                let now = (new Date()).getTime();
                if (checkResult4) {
                    const pwdReqQuery = `UPDATE tbl_password_request
                                           SET token=$1,
                                               request_time=$2,
                                               state=$3
                                           WHERE id = $4`;
                    let pwd_req = await db.query(pwdReqQuery, [hash, now, 1, checkResult4.id]);
                    if (pwd_req.rowCount >= 1) {
                        mailler.sendEmail(email_variables);
                    }
                } else {
                    const pwdReqQuery = `INSERT INTO tbl_password_request (user_id, token, request_time, state)
                                           VALUES ($1, $2, $3, $4)`;
                    let pwd_req = await db.query(pwdReqQuery, [checkResult.id, hash, now, 1]);
                    if (pwd_req.rowCount >= 1) {
                        mailler.sendEmail(email_variables);
                    }
                }


            }
        }
        let resCode = 200;
        let resDetail = messages['success.password_request.request'];
        return res.status(resCode).send({
            detail: resDetail
        });
    } catch (err) {
        let resCode = 400;
        let resDetail = err.detail;
        return res.status(resCode).send({
            detail: resDetail
        })
    }
});

router.get('/passwordReset', async (req, res) => {

    try {
        let requestData = req.query;
        let token = requestData.token;

        const myPlaintextPassword = config.resetPasswordTokenHashKey;

        let hash = bcrypt.compareSync(myPlaintextPassword, token); // true

        if (hash) {
            const groupQuery = `SELECT request_time, id
                                 FROM tbl_password_request
                                 WHERE state = $1
                                   AND token = $2`;

            let group = await db.query(groupQuery, [1, token]);
            group = group.rows[0];
            if (group) {

                let now = (new Date()).getTime();
                let fark = now - group.request_time;
                let minutes = Math.floor(fark / 60000);

                if (minutes > config.passwordResetTokenExpiredTime) {
                    const pwdRequestQuery = `UPDATE tbl_password_request
                                           SET state=$1
                                           WHERE id = $2`;
                    let pwdRequestResult = await db.query(pwdRequestQuery, [0, group.id]);
                    return res.status(400).send({
                        detail: messages['error.password_reset.token.expired']
                    });
                }

                return res.status(200).send({
                    detail: messages['success.password_request.token.valid']
                });

            }
        }
        return res.status(400).send({
            detail: messages['error.password_request.token.not.valid']
        });
    } catch (err) {
        return res.status(400).send({
            detail: err.detail
        })
    }
});

router.post('/passwordReset', async (req, res) => {

    try {

        let requestData = req.body;
        let newPassword = requestData.newPassword;
        let newPasswordRepeat = requestData.newPasswordRepeat;
        let token = requestData.token;

        const myPlaintextPassword = config.resetPasswordTokenHashKey;

        let hash = bcrypt.compareSync(myPlaintextPassword, token); // true

        if (hash) {
            const groupQuery = `SELECT user_id, request_time, id
                                 FROM tbl_password_request
                                 WHERE state = $1
                                   AND token = $2`;

            let group = await db.query(groupQuery, [1, token]);
            group = group.rows[0];
            if (group) {

                let now = (new Date()).getTime();
                let fark = now - group.request_time;
                let minutes = Math.floor(fark / 60000);

                if (minutes > 60) {
                    return res.status(400).send({
                        detail: messages['error.password_reset.token.expired']
                    });
                }

                if (newPassword !== newPasswordRepeat) {
                    return res.status(406).send({
                        detail: messages['error.password_reset.new.passwords.not.same']
                    });
                }


                const saltRounds = config.saltRounds;

                let hash = bcrypt.hashSync(newPassword, saltRounds);

                const updateMyUser = `UPDATE tbl_user
                                       SET password=$1
                                       WHERE id = $2
                                         AND state = $3`;
                let updateMyUserResult = await db.query(updateMyUser, [hash, group.user_id, 1]);
                if (updateMyUserResult.rowCount >= 1) {

                    const pwdReqQuery = `UPDATE tbl_password_request
                                           SET state=$1
                                           WHERE id = $2`;
                    let pwdReq = await db.query(pwdReqQuery, [0, group.id]);

                    const loginTryQuery = `UPDATE tbl_user
                                             SET login_try_count=$1
                                             WHERE id = $2`;
                    let loginTry = await db.query(loginTryQuery, [0, group.user_id]);

                    return res.status(201).send({
                        detail: messages['success.user.password.change']
                    })
                } else {
                    return res.status(400).send({
                        detail: messages['error.user.password.change']
                    })
                }
            }
        }
    } catch (err) {
        return res.status(400).send({
            detail: err.detail
        })
    }
});

let login = {router};

module.exports = login;