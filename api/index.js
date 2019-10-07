let express = require('express');
let bodyParser = require('body-parser');
let helmet = require('helmet');
let session = require('cookie-session');
let cors = require('cors');
const logger = require('./middleware/logger');
const verifyToken = require('./middleware/verify-token');
let config = require('./config');

let login = require('./services/login.service');
let user = require('./services/user.service');
let degree = require('./services/degree.service');
let studyBranch = require('./services/studyBranch.service');
let app = express();

let whitelist = [config.frontEndUrl, config.backEndUrl];

let corsOptions = {
    origin: function (origin, callback) {

        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

// Security Configuration
app.use(cors(corsOptions));
app.use(helmet());
app.disable('x-powered-by');
app.set('trust proxy', 1); // trust first proxy
let expiryDate = new Date(Date.now() + 60 * config.sessionExpiredTime * 1000);
app.use(session({
    name: 'session',
    keys: ['key1', 'key2'],
    cookie: {
        secure: true,
        httpOnly: true,
        domain: config.frontEndUrl,
        expires: expiryDate
    }
}));

// App Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Services
app.use('/', logger);
app.use('/login', login.router);
app.use('/api', verifyToken);
app.use('/api/user', user.router);
app.use('/api/degree', degree.router);
app.use('/api/studyBranch', studyBranch.router);


app.listen(8080, 'localhost');
