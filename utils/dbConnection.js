const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'nodejs_login'
});

module.exports = dbConnection.promise();