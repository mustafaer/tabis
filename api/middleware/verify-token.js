let jwt = require('jwt-simple');
let config = require('../config');
let messages = require('../shared/languages/lang-tr');
const getUser = require('../middleware/token-parser');

module.exports = (request, response, next) => {
    try {
        let token;
        if (!request.header('Authorization') && !request.header('X-Access-Token')) {
            return response.status(401).send({
                detail: messages['error.user.unauthorized']
            });
        }
        if (request.header('Authorization')) {
            token = request.header('Authorization').split(' ')[1];
        } else if (request.header('X-Access-Token')) {
            token = request.header('X-Access-Token');
        } else {
            return response.status(401).send({
                detail: messages['error.user.unauthorized']
            });
        }

        if ((getUser(request).split(':')[0]).trim() === '' || (getUser(request).split(':')[1]).trim() === '') {

            return response.status(401).send({
                detail: messages['error.user.unauthorized']
            });
        }
        let user_id = +getUser(request).split(':')[0];

        let db = require('../db');

        db.query(`SELECT last_request_time, token
                  FROM tbl_user
                  WHERE id = $1`, [user_id], function (err, result) {
            if (err) {
                return response.status(401).send({
                    detail: messages['error.user.unauthorized']
                });
            } else {
                if (result.rows[0].token != token) {

                    return response.status(401).send({
                        detail: messages['error.user.unauthorized']
                    });
                }

                let now = (new Date()).getTime();
                let fark = now - result.rows[0].request_time;
                let minutes = Math.floor(fark / 60000);

                if (minutes > config.sessionExpiredTime) {
                    return response.status(401).send({
                        detail: 'token.expire'
                    });
                }


                db.query(`UPDATE tbl_user
                          SET last_request_time=$1
                          WHERE id = $2`, [now, user_id], function (err, result) {
                    if (err) {

                        return response.status(401).send({
                            detail: messages['error.user.unauthorized']
                        });
                    }
                });

            }
        });

        next();
    } catch (err) {
        return response.status(400).send({
            detail: err
        })
    }
};