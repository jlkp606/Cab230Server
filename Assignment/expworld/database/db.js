const mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Kagamarine*1',
    database : 'webcomputing',
    port: 3307,
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = (req, res, next) => {
    req.db = connection;
    next();
}