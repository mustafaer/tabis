let jwt = require('jwt-simple');
let config = require('../config');

module.exports = (request) => {
    let token;
    if (request.header('Authorization')) {
        token = request.header('Authorization').split(' ')[1];
    } else if (request.header('X-Access-Token')) {
        token = request.header('X-Access-Token');
    }
    let payload = jwt.decode(token, config.payloadKey);
    if (payload) {
        return payload.userId + ":" + payload.userType;
    }
};