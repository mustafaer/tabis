let express = require('express');
let router = express.Router();
const getUser = require('../middleware/token-parser');
let db = require('../db');
let config = require('../config');
let messages = require('../shared/languages/lang-tr');

router.get('/degrees', async (req, res) => {

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
            let degreeQuery = 'SELECT * FROM tbl_degree WHERE name ILIKE $1 AND state=$2 ORDER BY name LIMIT $3 OFFSET $4';

            let degreeResultCount = await db.query(degreeQuery, ['%' + searchString + '%', 1, null, null]);
            let degreeResult = await db.query(degreeQuery, ['%' + searchString + '%', 1, limit, offset]);
            degreeResult = degreeResult.rows;
            if (degreeResult) {

                let obj = {
                    count: degreeResultCount.rowCount,
                    result: degreeResult
                };

                res.status(200).send(obj);

            } else {
                return res.status(406).send({detail: messages['error.degree.not.exist']});
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
        let degreeId = requestData.degreeId;

        if (userStatu === 0) {

            let degreeQuery = 'SELECT id,name FROM tbl_degree WHERE id=$1 AND state=$2';
            let degreeResult = await db.query(degreeQuery, [degreeId, 1]);

            degreeResult = degreeResult.rows[0];
            if (degreeResult) {

                res.status(200).send(degreeResult);

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
        let degree = requestData.degree;

        if ((degree.name).trim() === '') {
            return res.status(400).send({detail: messages['error.degree.save']});
        }

        if (userStatu === 0) {

            const checkDegreeQuery = `SELECT name
                                      FROM tbl_degree
                                      WHERE name = $1
                                        AND state = $2`;
            let checkDegreeResult = await db.query(checkDegreeQuery, [degree, 1]);
            checkDegreeResult = checkDegreeResult.rows[0];

            if (checkDegreeResult) {
                return res.status(400).send({detail: messages['error.degree.save.degree.exist']});
            } else {

                const degreeRegisterQuery = `INSERT INTO tbl_degree (name)
                                             VALUES ($1)`;

                let checkDegreeResult = await db.query(degreeRegisterQuery, [degree]);

                if (checkDegreeResult.rowCount >= 1) {
                    return res.status(200).send({detail: messages['success.degree.save']});
                } else {
                    return res.status(400).send({detail: messages['error.degree.save']});
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
        let degree = requestData.degree;
        let degreeId = requestData.degreeId;

        if (userStatu === 0) {

            const checkDegreeQuery = `SELECT name
                                      FROM tbl_degree
                                      WHERE name = $1
                                        AND state = $2
                                        AND id != $3`;
            let checkDegreeResult = await db.query(checkDegreeQuery, [degree, 1, degreeId]);
            checkDegreeResult = checkDegreeResult.rows[0];

            if (checkDegreeResult) {
                return res.status(400).send({detail: messages['error.degree.edit.degree.exist']});
            } else {
                const updateDegreeQuery = 'UPDATE tbl_degree SET name=$1 WHERE id=$2';
                let updateDegreeResult = await db.query(updateDegreeQuery, [degree, degreeId]);
                if (updateDegreeResult.rowCount >= 1) {

                    return res.status(200).send({detail: messages['success.degree.edit']});
                } else {
                    return res.status(400).send({detail: messages['error.degree.edit']});
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

        let degreeId = +requestData.degreeId;

        if (userStatu === 0) {

            const checkDegreeQuery = 'SELECT id FROM tbl_user WHERE degree_id=$1';
            let checkDegreeResult = await db.query(checkDegreeQuery, [degreeId]);

            checkDegreeResult = checkDegreeResult.rows[0];

            if (checkDegreeResult) {
                return res.status(400).send({detail: messages['error.users.edit.degree.has.user']});
            } else {
                const deleteDegreeQuery = 'UPDATE tbl_degree SET state=$1 WHERE id=$2';
                let deleteDegreeResult = await db.query(deleteDegreeQuery, [0, degreeId]);
                if (deleteDegreeResult.rowCount >= 1) {

                    return res.status(200).send({detail: messages['success.degree.delete']});
                } else {
                    return res.status(400).send({detail: messages['error.degree.delete']});
                }
            }
        } else {
            return res.status(401).send({detail: messages['error.user.unauthorized']});
        }
    } catch (err) {
        return res.status(400).send({detail: err.detail})
    }
});

let degree = {router};

module.exports = degree;