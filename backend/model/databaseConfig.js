// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

var mysql = require('mysql');
var dbconnect = {
    getConnection: function () {
        var conn = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "password",
            database: "spair"
        });     
        return conn;
    }
};
module.exports = dbconnect
