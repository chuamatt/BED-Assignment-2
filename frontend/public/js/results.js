$(document).ready(function () {
	// API url
	const baseUrl = "http://localhost:8081";

	// Function used to read url params
	// Source for following function: Sitepoint (https://www.sitepoint.com/url-parameters-jquery/)
	$.urlParam = function (name) {
		var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.href);
		if (results == null) {
			return null;
		} else {
			return results[1] || 0;
		}
	};

	// Returns to the home page if no query params
	if (!$.urlParam("type") || !$.urlParam("from") || !$.urlParam("to") || !$.urlParam("fromDate")) {
		window.location.assign(window.location.origin + "/");
	}
	localStorage.removeItem("departFlight1");
	localStorage.removeItem("departFlight2");
	localStorage.removeItem("arriveFlight1");
	localStorage.removeItem("arriveFlight2");
	localStorage.removeItem("departTransferFlight");
	localStorage.removeItem("arriveTransferFlight");

	// decodeURIComponent($.urlParam("to"))
	const originAirportId = $.urlParam("from");
	const destinationAirportId = $.urlParam("to");

	axios
		.get(`${baseUrl}/airport/${originAirportId}`)
		.then((response1) => {
			axios
				.get(`${baseUrl}/airport/${destinationAirportId}`)
				.then((response2) => {
					if ($.urlParam("type") != "oneway") {
						var flightDetailsHtml = `
                        <div class="col">
                            <span class="flight-details-header">Departing</span>
                            <div class="row d-none d-md-flex">
                                <div class="col-5" id="detailsDepartOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane"></div>
                                </div>
                                <div class="col-5 offset-1 ps-0" id="detailsDepartDestination">
                                <span class="flight-details-date"><br></span>
                                <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].code} - ${response2.data[0].code}</span>
                                </div>
                        </div>
                        <div class="vr p-0 mx-3"></div>
                        <div class="col">
                            <span class="flight-details-header">Arriving</span>
                            <div class="row d-none d-md-flex">
                                <div class="col-5" id="detailsArriveOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("toDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane"></div>
                                </div>
                                <div class="col-5 offset-1 ps-0" id="detailsArriveDestination">
                                    <span class="flight-details-date"><br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("toDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response2.data[0].code} - ${response1.data[0].code}</span>
                                </div>                            </div>
                        </div>
                        `;
					} else {
						var flightDetailsHtml = `
                        <div class="col">
                            <div class="row d-none d-md-flex justify-content-center">
                                <div class="col-5 col-lg-3 offset-lg-2" id="detailsDepartOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane mt-3"></div>
                                </div>
                                <div class="col-4 offset-1 ps-0" id="detailsDepartDestination">
                                <span class="flight-details-date"><br></span>
                                <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].code} - ${response2.data[0].code}</span>
                                </div>
                        </div>
                        `;
					}
					$(".flight-details").html(flightDetailsHtml);
					// $("#detailsArriveDestination span.flight-details-date").text("hi");

					$("#departHeader").text(`Flight from ${response1.data[0].city} to ${response2.data[0].city}`).removeClass("d-none");
					if ($.urlParam("type") != "oneway") {
						$("#arriveHeader").text(`Flight from ${response2.data[0].city} to ${response1.data[0].city}`).removeClass("d-none");
					} else {
						$("#arriveRow").remove();
					}
				})
				.catch((error) => {
					console.log(error);
				});
		})
		.catch((error) => {
			console.log(error);
		});

	axios
		.get(`${baseUrl}/flightDirect/${originAirportId}/${destinationAirportId}?date=${$.urlParam("fromDate")}`)
		.then((response) => {
			const flights = response.data;
			if (flights.length == 0) {
				$("#departAccordion").append(`<div class="alert alert-danger text-center" role="alert">No flights found for your selected date and city pair, try a different date?</div>`);
			} else {
				flights.forEach(function (flight, index) {
					var departure = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm");
					var arrival = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime, "H m").format("HH:mm")));
					arrivalDate = moment(arrival.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
					departureDate = moment(departure.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
					if (arrivalDate.diff(departureDate, "days") != 0) {
						var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
					} else {
						var nextDay = "";
					}
					var accordionHtml = `
                    <div class="accordion-item" id="accordionItemDepartrd${index}">
                    <h2 class="accordion-header" id="headingDepartrd${index}">
                        <button class="accordion-button collapsed shadow-none" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapseDepartrd${index}" aria-expanded="false"
                            aria-controls="collapseDepartrd${index}" data-flightid="rd${flight.flightId}">
                            <div class="row justify-content-between w-100 me-3">
                                <div class="row justify-content-between w-100 me-3 mb-3">
                                    <div class="col-auto">
                                        Nonstop • ${flight.travelTime}
                                    </div>
                                </div>
                                <div class="row w-100 me-3">
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.originAirportCode} ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br></span>
                                        <span class="flight-city">${flight.originAirportCity}<br></span>
                                        <span class="flight-date">${departure.utcOffset(flight.originAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                    <div class="transfer col-4 my-auto text-center">
                                        <div class="airplane"></div>
                                    </div>
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.destinationAirportCode} ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}<br></span>
                                        <span class="flight-city">${flight.destinationAirportCity}<br></span>
                                        <span class="flight-date">${arrival.utcOffset(flight.destinationAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                </div>
                            </div>
                            <div class="price col-12 col-md-2 text-center">

                                <span class="price-from">From SGD<br></span>
                                <span class="price-value departPrice">${flight.price}<br></span>
                                <div class="down-arrow"></div>
                            </div>

                        </button>
                    </h2>
                    <div id="collapseDepartrd${index}" class="accordion-collapse collapse" aria-labelledby="headingDepartrd${index}"
                        data-bs-parent="#departAccordion">
                        <div class="accordion-body">
                            <div class="row align-items-center">
                                <div class="col-12 col-md-10">
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode} • ${flight.aircraft}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                    ${flight.travelTime}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br>
                                                ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.originAirportCode} ${flight.originAirportName}<br>
                                                ${flight.destinationAirportCode} ${flight.destinationAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-2 text-center">
                                    <button type="button" class="btn btn-primary shadow-none selectDepartFlight" data-flightid="rd${flight.flightId}" data-index="rd${index}">Select</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    `;

					$("#departAccordion").append(accordionHtml);
				});
			}
			if (!($.urlParam("directOnly") == "True")) {
				axios
					.get(`${baseUrl}/transfer/flight/${originAirportId}/${destinationAirportId}?date=${$.urlParam("fromDate")}`)
					.then((response) => {
						const flights = response.data;
						if (flights.length != 0 && $("#departAccordion > .alert-danger").length) {
							// Check if there is an existing alert, if yes, remove it
							$("#departAccordion > .alert-danger").remove();
						} else if (flights.length == 0) {
							return;
						}
						flights.forEach(function (flight, index) {
							var departure1 = moment.utc(flight.embarkDate1, "YYYY/MM/DD HH:mm");
							var arrival1 = moment.utc(flight.embarkDate1, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime1, "H m").format("HH:mm")));
							arrivalDate1 = moment(arrival1.utcOffset(flight.transferAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							departureDate1 = moment(departure1.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							if (arrivalDate1.diff(departureDate1, "days") != 0) {
								var nextDay1 = `<span class="next-day">+${arrivalDate1.diff(departureDate1, "days")}</span>`;
							} else {
								var nextDay1 = "";
							}
							var departure2 = moment.utc(flight.embarkDate2, "YYYY/MM/DD HH:mm");
							var arrival2 = moment.utc(flight.embarkDate2, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime2, "H m").format("HH:mm")));
							arrivalDate2 = moment(arrival2.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							departureDate2 = moment(departure2.utcOffset(flight.transferAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
							if (arrivalDate2.diff(departureDate2, "days") != 0) {
								var nextDay2 = `<span class="next-day">+${arrivalDate2.diff(departureDate2, "days")}</span>`;
							} else {
								var nextDay2 = "";
							}
							if (arrivalDate2.diff(departureDate1, "days") != 0) {
								var nextDay3 = `<span class="next-day">+${arrivalDate2.diff(departureDate1, "days")}</span>`;
							} else {
								var nextDay3 = "";
							}
							var transfer = moment.duration(departure2.diff(arrival1));
							var transferDurationShort = transfer.hours() + "h " + transfer.minutes() + "min";
							var transferDurationLong = transfer.hours() + " hours " + transfer.minutes() + " mins";
							var total = moment.duration(arrival2.diff(departure1));
							var totalDuration = total.hours() + total.days() * 24 + " hours " + total.minutes() + " mins";
							var accordionHtml = `
                    <div class="accordion-item" id="accordionItemDepart${index}">
                    <h2 class="accordion-header" id="headingDepart${index}">
                        <button class="accordion-button collapsed shadow-none" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapseDepart${index}" aria-expanded="false"
                            aria-controls="collapseDepart${index}" data-flightid="rt${flight.firstFlightId}//${flight.secondFlightId}">
                            <div class="row justify-content-between w-100 me-3">
                                <div class="row justify-content-between w-100 me-3 mb-3">
                                    <div class="col-auto">
                                        1 stop • ${totalDuration}
                                    </div>
                                </div>
                                <div class="row w-100 me-3">
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.originAirportCode} ${departure1.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br></span>
                                        <span class="flight-city">${flight.originAirportCity}<br></span>
                                        <span class="flight-date">${departure1.utcOffset(flight.originAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                    <div class="transfer col-4 my-auto text-center">
                                        <span class="flight-transfer">${flight.transferAirportCity} (${flight.transferAirportCode})<br></span>
                                        <div class="circle"></div>
                                        <span class="flight-transfer">${transferDurationShort}<br></span>
                                    </div>
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.destinationAirportCode} ${arrival2.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay3}<br></span>
                                        <span class="flight-city">${flight.destinationAirportCity}<br></span>
                                        <span class="flight-date">${arrival2.utcOffset(flight.destinationAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                </div>
                            </div>
                            <div class="price col-12 col-md-2 text-center">

                                <span class="price-from">From SGD<br></span>
                                <span class="price-value departPrice">${flight.price}<br></span>
                                <div class="down-arrow"></div>
                            </div>

                        </button>
                    </h2>
                    <div id="collapseDepart${index}" class="accordion-collapse collapse" aria-labelledby="headingDepart${index}"
                        data-bs-parent="#departAccordion">
                        <div class="accordion-body">
                            <div class="row align-items-center">
                                <div class="col-12 col-md-10">
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode1} • ${flight.aircraft1}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                ${flight.travelTime1}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure1.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br>
                                                ${arrival1.utcOffset(flight.transferAirportTimezone).format("HH:mm")}${nextDay1}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.originAirportCode} ${flight.originAirportName}<br>
                                                ${flight.transferAirportCode} ${flight.transferAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-auto">
                                                    ${transferDurationLong}
                                                </div>
                                                <div class="col-auto">
                                                    Layover in ${flight.transferAirportDescription} (${flight.transferAirportCode})
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode2} • ${flight.aircraft2}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                    ${flight.travelTime2}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure2.utcOffset(flight.transferAirportTimezone).format("HH:mm")}<br>
                                                ${arrival2.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay2}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.transferAirportCode} ${flight.transferAirportName}
                                                <br>
                                                ${flight.destinationAirportCode} ${flight.destinationAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-2 text-center">
                                    <button type="button" class="btn btn-primary shadow-none selectDepartFlight" data-flightid="rt${flight.firstFlightId}//${flight.secondFlightId}" data-index="${index}">Select</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    `;

							$("#departAccordion").append(accordionHtml);
						});
					})
					.catch((error) => {
						console.log(error);
					});
			}
		})
		.catch((error) => {
			console.log(error);
		});

	if ($.urlParam("type") == "return") {
		axios
			.get(`${baseUrl}/flightDirect/${destinationAirportId}/${originAirportId}?date=${$.urlParam("toDate")}`)
			.then((response) => {
				const flights = response.data;
				if (flights.length == 0) {
					$("#arriveAccordion").append(`<div class="alert alert-danger text-center" role="alert">No flights found for your selected date and city pair, try a different date?</div>`);
				} else {
					flights.forEach(function (flight, index) {
						var departure = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm");
						var arrival = moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime, "H m").format("HH:mm")));
						arrivalDate = moment(arrival.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
						departureDate = moment(departure.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
						if (arrivalDate.diff(departureDate, "days") != 0) {
							var nextDay = `<span class="next-day">+${arrivalDate.diff(departureDate, "days")}</span>`;
						} else {
							var nextDay = "";
						}
						var accordionHtml = `
                    <div class="accordion-item">
                    <h2 class="accordion-header" id="headingArrivera${index}">
                        <button class="accordion-button collapsed shadow-none" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapseArrivera${index}" aria-expanded="false"
                            aria-controls="collapseArrivera${index}" data-flightid="rd${flight.flightId}">
                            <div class="row justify-content-between w-100 me-3">
                                <div class="row justify-content-between w-100 me-3 mb-3">
                                    <div class="col-auto">
                                        Nonstop • ${flight.travelTime}
                                    </div>
                                </div>
                                <div class="row w-100 me-3">
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.originAirportCode} ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br></span>
                                        <span class="flight-city">${flight.originAirportCity}<br></span>
                                        <span class="flight-date">${departure.utcOffset(flight.originAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                    <div class="transfer col-4 my-auto text-center">
                                        <div class="airplane"></div>
                                    </div>
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.destinationAirportCode} ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}<br></span>
                                        <span class="flight-city">${flight.destinationAirportCity}<br></span>
                                        <span class="flight-date">${arrival.utcOffset(flight.destinationAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                </div>
                            </div>
                            <div class="price price-return col-12 col-md-2 text-center">

                                <span class="price-from">Select first flight<br>to view fares<br></span>
                                <span class="price-value d-none">${flight.price}<br></span>
                                <div class="down-arrow"></div>
                            </div>

                        </button>
                    </h2>
                    <div id="collapseArrivera${index}" class="accordion-collapse collapse" aria-labelledby="headingArrivera${index}"
                        data-bs-parent="#arriveAccordion">
                        <div class="accordion-body">
                            <div class="row align-items-center">
                                <div class="col-12 col-md-10">
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode} • ${flight.aircraft}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                    ${flight.travelTime}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br>
                                                ${arrival.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.originAirportCode} ${flight.originAirportName}<br>
                                                ${flight.destinationAirportCode} ${flight.destinationAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-2 text-center">
                                    <button type="button" class="btn btn-primary shadow-none selectArriveFlight disabled" data-flightid="rd${flight.flightId}" data-index="ra${index}">Select</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    `;

						$("#arriveAccordion").append(accordionHtml);
					});
				}
				if (!($.urlParam("directOnly") == "True")) {
					axios
						.get(`${baseUrl}/transfer/flight/${destinationAirportId}/${originAirportId}?date=${$.urlParam("toDate")}`)
						.then((response) => {
							const flights = response.data;
							if (flights.length != 0 && $("#arriveAccordion > .alert-danger").length) {
								// Check if there is an existing alert, if yes, remove it
								$("#arriveAccordion > .alert-danger").remove();
							} else if (flights.length == 0) {
								return;
							}
							flights.forEach(function (flight, index) {
								var departure1 = moment.utc(flight.embarkDate1, "YYYY/MM/DD HH:mm");
								var arrival1 = moment.utc(flight.embarkDate1, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime1, "H m").format("HH:mm")));
								arrivalDate1 = moment(arrival1.utcOffset(flight.transferAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								departureDate1 = moment(departure1.utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								if (arrivalDate1.diff(departureDate1, "days") != 0) {
									var nextDay1 = `<span class="next-day">+${arrivalDate1.diff(departureDate1, "days")}</span>`;
								} else {
									var nextDay1 = "";
								}
								var departure2 = moment.utc(flight.embarkDate2, "YYYY/MM/DD HH:mm");
								var arrival2 = moment.utc(flight.embarkDate2, "YYYY/MM/DD HH:mm").add(moment.duration(moment(flight.travelTime2, "H m").format("HH:mm")));
								arrivalDate2 = moment(arrival2.utcOffset(flight.destinationAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								departureDate2 = moment(departure2.utcOffset(flight.transferAirportTimezone).format("YYYY/MM/DD"), "YYYY/MM/DD");
								if (arrivalDate2.diff(departureDate2, "days") != 0) {
									var nextDay2 = `<span class="next-day">+${arrivalDate2.diff(departureDate2, "days")}</span>`;
								} else {
									var nextDay2 = "";
								}
								if (arrivalDate2.diff(departureDate1, "days") != 0) {
									var nextDay3 = `<span class="next-day">+${arrivalDate2.diff(departureDate1, "days")}</span>`;
								} else {
									var nextDay3 = "";
								}
								var transfer = moment.duration(departure2.diff(arrival1));
								var transferDurationShort = transfer.hours() + "h " + transfer.minutes() + "min";
								var transferDurationLong = transfer.hours() + " hours " + transfer.minutes() + " mins";
								var total = moment.duration(arrival2.diff(departure1));
								var totalDuration = total.hours() + total.days() * 24 + " hours " + total.minutes() + " mins";
								var accordionHtml = `
                    <div class="accordion-item" id="accordionItemArrive${index}">
                    <h2 class="accordion-header" id="headingArrive${index}">
                        <button class="accordion-button collapsed shadow-none" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapseArrive${index}" aria-expanded="false"
                            aria-controls="collapseArrive${index}" data-flightid="rt${flight.firstFlightId}//${flight.secondFlightId}">
                            <div class="row justify-content-between w-100 me-3">
                                <div class="row justify-content-between w-100 me-3 mb-3">
                                    <div class="col-auto">
                                        1 stop • ${totalDuration}
                                    </div>
                                </div>
                                <div class="row w-100 me-3">
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.originAirportCode} ${departure1.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br></span>
                                        <span class="flight-city">${flight.originAirportCity}<br></span>
                                        <span class="flight-date">${departure1.utcOffset(flight.originAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                    <div class="transfer col-4 my-auto text-center">
                                        <span class="flight-transfer">${flight.transferAirportCity} (${flight.transferAirportCode})<br></span>
                                        <div class="circle"></div>
                                        <span class="flight-transfer">${transferDurationShort}<br></span>
                                    </div>
                                    <div class="col-auto">
                                        <span class="flight-time">${flight.destinationAirportCode} ${arrival2.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay3}<br></span>
                                        <span class="flight-city">${flight.destinationAirportCity}<br></span>
                                        <span class="flight-date">${arrival2.utcOffset(flight.destinationAirportTimezone).format("DD MMM (ddd)")}<br></span>
                                    </div>
                                </div>
                            </div>
                            <div class="price price-return col-12 col-md-2 text-center">

                                <span class="price-from">Select first flight<br>to view fares<br></span>
                                <span class="price-value d-none">${flight.price}<br></span>
                                <div class="down-arrow"></div>
                            </div>

                        </button>
                    </h2>
                    <div id="collapseArrive${index}" class="accordion-collapse collapse" aria-labelledby="headingArrive${index}"
                        data-bs-parent="#arriveAccordion">
                        <div class="accordion-body">
                            <div class="row align-items-center">
                                <div class="col-12 col-md-10">
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode1} • ${flight.aircraft1}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                ${flight.travelTime1}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure1.utcOffset(flight.originAirportTimezone).format("HH:mm")}<br>
                                                ${arrival1.utcOffset(flight.transferAirportTimezone).format("HH:mm")}${nextDay1}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.originAirportCode} ${flight.originAirportName}<br>
                                                ${flight.transferAirportCode} ${flight.transferAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-auto">
                                                    ${transferDurationLong}
                                                </div>
                                                <div class="col-auto">
                                                    Layover in ${flight.transferAirportDescription} (${flight.transferAirportCode})
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card mb-2">
                                        <div class="card-body">
                                            ${flight.flightCode2} • ${flight.aircraft2}
                                            <div class="row mt-1">
                                                <div class="timeline-duration col-auto">
                                                    ${flight.travelTime2}
                                                </div>
                                                <div class="timeline col-auto">
                                                    <div class="timeline-track">

                                                    </div>
                                                </div>
                                                <div class="timeline-timing col-auto">
                                                ${departure2.utcOffset(flight.transferAirportTimezone).format("HH:mm")}<br>
                                                ${arrival2.utcOffset(flight.destinationAirportTimezone).format("HH:mm")}${nextDay2}
                                                </div>
                                                <div class="timeline-airport col-auto">
                                                ${flight.transferAirportCode} ${flight.transferAirportName}
                                                <br>
                                                ${flight.destinationAirportCode} ${flight.destinationAirportName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-2 text-center">
                                    <button type="button" class="btn btn-primary shadow-none selectArriveFlight disabled" data-flightid="rt${flight.firstFlightId}//${flight.secondFlightId}" data-index="${index}">Select</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    `;

								$("#arriveAccordion").append(accordionHtml);
							});
						})
						.catch((error) => {
							console.log(error);
						});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	$(document).on("click", ".selectDepartFlight", () => {
		// Check whether one way or return flight
		if ($.urlParam("type") == "return") {
			// Check what depart flight is selected
			alert(`Selected flight ${$(event.target).data("flightid")}`);

			// Remove all other depart flights
			$("#departAccordion > .accordion-item").addClass("d-none");

			// Show selected depart flight
			$("#departAccordion > .accordion-item#accordionItemDepart" + $(event.target).data("index")).removeClass("d-none");

			// Replace select depart flight with change flight button
			$('.selectDepartFlight[data-index="' + $(event.target).data("index") + '"]')
				.text("Modify")
				.removeClass("selectDepartFlight")
				.addClass("changeDepartFlight");

			// Figure out if it's a transfer or direct flight
			if (String($(event.target).data("flightid")).slice(0, 2) == "rd") {
				// Make request about selected depart flight so it's easier to process
				axios
					.get(`${baseUrl}/flight/${String($(event.target).data("flightid")).substring(2)}`)
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
						localStorage.setItem("departTransferFlight", "false");
						localStorage.removeItem("departFlight2");
						localStorage.setItem("departFlight1", JSON.stringify(flight));
					})
					.catch((error) => {
						console.log(error);
					});
			} else {
				flights = String($(event.target).data("flightid")).substring(2).split("//");
				console.log(flights);
				// Make request about selected depart flight so it's easier to process
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
								localStorage.setItem("departTransferFlight", "true");
								localStorage.setItem("departFlight1", JSON.stringify(flight1));
								localStorage.setItem("departFlight2", JSON.stringify(flight2));
							})
							.catch((error) => {
								console.log(error);
							});
					})
					.catch((error) => {
						console.log(error);
					});
			}

			// Show return flight price
			$(".price-return > .price-from").html("From SGD<br>");
			$(".price-return > .price-value").removeClass("d-none");
			$(".selectArriveFlight").removeClass("disabled");
		} else {
			axios
				.get(`${baseUrl}/flight/${String($(event.target).data("flightid")).substring(2)}`)
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
					localStorage.setItem("departTransferFlight", "false");
					localStorage.removeItem("departFlight2");
					localStorage.setItem("departFlight1", JSON.stringify(flight));
				})
				.catch((error) => {
					console.log(error);
				});
			// For one way flight, continue to booking
			window.location.assign(window.location.origin + "/booking");
		}
	});

	// Handle clicks from modify depart flight
	$(document).on("click", ".changeDepartFlight", () => {
		// Add all other depart flights
		$("#departAccordion > .accordion-item").removeClass("d-none");

		// Replace select depart flight with change flight button
		$('.changeDepartFlight[data-index="' + $(event.target).data("index") + '"]')
			.text("Select")
			.addClass("selectDepartFlight")
			.removeClass("changeDepartFlight");

		// Disable select arrive flight
		$(".price-return > .price-from").html("Select first flight<br>to view fares<br>");
		$(".price-return > .price-value").addClass("d-none");
		$(".selectArriveFlight").addClass("disabled");

		// Modify flight status bar
		axios
			.get(`${baseUrl}/airport/${originAirportId}`)
			.then((response1) => {
				axios
					.get(`${baseUrl}/airport/${destinationAirportId}`)
					.then((response2) => {
						if ($.urlParam("type") != "oneway") {
							var flightDetailsHtml = `
                        <div class="col">
                            <span class="flight-details-header">Departing</span>
                            <div class="row d-none d-md-flex">
                                <div class="col-5" id="detailsDepartOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane"></div>
                                </div>
                                <div class="col-5 offset-1 ps-0" id="detailsDepartDestination">
                                <span class="flight-details-date"><br></span>
                                <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].code} - ${response2.data[0].code}</span>
                                </div>
                        </div>
                        <div class="vr p-0 mx-3"></div>
                        <div class="col">
                            <span class="flight-details-header">Arriving</span>
                            <div class="row d-none d-md-flex">
                                <div class="col-5" id="detailsArriveOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("toDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane"></div>
                                </div>
                                <div class="col-5 offset-1 ps-0" id="detailsArriveDestination">
                                    <span class="flight-details-date"><br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("toDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response2.data[0].code} - ${response1.data[0].code}</span>
                                </div>                            </div>
                        </div>
                        `;
						} else {
							var flightDetailsHtml = `
                        <div class="col">
                            <div class="row d-none d-md-flex justify-content-center">
                                <div class="col-5 col-lg-3 offset-lg-2" id="detailsDepartOrigin">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].city} (${response1.data[0].code})</span>
                                </div>
                                <div class="col-1 px-0">
                                    <div class="airplane mt-3"></div>
                                </div>
                                <div class="col-4 offset-1 ps-0" id="detailsDepartDestination">
                                <span class="flight-details-date"><br></span>
                                <span class="flight-details-city">${response2.data[0].city} (${response2.data[0].code})</span>
                                </div>
                            </div>
                            <div class="row d-flex d-md-none">
                                    <span class="flight-details-date">${moment($.urlParam("fromDate"), "YYYY-MM-DD").format("DD MMM (ddd)")}<br></span>
                                    <span class="flight-details-city">${response1.data[0].code} - ${response2.data[0].code}</span>
                                </div>
                        </div>
                        `;
						}
						$(".flight-details").html(flightDetailsHtml);
						// $("#detailsArriveDestination span.flight-details-date").text("hi");

						$("#departHeader").text(`Flight from ${response1.data[0].city} to ${response2.data[0].city}`).removeClass("d-none");
						if ($.urlParam("type") != "oneway") {
							$("#arriveHeader").text(`Flight from ${response2.data[0].city} to ${response1.data[0].city}`).removeClass("d-none");
						} else {
							$("#arriveRow").remove();
						}
					})
					.catch((error) => {
						console.log(error);
					});
			})
			.catch((error) => {
				console.log(error);
			});
	});

	// Handle arrival flight clicks
	$(document).on("click", ".selectArriveFlight", () => {
		// Figure out if it's a transfer or direct flight
		if (String($(event.target).data("flightid")).slice(0, 2) == "rd") {
			// Make request about selected depart flight so it's easier to process
			axios
				.get(`${baseUrl}/flight/${String($(event.target).data("flightid")).substring(2)}`)
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
					localStorage.setItem("arriveTransferFlight", "false");
					localStorage.removeItem("arriveFlight2");
					localStorage.setItem("arriveFlight1", JSON.stringify(flight));
					window.location.assign(window.location.origin + "/booking");
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			flights = String($(event.target).data("flightid")).substring(2).split("//");
			console.log(flights);
			// Make request about selected depart flight so it's easier to process
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
							localStorage.setItem("arriveTransferFlight", "true");
							localStorage.setItem("arriveFlight1", JSON.stringify(flight1));
							localStorage.setItem("arriveFlight2", JSON.stringify(flight2));
							window.location.assign(window.location.origin + "/booking");
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});

	// Handle clicks from accordion to show/hide details
	// Whoever thought of this as a assignment requirement is ***beep***
	$(document).on("click", ".accordion-button", function() {
		// Figure out if it's a transfer or direct flight
		if (String($(this).attr("data-flightid")).slice(0, 2) == "rd") {
			// Make request about selected depart flight so it's easier to process
			axios
				.get(`${baseUrl}/flight/${String($(this).attr("data-flightid")).substring(2)}`)
				.then((response) => {
					// do nothing with the response (sorry mr justin)
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			flights = String($(this).attr("data-flightid")).substring(2).split("//");
			console.log(flights);
			// Make request about selected depart flight so it's easier to process
			axios
				.get(`${baseUrl}/flight/${flights[0]}`)
				.then((response1) => {
					axios
						.get(`${baseUrl}/flight/${flights[1]}`)
						.then((response2) => {
							// do nothing with the response (sorry mr justin)
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});

	// return false;
});
