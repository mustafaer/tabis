module.exports = (request, response, next) => {
    try {
        let reqMethod = request.method;
        let tempPassword = '';
        let tempNewPassword = '';
        let tempNewPasswordRepeat = '';
        if (reqMethod === 'POST' && ((request.url).indexOf('login') || (request.url).indexOf('myuser') || (request.url).indexOf('passwordReset'))) {
            if (request.body.password) {
                tempPassword = request.body.password;
                request.body.password = '********';
            } else if (request.body.newPassword || request.body.newPasswordRepeat) {
                tempNewPassword = request.body.newPassword;
                tempNewPasswordRepeat = request.body.newPasswordRepeat;
                request.body.newPassword = '********';
                request.body.newPasswordRepeat = '********';
            }
        }

        let req_header = JSON.stringify(request.headers);
        let req_body = JSON.stringify(request.body);
        let req_api = request.url;
        let req_ip = request.headers["x-forwarded-for"];


        let db = require('../db');

        db.query(`INSERT INTO tbl_application_log
                  (request_header,
                   request_body,
                   request_method,
                   request_api,
                   request_ip,
                   operation_date)
                  VALUES ($1, $2, $3, $4, $5, $6)`,
            [req_header,
                req_body,
                reqMethod,
                req_api,
                req_ip,
                new Date()],
            function (err, result) {
                if (err) {
                    console.log(err)
                }
            });
        if (tempPassword !== '') {
            request.body.password = tempPassword;
        } else if (tempNewPassword !== '' || tempNewPasswordRepeat !== '') {
            request.body.newPassword = tempNewPassword;
            request.body.newPasswordRepeat = tempNewPasswordRepeat;
        }
        next();
    } catch (err) {
        return response.status(400).send({
            detail: err
        })
    }
};