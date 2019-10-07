const pg = require('pg');
let cnf = require('./config');
const config = {
    host: cnf.dbHost,
    user: cnf.dbUser,
    password: cnf.dbPassword,
    database: cnf.dbDatabase,
    port: cnf.dbPort,
    ssl: cnf.dbSsl
};

const client = new pg.Client(config);

client.connect(err => {
    if (err) throw err;
    else {
        console.log("Connected");
        queryDatabase();
    }
});

function queryDatabase() {

    const Tables = `
        CREATE TABLE IF NOT EXISTS tbl_user
        (
            id                      serial PRIMARY KEY NOT NULL,
            full_name               VARCHAR(50),
            username                VARCHAR(20)        NOT NULL,
            password                VARCHAR(100)       NOT NULL,
            email                   VARCHAR(50),
            token                   VARCHAR(1000),
            education_type          INTEGER                     DEFAULT NULL,
            daytime_student_count   INTEGER                     DEFAULT NULL,
            evening_student_count   INTEGER                     DEFAULT NULL,
            advisor_study_branch_id INTEGER                     DEFAULT NULL,
            degree_id               INTEGER                     DEFAULT NULL,
            login_try_count         INTEGER            NOT NULL DEFAULT 0,
            last_request_time       VARCHAR(150)                DEFAULT 0,
            user_type               INTEGER            NOT NULL DEFAULT 2,
            app_year                INTEGER,
            state                   INTEGER            NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tbl_study_branch
        (
            id           serial PRIMARY KEY NOT NULL,
            study_branch VARCHAR(100)       NOT NULL UNIQUE,
            state        INTEGER            NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tbl_degree
        (
            id     serial PRIMARY KEY NOT NULL,
            degree VARCHAR(100)       NOT NULL UNIQUE,
            state  INTEGER            NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tbl_appeal
        (
            id              serial PRIMARY KEY NOT NULL,
            student_id      INTEGER            NOT NULL,
            advisor_id      INTEGER            NOT NULL,
            study_branch_id INTEGER                     DEFAULT NULL,
            appeal_date     VARCHAR(150),
            approval_date   VARCHAR(150),
            app_year        INTEGER,
            state           INTEGER            NOT NULL DEFAULT 2 -- {0->DENIED, 1->APPROVED, 2->WAITING}
        );

        CREATE TABLE IF NOT EXISTS tbl_password_request
        (
            id           serial PRIMARY KEY NOT NULL,
            user_id      INTEGER            NOT NULL,
            token        VARCHAR(1000)      NOT NULL,
            request_time VARCHAR(150)       NOT NULL DEFAULT now(),
            app_year     INTEGER,
            state        INTEGER            NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tbl_application_setting
        (
            id            serial PRIMARY KEY NOT NULL,
            setting       VARCHAR(100)       NOT NULL UNIQUE,
            setting_value VARCHAR(10000),
            state         INTEGER            NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tbl_application_log
        (
            id             serial PRIMARY KEY NOT NULL,
            request_header JSON               NOT NULL,
            request_body   JSON,
            request_method VARCHAR(100),
            request_api    VARCHAR(100),
            request_ip     VARCHAR(100),
            operation_date VARCHAR(150)       NOT NULL DEFAULT now(),
            state          INTEGER            NOT NULL DEFAULT 1
        );

        ALTER TABLE "tbl_user"
            ADD FOREIGN KEY ("advisor_study_branch_id") REFERENCES "tbl_study_branch" ("id");
        ALTER TABLE "tbl_appeal"
            ADD FOREIGN KEY ("study_branch_id") REFERENCES "tbl_study_branch" ("id");
        ALTER TABLE "tbl_user"
            ADD FOREIGN KEY ("degree_id") REFERENCES "tbl_degree" ("id");
        ALTER TABLE "tbl_password_request"
            ADD FOREIGN KEY ("user_id") REFERENCES "tbl_user" ("id");
        ALTER TABLE "tbl_appeal"
            ADD FOREIGN KEY ("student_id") REFERENCES "tbl_user" ("id");
        ALTER TABLE "tbl_appeal"
            ADD FOREIGN KEY ("advisor_id") REFERENCES "tbl_user" ("id");`;

    const Settings = `
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('student_access_state', 1)
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('advisor_access_state', 1)
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('app_year', 2019)
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('email_smtp_hostname', 'smtp.gmail.com')
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('email_smtp_port', 465)
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('email_address', 'bidesmanagement@gmail.com')
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('email_password', 'U1t28nKt4WuA')
        ON CONFLICT (setting) DO NOTHING;
        INSERT INTO tbl_application_setting (setting, setting_value)
        VALUES ('email_template', '<div style="width: 100%; background-color: lightgray;">
                        <div style="background-color: gray; padding: 16px 32px;">
                        <strong style="font-size: 18px; color: white;">TABİS</strong>
                        </div>
                        <div style="padding: 16px 32px;">
                        <div>
                        <p style="color: blue;">
                        \t<strong>Syn.&nbsp;{{full_name}},</strong>
                        </p>
                        <hr style="color: #404142;"/>
                        <p>
                        \t<strong>{{email_subject}}</strong>
                        </p>
                        <p style="color: #2b2c2d;">{{email_content}}</p>
                        <hr style="color: #404142;"/>
                        <p style="font-size:12px;">
                        \t<a href="{{frontend_url}}">TABİS</a>
                        </p>
                        </div>
                        </div>
                        </div>')
        ON CONFLICT (setting) DO NOTHING;

        INSERT INTO tbl_user (id, username, password, full_name, email, user_type)
        VALUES (1, 'admin', 'q', 'Admin', 'bidesmanagement@gmail.com', 0)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO tbl_study_branch (study_branch)
        VALUES ('Elektrik')
        ON CONFLICT (study_branch) DO NOTHING;
        INSERT INTO tbl_study_branch (study_branch)
        VALUES ('Elektronik')
        ON CONFLICT (study_branch) DO NOTHING;

        INSERT INTO tbl_degree (degree)
        VALUES ('Prof. Dr.')
        ON CONFLICT (degree) DO NOTHING;
        INSERT INTO tbl_degree (degree)
        VALUES ('Doç. Dr.')
        ON CONFLICT (degree) DO NOTHING;
        INSERT INTO tbl_degree (degree)
        VALUES ('Dr. Öğr. Üyesi')
        ON CONFLICT (degree) DO NOTHING;
        INSERT INTO tbl_degree (degree)
        VALUES ('Öğr. Gör.')
        ON CONFLICT (degree) DO NOTHING;`;

    client
        .query(Tables)
        .then(() => {
            client.query(Settings).then(() => {
                console.log('Table created successfully!');
            });
        })
        .catch(err => console.log(err));
}

module.exports = client;
