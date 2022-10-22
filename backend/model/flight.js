// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

var db = require("./databaseConfig.js");
var moment = require("moment");

var flightDB = {
	addFlight: function (flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > addflight");
				embarkDate = moment(embarkDate, "YYYY/MM/DD HH:mm").format();
				travelTime = moment(travelTime, "H m").format("HH:mm");
				var sql = "INSERT INTO flight(flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price) VALUES (?,?,?,?,?,?,?)";
				conn.query(sql, [flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price], function (err, result) {
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
							resp = { flightid: result[0]["LAST_INSERT_ID()"] };
							console.log("[Success] Record inserted");
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	editFlight: function (flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > editflight");
				var sql = "SELECT timezone FROM airport WHERE airportid = ? LIMIT 1";
				conn.query(sql, [originAirport], function (err, result) {
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						var parsedEmbarkDate = moment.utc(`${embarkDate} ${result[0].timezone}`, `YYYY-MM-DD[T]HH:mm Z`).format();
						var sql = "UPDATE flight SET flightCode = ?, aircraft = ?, originAirport = ?, destinationAirport = ?, embarkDate = ?, travelTime = ?, price = ? WHERE flightId = ? LIMIT 1";
						conn.query(sql, [flightCode, aircraft, originAirport, destinationAirport, parsedEmbarkDate, travelTime, price, flightId], function (err, result) {
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
			}
		});
	},

	getFlights: function (callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > getflights");
				var sql = `SELECT f.flightId, f.flightCode, f.aircraft, 
				a1.name as originAirportName, a1.code as originAirportCode, a1.city as originAirportCity, a1.country as originAirportCountry, a1.description as originAirportDescription, a1.timezone as originAirportTimezone,
				a2.name as destinationAirportName, a2.code as destinationAirportCode, a2.city as destinationAirportCity, a2.country as destinationAirportCountry, a2.description as destinationAirportDescription, a2.timezone as destinationAirportTimezone,
				f.embarkDate, f.travelTime, f.price 
				FROM flight as f, airport as a1, airport as a2 
				WHERE f.originAirport = a1.airportid AND f.destinationAirport = a2.airportid`;
				conn.query(sql, function (err, result) {
					conn.end();
					if (err) {
						console.log("[Error]", err);
						return callback(err, null);
					} else {
						resp = result;
						console.log("[Success] Records fetched");
						for (var i = 0; i < resp.length; i++) {
							// To format embark dates and travel times
							resp[i]["embarkDate"] = moment(resp[i]["embarkDate"]).format("YYYY/MM/DD HH:mm");

							resp[i]["price"] = (Math.round(resp[i]["price"] * 100) / 100).toFixed(2);
						}
						console.log("[Response]", resp);
						return callback(null, resp);
					}
				});
			}
		});
	},

	getDirectFlight: function (originAirportID, destinationAirportID, embarkDate, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else if (originAirportID == destinationAirportID) {
				console.log("[Error]", "Origin and destination airport are the same");
				return callback({ errno: "418", code: "I'm a teapot", sqlMessage: "Origin and destination airport are the same." }, null, null);
			} else {
				console.log("[Connected] flight > getdirectflight");
				var sql = `SELECT f.flightId, f.flightCode, f.aircraft, 
				a1.name as originAirportName, a1.code as originAirportCode, a1.city as originAirportCity, a1.country as originAirportCountry, a1.description as originAirportDescription, a1.timezone as originAirportTimezone,
				a2.name as destinationAirportName, a2.code as destinationAirportCode, a2.city as destinationAirportCity, a2.country as destinationAirportCountry, a2.description as destinationAirportDescription, a2.timezone as destinationAirportTimezone,
				f.embarkDate, f.travelTime, f.price 
				FROM flight as f, airport as a1, airport as a2 
				WHERE f.originAirport = ? AND f.originAirport = a1.airportid AND
				f.destinationAirport = ? AND f.destinationAirport = a2.airportid`;
				conn.query(sql, [originAirportID, destinationAirportID], function (err, result) {
					if (result.length == 0) {
						console.log("[Response]", result);
						return callback(null, result);
					}
					flightCodes = [];
					for (var i = 0; i < result.length; i++) {
						// To add flight codes for checking
						flightCodes.push(`'${result[i]["flightCode"]}'`);
					}
					sql = "SELECT * FROM promo WHERE flightCode in (" + flightCodes.join(",") + ")";
					conn.query(sql, [flightCodes], function (err2, result2) {
						conn.end();
						if (err2) {
							console.log("[Error]", err2);
							return callback(err2, null);
						} else {
							resp = result;
							console.log("[Success] Records fetched");
							for (var i = 0; i < resp.length; i++) {
								// To check embark date (Timezone aware, compares provided date with embarkdate in local tz of origin flight)
								if (moment.utc(resp[i]["embarkDate"]).utcOffset(resp[i]["originAirportTimezone"]).format("YYYY-MM-DD") != embarkDate) {
									resp.splice(i, 1);
									i--;
									continue;
								}

							
								// To check if there is a promo for the flight
								for (var j = 0; j < result2.length; j++) {
									if (result2[j].flightCode == resp[i].flightCode && result2[j].price < resp[i].price && moment(resp[i].embarkDate).isBetween(moment(result2[j].start), moment(result2[j].end))) {
										console.log(`[Success] Discount applied (1st, original $${resp[i].price1})`);
										resp[i].price = result2[j].price;
									}
								}

								// To format embark dates and travel times
								resp[i]["embarkDate"] = moment(resp[i]["embarkDate"]).format("YYYY/MM/DD HH:mm");
								resp[i]["travelTime"] = moment(resp[i]["travelTime"], "HH:mm:ss").format("H [hours] m [mins]");

								resp[i]["price"] = (Math.round(resp[i]["price"] * 100) / 100).toFixed(2);
							}
							resp.sort((a, b) => a.price - b.price);
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	getFlightById: function (flightID, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > getdirectflightbyid");
				var sql = `SELECT f.flightId, f.flightCode, f.aircraft, 
				a1.name as originAirportName, a1.code as originAirportCode, a1.city as originAirportCity, a1.country as originAirportCountry, a1.description as originAirportDescription, a1.timezone as originAirportTimezone,
				a2.name as destinationAirportName, a2.code as destinationAirportCode, a2.city as destinationAirportCity, a2.country as destinationAirportCountry, a2.description as destinationAirportDescription, a2.timezone as destinationAirportTimezone,
				f.embarkDate, f.travelTime, f.price 
				FROM flight as f, airport as a1, airport as a2 
				WHERE f.flightId = ? AND f.originAirport = a1.airportid AND f.destinationAirport = a2.airportid`;
				conn.query(sql, [flightID], function (err, result) {
					if (result.length == 0) {
						console.log("[Response]", result);
						return callback(null, result);
					}
					flightCodes = [];
					for (var i = 0; i < result.length; i++) {
						// To add flight codes for checking
						flightCodes.push(`'${result[i]["flightCode"]}'`);
					}
					sql = "SELECT * FROM promo WHERE flightCode in (" + flightCodes.join(",") + ")";
					conn.query(sql, [flightCodes], function (err2, result2) {
						conn.end();
						if (err2) {
							console.log("[Error]", err2);
							return callback(err2, null);
						} else {
							resp = result;
							console.log("[Success] Records fetched");
							for (var i = 0; i < resp.length; i++) {
								// To format embark dates and travel times
								resp[i]["embarkDate"] = moment(resp[i]["embarkDate"]).format("YYYY/MM/DD HH:mm");
								// resp[i]["travelTime"] = moment(resp[i]["travelTime"], "HH:mm:ss").format("H [hours] m [mins]");

								// To check if there is a promo for the flight
								// for (var j = 0; j < result2.length; j++) {
								// 	if (result2[j].flightCode == resp[i].flightCode && result2[j].price < resp[i].price && moment(resp[i].embarkDate).isBetween(moment(result2[j].start), moment(result2[j].end))) {
								// 		console.log(`[Success] Discount applied (1st, original $${resp[i].price1})`);
								// 		resp[i].price = result2[j].price;
								// 	}
								// }

								resp[i]["price"] = (Math.round(resp[i]["price"] * 100) / 100).toFixed(2);
							}
							// resp.sort((a, b) => a.price - b.price);
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	addBooking: function (name, passport, nationality, age, userid, flightid, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > addbooking");
				var sql = "INSERT INTO bookings(name, passport, nationality, age, userid, flightid) VALUES (?,?,?,?,?,?)";
				conn.query(sql, [name, passport, nationality, age, userid, flightid], function (err, result) {
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
							resp = { bookingid: result[0]["LAST_INSERT_ID()"] };
							console.log("[Success] Record inserted");
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},

	deleteFlight: function (flightid, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > deleteflight");
				var sql = "DELETE FROM flight WHERE flightid = ? LIMIT 1";
				conn.query(sql, [flightid], function (err, result) {
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

	getTransferFlight: function (originAirportID, destinationAirportID, embarkDate, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log("[Error before connection]", err);
				return callback(err, null);
			} else {
				console.log("[Connected] flight > gettransferflight");
				var sql = `SELECT f1.flightId as firstFlightId, f2.flightId as secondFlightId, 
				f1.flightCode as flightCode1, f2.flightCode as flightCode2, 
				f1.aircraft as aircraft1, f2.aircraft as aircraft2, 
				a1.name as originAirportName, a2.name as transferAirportName, a3.name as destinationAirportName, 
				a1.code as originAirportCode, a2.code as transferAirportCode, a3.code as destinationAirportCode, 
				a1.city as originAirportCity, a2.city as transferAirportCity, a3.city as destinationAirportCity, 
				a1.country as originAirportCountry, a2.country as transferAirportCountry, a3.country as destinationAirportCountry, 
				a1.description as originAirportDescription, a2.description as transferAirportDescription, a3.description as destinationAirportDescription, 
				a1.timezone as originAirportTimezone, a2.timezone as transferAirportTimezone, a3.timezone as destinationAirportTimezone, 
				f1.price as price1, f2.price as price2, 
				f1.embarkDate as embarkDate1, f2.embarkDate as embarkDate2,
				f1.travelTime as travelTime1, f2.travelTime as travelTime2
				FROM flight as f1, flight as f2, airport as a1, airport as a2, airport as a3
				WHERE f1.originAirport = ? AND f1.originAirport = a1.airportid AND f1.destinationAirport = f2.originAirport AND a2.airportid = f2.originAirport AND f2.destinationAirport = ? AND f2.destinationAirport = a3.airportid`;
				conn.query(sql, [originAirportID, destinationAirportID], function (err, result) {
					if (err) {
						conn.end();
						console.log("[Error]", err);
						return callback(err, null);
					} else if (originAirportID == destinationAirportID) {
						console.log("[Error]", "Origin and destination airport are the same");
						return callback({ errno: "418", code: "I'm a teapot", sqlMessage: "Origin and destination airport are the same." }, null, null);
					}
					if (result.length == 0) {
						console.log("[Response]", result);
						return callback(null, result);
					}
					flightCodes = [];
					for (var i = 0; i < result.length; i++) {
						// To add flight codes for checking
						flightCodes.push(`'${result[i]["flightCode1"]}'`, `'${result[i]["flightCode2"]}'`);
					}
					sql = "SELECT * FROM promo WHERE flightCode in (" + flightCodes.join(",") + ")";
					conn.query(sql, [flightCodes], function (err2, result2) {
						conn.end();
						if (err2) {
							console.log("[Error]", err2);
							return callback(err2, null);
						} else {
							resp = result;
							console.log("[Success] Records fetched");
							for (var i = 0; i < resp.length; i++) {
								// To check f1 embark date (Timezone aware, compares provided date with embarkdate in local tz of origin flight)
								if (moment.utc(resp[i]["embarkDate1"]).utcOffset(resp[i]["originAirportTimezone"]).format("YYYY-MM-DD") != embarkDate) {
									resp.splice(i, 1);
									i--;
									continue;
								}
								// console.log("Airport tz")
								// console.log(moment.utc(resp[i]["embarkDate1"]).utcOffset(resp[i]["originAirportTimezone"]).format("YYYY-MM-DD"))
								// console.log("Embark")
								// console.log(embarkDate)

								// To check first flight + duration is before second flight
								var numTransferHours = moment(resp[i]["embarkDate1"]).add(moment.duration(resp[i]["travelTime1"], "HH:mm:ss")).diff(moment(resp[i]["embarkDate2"]), "hours");
								var checkTransferBefore = !moment(resp[i].embarkDate1).add(moment.duration(resp[i].travelTime1, "HH:mm:ss")).isBefore(moment(resp[i].embarkDate2))
								if (numTransferHours < -24 || numTransferHours > 0 || checkTransferBefore) {
									resp.splice(i, 1);
									i--;
									continue;
								}
								// console.log(moment(resp[i]["embarkDate1"]).add(moment.duration(resp[i]["travelTime1"], "HH:mm:ss")).format("YYYY-MM-DD HH:mm:ss"));
								// console.log(moment(resp[i]["embarkDate2"]).format("YYYY-MM-DD HH:mm:ss"));
								// console.log(numTransferHours)

								// To check if there is a promo for the flight
								for (var j = 0; j < result2.length; j++) {
									if (result2[j].flightCode == resp[i].flightCode1 && result2[j].price < resp[i].price1 && moment.utc(resp[i].f1embarkDate).isBetween(moment.utc(result2[j].start), moment.utc(result2[j].end))) {
										console.log(`[Success] Discount applied (1st, original $${resp[i].price1})`);
										resp[i].price1 = result2[j].price;
									} else if (result2[j].flightCode == resp[i].flightCode2 && result2[j].price < resp[i].price2 && moment.utc(resp[i].f2embarkDate).isBetween(moment.utc(result2[j].start), moment.utc(result2[j].end))) {
										console.log(`[Success] Discount applied (2nd, original $${resp[i].price2})`);
										resp[i].price2 = result2[j].price;
									}
								}
								// To format embark dates and travel times
								resp[i]["embarkDate1"] = moment(resp[i]["embarkDate1"]).format("YYYY/MM/DD HH:mm");
								resp[i]["embarkDate2"] = moment(resp[i]["embarkDate2"]).format("YYYY/MM/DD HH:mm");
								resp[i]["price"] = (Math.round((resp[i].price1 + resp[i].price2) * 100) / 100).toFixed(2);
								resp[i]["travelTime1"] = moment(resp[i]["travelTime1"], "HH:mm:ss").format("H [hours] m [mins]");
								resp[i]["travelTime2"] = moment(resp[i]["travelTime2"], "HH:mm:ss").format("H [hours] m [mins]");

								// delete resp[i].f1embarkDate;
								// delete resp[i].travelTime;
								// delete resp[i].f2embarkDate;
								delete resp[i].price1;
								delete resp[i].price2;
							}
							console.log("[Response]", resp);
							return callback(null, resp);
						}
					});
				});
			}
		});
	},
};
module.exports = flightDB;
