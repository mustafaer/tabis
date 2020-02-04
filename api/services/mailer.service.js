function sendEmail(email_variables) {
    try {

        const nodemailer = require('nodemailer');
        let db = require('../db');

        db.query(`SELECT *
                  FROM tbl_application_setting
                  WHERE key = 'email_smtp_hostname'
                     OR key = 'email_smtp_port'
                     OR key = 'email_address'
                     OR key = 'email_password' AND state = '1'
                  ORDER BY id ASC`, function (err, result) {
            if (err) {

            } else {

                let dict = {}; // create an empty array
                let ky;
                let vl;

                for (let i = 0; i < result.rowCount; i++) {
                    ky = result.rows[i].key;
                    vl = result.rows[i].value;
                    dict[ky] = vl;
                }


                let transporter = nodemailer.createTransport({
                    host: dict.email_smtp_hostname,
                    port: dict.email_smtp_port,
                    auth: {
                        user: dict.email_address,
                        pass: dict.email_password
                    }
                });

                transporter.verify(function (error, success) {

                    if (error) {
                        console.log('err')
                    } else {

                        console.log('Bağlantı başarıyla sağlandı');
                    }
                });

                let bilgiler = {
                    from: 'BİDES <' + dict.email_address + '> ',
                    to: email_variables.to_email_address,
                    subject: email_variables.email_subject,
                    text: email_variables.email_text,
                    html: email_variables.email_html
                };

                transporter.sendMail(bilgiler, function (error, info) {

                    if (error) throw error;

                    console.log('Eposta gönderildi ' + info.response);

                });
            }
        });
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
}

function checkEmailConfiguration(res) {
    try {

        const nodemailer = require('nodemailer');
        let db = require('../db');
        let messages = require('../shared/languages/lang-tr');

        db.query(`SELECT *
                  FROM tbl_application_setting
                  WHERE key = 'email_smtp_hostname'
                     OR key = 'email_smtp_port'
                     OR key = 'email_address'
                     OR key = 'email_password' AND state = '1'
                  ORDER BY id ASC`, function (err, result) {
            if (err) {

            } else {

                let dict = {}; // create an empty array
                let ky;
                let vl;

                for (let i = 0; i < result.rowCount; i++) {
                    ky = result.rows[i].key;
                    vl = result.rows[i].value;
                    dict[ky] = vl;
                }


                let transporter = nodemailer.createTransport({
                    host: dict.email_smtp_hostname,
                    port: dict.email_smtp_port,
                    auth: {
                        user: dict.email_address,
                        pass: dict.email_password
                    }
                });

                transporter.verify(function (error, success) {

                    if (error) {
                        return res.status(400).send({detail: messages['error.email_setting.edit.email_connection']});
                    } else {
                        return res.status(200).send({detail: messages['success.email_setting.edit.email_connection']});
                    }
                });

            }
        });
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
}

module.exports = {sendEmail, checkEmailConfiguration};