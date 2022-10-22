// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

var db = require("./databaseConfig.js");

var airportDB = {
	addAirport: function (name, code, city, country, description, timezone, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] airport > addairport");
				var sql = "INSERT INTO airport(name, code, city, country, description, timezone) VALUES (?,?,?,?,?,?)";
				conn.query(sql, [name, code, city, country, description, timezone], function (err, result) {
					if (err) {
						conn.end();
						console.log("[Error]", err);
						return callback(err, null);
					}
					var sql = "SELECT LAST_INSERT_ID()";
					conn.query(sql, [], function (err, result) {
						conn.end();
						if (err) {
							console.log("[Error]", err);
							return callback(err, null);
						} else {
							resp = { airportid: result[0]["LAST_INSERT_ID()"] };
							console.log("[Success] Record inserted");
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	editAirport: function (airportId, name, code, city, country, description, timezone, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] airport > addairport");
				var sql = "UPDATE airport SET name = ?, code = ?, city = ?, country = ?, description = ?, timezone = ? WHERE airportid = ? LIMIT 1";
				conn.query(sql, [name, code, city, country, description, timezone, airportId], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Record inserted");
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	getAirport: function (airportId, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] airport > getairport");
				var sql = "SELECT * FROM airport WHERE airportid = ?";
				conn.query(sql, [airportId], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						// for (var i = 0; i < resp.length; i++) {
						// 	delete resp[i]["description"];
						// }
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	getAirports: function (callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] airport > getairports");
				var sql = "SELECT * FROM airport";
				conn.query(sql, function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	
};

module.exports = airportDB;
