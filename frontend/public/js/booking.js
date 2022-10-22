$(document).ready(function () {
	// API url
	const baseUrl = "http://localhost:8081";

	// Call data about user from localStorage
	var userInfo = localStorage.getItem("userInfo");
	var userToken = localStorage.getItem("token");

	// Force login if no login found
	if (!userInfo || !userToken) {
		$("#modalLogin").modal("show");
	} else {
		userInfo = JSON.parse(userInfo);
		$(".placeholderListing").remove();

		var prices = [];
		var bookedFlights = [];
		// Populate values depart
		if (localStorage.getItem("departTransferFlight") == "true") {
			d1 = JSON.parse(localStorage.getItem("departFlight1"));
			d2 = JSON.parse(localStorage.getItem("departFlight2"));
			// Populate upper flight detail bar
			flights = [d1.flightId, d2.flightId];
			axios
				.get(`${baseUrl}/flight/${flights[0]}`)
				.then((response1) => {
					axios
						.get(`${baseUrl}/flight/${flights[1]}`)
						.then((response2) => {
							// Update flight status bar at the top
							var flight1 = response1.data[0];
							var flight2 = response2.data[0];
							var departure = moment.utc(flight1.embarkDate, "YYYY/MM/DD HH:mm");
							var arrival = moment.utc(flight2.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight2.travelTime, "H m").format("HH:mm")));
							arrivalDate = moment(arrival.utcOffset(flight2.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							departureDate = moment(departure.utcOffset(flight1.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							if (arrivalDate.diff(departureDate, "days") != 0) {
								var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
							} else {
								var nextDay = "";
							}
							$("#detailsDepartOrigin").html(`<span class="flight-details-date">${departure.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight1.originAirportCode} ${departure.utcOffset(flight1.originAirportTimezone).format("HH:mm")}</span><span class="flight-details-city-after">${flight1.originAirportCity}</span>`);
							$("#detailsDepartDestination").html(`<span class="flight-details-date">${arrival.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight2.destinationAirportCode} ${arrival.utcOffset(flight2.destinationAirportTimezone).format("HH:mm")}${nextDay}</span><span class="flight-details-city-after">${flight2.destinationAirportCity}</span>`);

							// Populate side flight bar
							$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight1.originAirportCode} - ${flight1.destinationAirportCode}</h6>
                              <small class="text-muted">${departure.utcOffset(flight1.originAirportTimezone).format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight1.price}</span>
                          </li>`);
							prices.push(parseFloat(flight1.price));
							bookedFlights.push(parseInt(flight1.flightId));
							$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight2.originAirportCode} - ${flight2.destinationAirportCode}</h6>
                              <small class="text-muted">${moment.utc(flight2.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight2.originAirportTimezone).format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight2.price}</span>
                          </li>`);
							prices.push(parseFloat(flight2.price));
							bookedFlights.push(parseInt(flight2.flightId));
							displayArrive();
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			d1 = JSON.parse(localStorage.getItem("departFlight1"));
			// Populate upper flight detail bar
			axios
				.get(`${baseUrl}/flight/${d1.flightId}`)
				.then((response) => {
					// Update flight status bar at the top
					var flight = response.data[0];
					var departure = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm");
					var arrival = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime, "H m").format("HH:mm")));
					arrivalDate = moment(arrival.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
					departureDate = moment(departure.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
					if (arrivalDate.diff(departureDate, "days") != 0) {
						var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
					} else {
						var nextDay = "";
					}
					$("#detailsDepartOrigin").html(`<span class="flight-details-date">${departure.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight.originAirportCode} ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}</span><span class="flight-details-city-after">${flight.originAirportCity}</span>`);
					$("#detailsDepartDestination").html(`<span class="flight-details-date">${arrival.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight.destinationAirportCode} ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}</span><span class="flight-details-city-after">${flight.destinationAirportCity}</span>`);
					// Populate side flight bar
					$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight.originAirportCode} - ${flight.destinationAirportCode}</h6>
                              <small class="text-muted">${departure.format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight.price}</span>
                          </li>`);
					prices.push(parseFloat(flight.price));
					bookedFlights.push(parseInt(flight.flightId));
					displayArrive();
				})
				.catch((error) => {
					console.log(error);
				});
		}

		// Populate values arrive
		function displayArrive() {
			if (localStorage.getItem("arriveTransferFlight") == "true" && localStorage.getItem("arriveFlight1") != null) {
				a1 = JSON.parse(localStorage.getItem("arriveFlight1"));
				a2 = JSON.parse(localStorage.getItem("arriveFlight2"));
				// Populate upper flight detail bar
				flights = [a1.flightId, a2.flightId];
				axios
					.get(`${baseUrl}/flight/${flights[0]}`)
					.then((response1) => {
						axios
							.get(`${baseUrl}/flight/${flights[1]}`)
							.then((response2) => {
								// Update flight status bar at the top
								var flight1 = response1.data[0];
								var flight2 = response2.data[0];
								var departure = moment.utc(flight1.embarkDate, "YYYY/MM/DD HH:mm");
								var arrival = moment.utc(flight2.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight2.travelTime, "H m").format("HH:mm")));
								arrivalDate = moment(arrival.utcOffset(flight2.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								departureDate = moment(departure.utcOffset(flight1.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								if (arrivalDate.diff(departureDate, "days") != 0) {
									var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
								} else {
									var nextDay = "";
								}
								$("#detailsArriveOrigin").html(`<span class="flight-details-date">${departure.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight1.originAirportCode} ${departure.utcOffset(flight1.originAirportTimezone).format("HH:mm")}</span><span class="flight-details-city-after">${flight1.originAirportCity}</span>`);
								$("#detailsArriveDestination").html(`<span class="flight-details-date">${arrival.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight2.destinationAirportCode} ${arrival.utcOffset(flight2.destinationAirportTimezone).format("HH:mm")}${nextDay}</span><span class="flight-details-city-after">${flight2.destinationAirportCity}</span>`);
								// Populate side flight bar
								$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight1.originAirportCode} - ${flight1.destinationAirportCode}</h6>
                              <small class="text-muted">${departure.utcOffset(flight1.originAirportTimezone).format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight1.price}</span>
                          </li>`);
								prices.push(parseFloat(flight1.price));
								bookedFlights.push(parseInt(flight1.flightId));
								$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight2.originAirportCode} - ${flight2.destinationAirportCode}</h6>
                              <small class="text-muted">${moment.utc(flight2.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight2.originAirportTimezone).format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight2.price}</span>
                          </li>`);
								prices.push(parseFloat(flight2.price));
								bookedFlights.push(parseInt(flight2.flightId));
								displayTotalPrice();
							})
							.catch((error) => {
								console.log(error);
							});
					})
					.catch((error) => {
						console.log(error);
					});
			} else if (localStorage.getItem("arriveFlight1") != null) {
				a1 = JSON.parse(localStorage.getItem("arriveFlight1"));
				// Populate upper flight detail bar
				axios
					.get(`${baseUrl}/flight/${a1.flightId}`)
					.then((response) => {
						// Update flight status bar at the top
						var flight = response.data[0];
						var departure = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm");
						var arrival = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime, "H m").format("HH:mm")));
						arrivalDate = moment(arrival.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
						departureDate = moment(departure.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
						if (arrivalDate.diff(departureDate, "days") != 0) {
							var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
						} else {
							var nextDay = "";
						}
						$("#detailsArriveOrigin").html(`<span class="flight-details-date">${departure.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight.originAirportCode} ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}</span><span class="flight-details-city-after">${flight.originAirportCity}</span>`);
						$("#detailsArriveDestination").html(`<span class="flight-details-date">${arrival.format("DD MMM (ddd)")}<br></span><span class="flight-details-city">${flight.destinationAirportCode} ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}</span><span class="flight-details-city-after">${flight.destinationAirportCity}</span>`);
						// Populate side flight bar
						$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                              <h6 class="my-0">${flight.originAirportCode} - ${flight.destinationAirportCode}</h6>
                              <small class="text-muted">${departure.format("DD MMM (ddd)")}</small>
                            </div>
                            <span class="text-muted">$${flight.price}</span>
                          </li>`);
						prices.push(parseFloat(flight.price));
						bookedFlights.push(parseInt(flight.flightId));
						displayTotalPrice();
					})
					.catch((error) => {
						console.log(error);
					});
			} else {
				$(".arriveRight").remove();
                displayTotalPrice();
			}
		}
		function displayTotalPrice() {
			console.log(prices);
			$("#flightListing").append(`<li class="list-group-item d-flex justify-content-between lh-sm">
              <h6 class="my-0">Total (SGD)</h6>
            <strong>$${prices.reduce((partialSum, a) => partialSum + a, 0).toFixed(2)}</strong>
          </li>`);
		}

		// Handle forms
		$("#passengerInfoForm").submit(function () {
			if ($("#name").val() != "" && $("#nationality").val() != "" && $("#passport").val() != "" && $("#age").val() != "") {
				$("#passengerInfoForm").addClass("d-none");
				$("#paymentForm").removeClass("d-none");
				$(".paymentField").removeAttr("disabled");
				$("#paymentForm > div > button.btn").removeClass("disabled");
				$(".progress-bar-item_info").addClass("active");
			}
			return false;
		});

		$("#paymentForm").submit(function () {
			// Make request to backend for booking
			data = {
				name: $("#name").val(),
				passport: $("#passport").val(),
				nationality: $("#nationality").val(),
				age: $("#age").val(),
			};
			for (const [index, flightid] of bookedFlights.entries()) {
				axios
					.post(`${baseUrl}/booking/${userInfo.userid}/${flightid}`, data, {
						headers: {
							Authorization: userToken,
						},
					})
					.then((response) => {
						console.log(`Booking Successful: user ${userInfo.userid} flight ${flightid}`);
						console.log(index);
					})
					.catch((error) => {
						console.log(error);
					});
			}
			$("#successModalContent > .modal-body").text(`Booking successful. More info: flights ${bookedFlights.join(", ")}`);
			$("#successModal").modal("show");
			// Return to home page
		});
	}

	$("#successModal").on("hide.bs.modal", (e) => {
		window.location.assign(window.location.origin + "/");
	});
});
