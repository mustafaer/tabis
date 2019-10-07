const DEVELOPMENT_MODE = true; // true or false

if (DEVELOPMENT_MODE) {
    module.exports = {
        //ACCESS
        resetPasswordTokenHashKey: 'P8$.+}Hb~G5y6eQ`MrgBHc-H',
        sessionTokenHashKey: 'r.5rH+czwFG:EcMT?_TNuRz?',
        payloadKey: 'M>p8x%V2AN<k8mNEk{NV6JmxVL7<!Dx`',
        saltRounds: 8,
        passwordResetRequestTime: 15,
        passwordResetTokenExpiredTime: 60,
        sessionExpiredTime: 15,
        loginTryCount: 5,
        //URL
        frontEndUrl: 'http://localhost:4200',
        backEndUrl: 'http://localhost:8080',
        //DATABASE
        dbHost: '127.0.0.1',
        dbUser: 'tabis_user',
        dbPassword: 'q',
        dbDatabase: 'tabis_db',
        dbPort: 5432,
        dbSsl: false
    };
} else {
    module.exports = {
        //ACCESS
        resetPasswordTokenHashKey: '',
        sessionTokenHashKey: '',
        payloadKey: '',
        saltRounds: 8,
        passwordResetRequestTime: 15,
        passwordResetTokenExpiredTime: 60,
        sessionExpiredTime: 15,
        loginTryCount: 5,
        //URL
        frontEndUrl: 'https://example.com',
        backEndUrl: 'https://be.example.com',
        //DATABASE
        dbHost: '127.0.0.1',
        dbUser: '',
        dbPassword: '',
        dbDatabase: '',
        dbPort: 5432,
        dbSsl: false
    };
}
