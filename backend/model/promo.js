// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

var db = require("./databaseConfig.js");
var moment = require("moment");

var promoDB = {
	addPromo: function (flightcode, start, end, description, price, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] promo > addpromo");
				start = moment(start, "YYYY/MM/DD HH:mm").format();
				end = moment(end, "YYYY/MM/DD HH:mm").format();
				var sql = "INSERT INTO promo(flightcode, start, end, description, price) VALUES (?,?,?,?,?)";
				conn.query(sql, [flightcode, start, end, description, price], function (err, result) {
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
							resp = { promoid: result[0]["LAST_INSERT_ID()"] };
							console.log("[Success] Record inserted");
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	getPromoByPromoId: function (promoid, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] promo > getpromobypromoid");
				var sql = "SELECT * FROM promo WHERE promoid = ? LIMIT 1";
				conn.query(sql, [promoid], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						for (var i = 0; i < resp.length; i++) {
							resp[i]["start"] = moment(resp[i]["start"]).format("YYYY/MM/DD HH:mm");
							resp[i]["end"] = moment(resp[i]["end"]).format("YYYY/MM/DD HH:mm");
							resp[i]["price"] = (Math.round(resp[i]["price"] * 100) / 100).toFixed(2);
						}
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	getPromoByFlightCode: function (flightcode, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] promo > getpromobyflightcode");
				var sql = "SELECT * FROM promo WHERE flightCode = ?";
				conn.query(sql, [flightcode], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						for (var i = 0; i < resp.length; i++) {
							resp[i]["start"] = moment(resp[i]["start"]).format("YYYY/MM/DD HH:mm");
							resp[i]["end"] = moment(resp[i]["end"]).format("YYYY/MM/DD HH:mm");
							resp[i]["price"] = (Math.round(resp[i]["price"] * 100) / 100).toFixed(2);
						}
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	deletePromo: function (promoid, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] promo > deletepromo");
				var sql = "DELETE FROM promo WHERE promoid = ? LIMIT 1";
				conn.query(sql, [promoid], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else if (result.affectedRows == 0) {
						console.log("[Error]", "No record found");
						return callback({ errno: "418", code: "I'm a teapot", sqlMessage: "No record found matching ID" }, null);
					} else {
						resp = { Message: "Deletion successful" };
						console.log("[Success] Record updated");
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

    updatePromo: function (promoid, flightcode, start, end, description, price, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] promo > updatepromo");
				start = moment(start, "YYYY/MM/DD HH:mm").format();
				end = moment(end, "YYYY/MM/DD HH:mm").format();
				var sql = "UPDATE promo SET flightcode=?,start=?,end=?,description=?,price=? WHERE promoid=?";
				conn.query(sql, [flightcode, start, end, description, price, promoid], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else if (result.affectedRows == 0) {
						console.log("[Error]", "No record found");
						return callback({ errno: "418", code: "I'm a teapot", sqlMessage: "No record found matching ID." }, null);
					} else {
						resp = result;
						console.log("[Success] Record updated");
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},
};

module.exports = promoDB;
