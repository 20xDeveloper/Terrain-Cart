const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bc05e129694b2a',
    database: 'heroku_5363822243b72ce',
    password: '64358fbc'
});

module.exports = pool.promise();