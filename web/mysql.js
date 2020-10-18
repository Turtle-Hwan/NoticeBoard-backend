var mysql = require('mysql');

var db = mysql.createConnection({
    host      : 'localhost',
    port      : '3306',
    user      : 'kim',
    password  : 'jihwan',
    database  : 'member_idpw'
});

exports.db = db;