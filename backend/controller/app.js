// Admin Number: 	p2128678
// Name: 			Matthias Chua
// Class:			DISM/FT/2B/21

const express = require("express");
const app = express();

// For bodyparser middleware
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json()); //parse application/json data
app.use(urlencodedParser);

// For cors middleware
const cors = require("cors");
app.use(cors());

// For multer middleware
const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "../frontend/public/assets/img");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
function uploadFilter(req, file, cb) {
	if (file.mimetype != "image/jpeg" && file.mimetype != "image/png") {
		cb("MulterError: File does not match the allowed mime type", false);
	} else {
		cb(null, true);
	}
}
const upload = multer({
	storage: storage,
	fileFilter: uploadFilter,
	limits: { fileSize: 1000000 },
});

// For isloggedin middleware
const isLoggedIn = require("../auth/verifyToken");

const user = require("../model/user.js");
const airport = require("../model/airport.js");
const flight = require("../model/flight.js");
const promo = require("../model/promo.js");

app.post("/users", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var username = req.body.username;
	var email = req.body.email;
	var contact = req.body.contact;
	var password = req.body.password;
	var role = req.body.role;
	var profile_pic_url = req.body.profile_pic_url;
	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	user.addUser(username, email, contact, password, role, profile_pic_url, function (err, result) {
		if (!err) {
			res.status(201).send(result);
		} else if (err.errno == 1062) {
			console.log(err);
			res.status(422).send(
				`There was an oopsie!
				422: The username or email provided already exists.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/users", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	user.getUsers(function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/users/:id", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var userid = req.params.id;
	if (req.decodedToken.id != userid) {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	user.getUser(userid, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.put("/users/:id/", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var userid = req.params.id;
	var username = req.body.username;
	var email = req.body.email;
	var contact = req.body.contact;
	var password = req.body.password;
	var role = req.body.role;

	if (req.decodedToken.id != userid) {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	user.updateUser(userid, username, email, contact, password, role, function (err, result) {
		if (!err) {
			res.status(204).send(result);
		} else if (err.errno == 1062) {
			console.log(err);
			res.status(422).send(
				`There was an oopsie!
				422: The username or email provided already exists.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.post("/airport", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var name = req.body.name;
	var code = req.body.code;
	var city = req.body.city;
	var country = req.body.country;
	var description = req.body.description;
	var timezone = req.body.timezone;
	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}
	airport.addAirport(name, code, city, country, description, timezone, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else if (err.errno == 1062) {
			console.log(err);
			res.status(422).send(
				`There was an oopsie!
				422: The airport name or code provided already exists.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/airport", function (req, res) {
	console.log("[Request]", req.method, req.url);

	airport.getAirports(function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.post("/flight", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var flightCode = req.body.flightCode;
	var aircraft = req.body.aircraft;
	var originAirport = req.body.originAirport;
	var destinationAirport = req.body.destinationAirport;
	var embarkDate = req.body.embarkDate;
	var travelTime = req.body.travelTime;
	var price = req.body.price;
	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}
	flight.addFlight(flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price, function (err, result) {
		if (!err) {
			res.status(201).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/flightDirect/:originAirportId/:destinationAirportId", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var originAirportId = req.params.originAirportId;
	var destinationAirportId = req.params.destinationAirportId;
	var embarkDate = req.query.date;

	flight.getDirectFlight(originAirportId, destinationAirportId, embarkDate, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.post("/booking/:userid/:flightid", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var name = req.body.name;
	var passport = req.body.passport;
	var nationality = req.body.nationality;
	var age = req.body.age;
	var userid = req.params.userid;
	var flightid = req.params.flightid;

	if (req.decodedToken.id != userid) {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	flight.addBooking(name, passport, nationality, age, userid, flightid, function (err, result) {
		if (!err) {
			res.status(201).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.delete("/flight/:id/", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var id = req.params.id;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	flight.deleteFlight(id, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/transfer/flight/:originAirportId/:destinationAirportId", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var originAirportId = req.params.originAirportId;
	var destinationAirportId = req.params.destinationAirportId;
	var embarkDate = req.query.date;

	flight.getTransferFlight(originAirportId, destinationAirportId, embarkDate, function (err, result) {
		if (!err) {
			// No clue why it is 201 and not 200
			res.status(201).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

// Advanced Requirement: Image Uploading
app.put("/user/upload/:id", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var userId = req.params.id;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}
	upload.single("image")(req, res, function (err) {
		if (err) {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				${err}`
			);
		} else {
			user.updateUserImage(userId, req.file.filename, function (err, result) {
				if (!err) {
					res.status(204).send(result);
				} else if (err.errno == 1062) {
					console.log(err);
					res.status(422).send(
						`There was an oopsie!
						422: The image name provided already exists.

						More details:
						[${err.errno} ${err.code}] ${err.sqlMessage}`
					);
				} else {
					console.log(err);
					res.status(500).send(
						`There was an oopsie!
						500: Unknown error.

						More details:
						[${err.errno} ${err.code}] ${err.sqlMessage}`
					);
				}
			});
		}
	});
});

// Advanced Requirement: Promotional Deals
app.post("/promo", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var flightCode = req.body.flightCode;
	var start = req.body.start;
	var end = req.body.end;
	var description = req.body.description;
	var price = req.body.price;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	promo.addPromo(flightCode, start, end, description, price, function (err, result) {
		if (!err) {
			res.status(201).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/promo/:id", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var promoId = req.params.id;

	promo.getPromoByPromoId(promoId, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/promo/flight/:flightCode", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var flightCode = req.params.flightCode;

	promo.getPromoByFlightCode(flightCode, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.delete("/promo/:id", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var promoId = req.params.id;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	promo.deletePromo(promoId, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.put("/promo/:id", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);
	var promoid = req.params.id;
	var flightCode = req.body.flightCode;
	var start = req.body.start;
	var end = req.body.end;
	var description = req.body.description;
	var price = req.body.price;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	promo.updatePromo(promoid, flightCode, start, end, description, price, function (err, result) {
		if (!err) {
			res.status(204).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

// Added endpoints for Assignment 2
app.post("/user/login", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var email = req.body.email;
	var password = req.body.password;
	console.log(req.body);

	user.loginUser(email, password, function (err, token, result) {
		if (!err) {
			delete result[0]["password"]; //clear the password in json data, do not send back to client
			res.status(200).send({ success: true, UserData: JSON.stringify(result), token: token, status: "You are successfully logged in!" });
		} else {
			res.status(500);
			console.log(err);
			res.send(err.statusCode);
		}
	});
});

app.get("/airport/:id", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var airportId = req.params.id;

	airport.getAirport(airportId, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/flight/:id/", function (req, res) {
	console.log("[Request]", req.method, req.url);
	var id = req.params.id;

	flight.getFlightById(id, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.get("/flights", function (req, res) {
	console.log("[Request]", req.method, req.url);

	flight.getFlights(function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.put("/flight", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var flightId = req.body.flightId;
	var flightCode = req.body.flightCode;
	var aircraft = req.body.aircraft;
	var originAirport = req.body.originAirport;
	var destinationAirport = req.body.destinationAirport;
	var embarkDate = req.body.embarkDate;
	var travelTime = req.body.travelTime;
	var price = req.body.price;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	flight.editFlight(flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

app.put("/airport", isLoggedIn, function (req, res) {
	console.log("[Request]", req.method, req.url);

	var airportId = req.body.airportId;
	var name = req.body.name;
	var code = req.body.code;
	var city = req.body.city;
	var country = req.body.country;
	var description = req.body.description;
	var timezone = req.body.timezone;

	if (req.decodedToken.role != "Admin") {
		res.status(401).send("401 Unauthorised: You are not allowed to perform this action.");
		return;
	}

	airport.editAirport(airportId, name, code, city, country, description, timezone, function (err, result) {
		if (!err) {
			res.status(200).send(result);
		} else if (err.errno == 1062) {
			console.log(err);
			res.status(422).send(
				`There was an oopsie!
				422: The airport name or code provided already exists.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		} else {
			console.log(err);
			res.status(500).send(
				`There was an oopsie!
				500: Unknown error.

				More details:
				[${err.errno} ${err.code}] ${err.sqlMessage}`
			);
		}
	});
});

module.exports = app;
