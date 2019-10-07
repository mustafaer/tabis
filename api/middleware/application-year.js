function getAppYear() {
    try {
        let db = require('../db');

        db.query(`SELECT *
                  FROM tbl_application_setting
                  WHERE setting = 'app_year'
                    AND state = '1'
                  ORDER BY id ASC`, function (err, result) {
            if (err) {

            } else {

                return result.rows[0].app_year
            }
        });
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
}

module.exports = {getAppYear};