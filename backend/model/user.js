// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

var db = require("./databaseConfig.js");
var moment = require("moment");
var jwt = require("jsonwebtoken");
const jwtSecret = "secretkey";

var userDB = {
	addUser: function (username, email, contact, password, role, profile_pic_url, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] user > adduser");
				var sql = "INSERT INTO user(username, email, contact, password, role, profile_pic_url) VALUES (?,?,?,?,?,?)";
				conn.query(sql, [username, email, contact, password, role, profile_pic_url], function (err, result) {
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
							resp = { userid: result[0]["LAST_INSERT_ID()"] };
							console.log("[Success] Record inserted");
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	getUsers: function (callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] user > getusers");
				var sql = "SELECT * FROM user";
				conn.query(sql, function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						for (var i = 0; i < resp.length; i++) {
							delete resp[i]["password"];
							resp[i]["created_at"] = moment(resp[i].created_at).format("YYYY-MM-DD HH:mm:ss");
						}
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	getUser: function (userid, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] user > getuser");
				var sql = "SELECT * FROM user WHERE userid = ? LIMIT 1";
				conn.query(sql, [userid], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result[0];
						console.log("[Success] Record fetched");
						delete resp["password"];
						resp["created_at"] = moment(resp.created_at).format("YYYY-MM-DD HH:mm:ss");
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	updateUser: function (userid, username, email, contact, password, role, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] user > updateuser");
				var sql = "SELECT password FROM user WHERE userid = ?";
				conn.query(sql, [userid], function (err, result) {
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						if (password) {
							var pwd = password;
						} else {
							var pwd = result[0].password;
						}
					}
					console.log(pwd);

					var sql = "UPDATE user SET username=?,email=?,contact=?,password=?,role=? WHERE userid=?";
					conn.query(sql, [username, email, contact, pwd, role, userid], function (err, result) {
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
				});
			}
		});
	},
	loginUser: function (email, password, callback) {
		var conn = db.getConnection();

		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("Connected!");

				var sql = "select * from user where email=? and password=?";

				conn.query(sql, [email, password], function (err, result) {
					conn.end();

					if (err) {
						console.log("Err: " + err);
						return callback(err, null, null);
					} else {
						var token = "";
						var i;
						console.log("ok");
						console.log(result);
						if (result.length == 1) {
							token = jwt.sign({ id: result[0].userid, role: result[0].role }, jwtSecret, {
								expiresIn: 259200, //expires in 72 hrs
								algorithm: "HS256",
							});
							console.log("@@token " + token);
							return callback(null, token, result);
						} else {
							var err2 = new Error("UserID/Password does not match.");
							err2.statusCode = 401;
							return callback(err2, null, null);
						}
					}
				});
			}
		});
	},
	updateUserImage: function (id, image, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] user > updateuserimage");
				var sql = "UPDATE user SET profile_pic_url = ? WHERE userid = ?";
				conn.query(sql, [image, id], function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
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

module.exports = userDB;
