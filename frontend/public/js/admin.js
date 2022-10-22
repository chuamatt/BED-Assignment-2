$(document).ready(function () {
	const baseUrl = "http://localhost:8081";

	// Call data about user from localStorage
	var userInfo = localStorage.getItem("userInfo");
	var userToken = localStorage.getItem("token");

	// Redirect to home page if no token is found
	if (!userInfo || !userToken) {
		window.location.assign(window.location.origin + "/");
	}
	userInfo = JSON.parse(userInfo);
	if (userInfo.role != "Admin") {
		window.location.assign(window.location.origin + "/");
	}

	// For flights
	axios
		.get(`${baseUrl}/flights/`)
		.then((response) => {
			var flights = response.data;
			flights.forEach(function (flight) {
				$("#adminFlightsTable tbody").append(`<tr data-id="f${flight.flightId}" class="fTableRow">
					<td class="align-middle fId">${flight.flightId}</td>
					<td class="align-middle fCode">${flight.flightCode}</td>
					<td class="align-middle fAircraft">${flight.aircraft}</td>
					<td class="align-middle fSelectO" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.originAirportCode}</span> ${flight.originAirportDescription}</td>
					<td class="align-middle fSelectD" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.destinationAirportCode}</span> ${flight.destinationAirportDescription}</td>
					<td class="align-middle fDatetime"><a data-toggle="tooltip" title="GMT ${flight.originAirportTimezone}" data-val="${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY-MM-DD[T]HH:mm")}">${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD HH:mm")}</a>
					</td>
					<td class="align-middle fDuration">${moment(flight.travelTime, "H m").format("HH:mm")}</td>
					<td class="align-middle fPrice">${parseFloat(flight.price).toFixed(2)}</td>
					<td class="align-middle fButton"><div class="btn-group"><button type="button" class="adminFlightsEdit btn btn-secondary" data-id="f${flight.flightId}">
					<i class="bi bi-pencil-fill" data-id="f${flight.flightId}"></i>
				  </button>
				  <button type="button" class="adminFlightsDelete btn btn-danger"  data-id="f${flight.flightId}">
				  <i class="bi bi-trash3-fill" data-id="f${flight.flightId}"></i>
				</button></div></td>
				</tr>`);
			});
			$("#adminFlightsTable").removeClass("d-none");
			$("#adminFlightsLoading").removeClass("d-flex").addClass("d-none");
			$("#adminFlightsTable").DataTable({
				columns: [{ width: "20px" }, { width: "64px" }, { width: "114px" }, null, null, { width: "120px" }, { width: "48px" }, { width: "56px" }, { width: "80px", orderable: false, searchable: false }],
				fixedHeader: {
					header: true,
					footer: false,
				},
				autoWidth: true,
			});
			$("body").tooltip({ selector: "[data-toggle=tooltip]" });

			// Listener for Admin Flights Edit Button
			$(document).on("click", ".adminFlightsEdit", () => {
				var flightId = $(event.target).data("id");
				// alert(`Edited ${flightId}`);
				$(`tr.fTableRow[data-id="${flightId}"]`)
					.children("td")
					.each(function () {
						if ($(this).hasClass("fId")) {
							$(this).html($(this).text());
						} else if ($(this).hasClass("fCode") || $(this).hasClass("fAircraft") || $(this).hasClass("fDuration") || $(this).hasClass("fPrice")) {
							$(this).html(`<input type="text" class="form-control" value="${$(this).text()}">`);
						} else if ($(this).hasClass("fDatetime")) {
							$(this).html(`<input type="datetime-local" class="form-control" value="${moment($(this).text(), "YYYY/MM/DD HH:mm").format("YYYY-MM-DD[T]HH:mm")}">`);
						} else if ($(this).hasClass("fSelectO")) {
							var targetCode = $(this).text().slice(0, 3);
							$(this).html(`<select class="airportPicker form-control" data-live-search="true" id="adminEditFlightOrigin${$(event.target).data("id")}"
							title="Origin" name="from" required>
						</select>`);
							// To autopopulate airports
							axios
								.get(`${baseUrl}/airport/`)
								.then((response) => {
									var airports = response.data;
									airports.forEach(function (airport) {
										if (airport.code == targetCode) {
											$(`select.airportPicker#adminEditFlightOrigin${flightId}`).append(`<option value="${airport.airportid}" data-content="<span class='airportCodeBadge badge bg-secondary me-1'>${airport.code}</span> ${airport.description}" selected>${airport.name} (${airport.code})</option>`);
										} else {
											$(`select.airportPicker#adminEditFlightOrigin${flightId}`).append(`<option value="${airport.airportid}" data-content="<span class='airportCodeBadge badge bg-secondary me-1'>${airport.code}</span> ${airport.description}">${airport.name} (${airport.code})</option>`);
										}
									});
								})
								.catch((error) => {
									console.log(error);
									
									$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
									$("#warningModal").modal("show");
								});
						} else if ($(this).hasClass("fSelectD")) {
							var targetCode = $(this).text().slice(0, 3);
							$(this).html(`<select class="airportPicker form-control" data-live-search="true" id="adminEditFlightDestination${flightId}"
							title="Destination" name="to" required>
						</select>`);
							// To autopopulate airports
							axios
								.get(`${baseUrl}/airport/`)
								.then((response) => {
									var airports = response.data;
									airports.forEach(function (airport) {
										if (airport.code == targetCode) {
											$(`select.airportPicker#adminEditFlightDestination${flightId}`).append(`<option value="${airport.airportid}" data-content="<span class='airportCodeBadge badge bg-secondary me-1'>${airport.code}</span> ${airport.description}" selected>${airport.name} (${airport.code})</option>`);
										} else {
											$(`select.airportPicker#adminEditFlightDestination${flightId}`).append(`<option value="${airport.airportid}" data-content="<span class='airportCodeBadge badge bg-secondary me-1'>${airport.code}</span> ${airport.description}">${airport.name} (${airport.code})</option>`);
										}
									});
									$("select.airportPicker").selectpicker();
								})
								.catch((error) => {
									console.log(error);
									
									$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
									$("#warningModal").modal("show");
								});
						} else if ($(this).hasClass("fButton")) {
							$(this).html(`
							<button type="submit" class="btn btn-success adminFlightsEditSubmit" aria-label="edit item" data-id="${flightId}">
								<i class="bi bi-pencil-fill" data-id="${flightId}"></i>
							</button>`);
						}
					});
				// $(`tr[data-id="${flightId}"] > td`).wrapAll(`<form>`);
			});
			// Listener for Admin Flights Edit Button Confirmation
			$(document).on("click", ".adminFlightsEditSubmit", () => {
				var flightId = $(event.target).data("id");
				// Validate Inputs
				// alert(`Edited ${flightId} successfully yay`);

				// flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price
				axios
					.put(
						`${baseUrl}/flight/`,
						{
							flightId: $(`tr.fTableRow[data-id="${flightId}"] > td.fId`).text(),
							flightCode: $(`tr.fTableRow[data-id="${flightId}"] > td.fCode > input`).val(),
							aircraft: $(`tr.fTableRow[data-id="${flightId}"] > td.fAircraft > input`).val(),
							originAirport: $(`#adminEditFlightOrigin${flightId}`).val(),
							destinationAirport: $(`#adminEditFlightDestination${flightId}`).val(),
							embarkDate: $(`tr.fTableRow[data-id="${flightId}"] > td.fDatetime > input`).val(),
							travelTime: $(`tr.fTableRow[data-id="${flightId}"] > td.fDuration > input`).val(),
							price: $(`tr.fTableRow[data-id="${flightId}"] > td.fPrice > input`).val(),
						},
						{
							headers: {
								Authorization: userToken,
							},
						}
					)
					.then((response) => {
						console.log(response);
						axios
							.get(`${baseUrl}/flight/${flightId.substring(1)}/`)
							.then((response) => {
								flight = response.data[0];
								console.log(flight);
								$(`tr.fTableRow[data-id="${flightId}"]`).html(`
									<td class="align-middle fId">${flight.flightId}</td>
									<td class="align-middle fCode">${flight.flightCode}</td>
									<td class="align-middle fAircraft">${flight.aircraft}</td>
									<td class="align-middle fSelectO" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.originAirportCode}</span> ${flight.originAirportDescription}</td>
									<td class="align-middle fSelectD" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.destinationAirportCode}</span> ${flight.destinationAirportDescription}</td>
									<td class="align-middle fDatetime"><a data-toggle="tooltip" title="GMT ${flight.originAirportTimezone}" data-val="${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY-MM-DD[T]HH:mm")}">${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD HH:mm")}</a>
									</td>
									<td class="align-middle fDuration">${moment(flight.travelTime, "H m").format("HH:mm")}</td>
									<td class="align-middle fPrice">${parseFloat(flight.price).toFixed(2)}</td>
									<td class="align-middle fButton"><div class="btn-group"><button type="button" class="adminFlightsEdit btn btn-secondary" data-id="f${flight.flightId}">
									<i class="bi bi-pencil-fill" data-id="f${flight.flightId}"></i>
								</button>
								<button type="button" class="adminFlightsDelete btn btn-danger" data-id="f${flight.flightId}">
								<i class="bi bi-trash3-fill" data-id="f${flight.flightId}"></i>
								</button></div></td>
								`);
								
								$("#successModalContent > .modal-body").text(`Edited ${flightId} successfully yay`);
								$("#successModal").modal("show");
							})
							.catch((error) => {
								console.log(error);
								
								$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
								$("#warningModal").modal("show");
							});
					})
					.catch((error) => {
						console.log(error);
						
						$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
						$("#warningModal").modal("show");
					});
				// $(`tr[data-id="${flightId}"] > td`).wrapAll(`<form>`);
			});
			// Listener for Admin Flights Delete Button
			$(document).on("click", ".adminFlightsDelete", () => {
				var flightId = $(event.target).data("id");
				
				$("#warningModalContent > .modal-body").text(`Are you very sure you want to delete ${flightId}???`);
				$("#warningModal").modal("show");
				$("#warningModalContent > .modal-footer > .btn-success").attr("data-id", flightId);
				$("#warningModalContent > .modal-footer > .btn-success").addClass("adminFlightsDeleteConfirm");
			});
			// Listener for Admin Flights Delete Button Confirmation
			$(document).on("click", ".adminFlightsDeleteConfirm", () => {
				var flightId = $(event.target).data("id");
				// alert(`Delet ${flightId} yo`);
				axios
					.delete(`${baseUrl}/flight/${flightId.substring(1)}/`, {
						headers: {
							Authorization: userToken,
						},
					})
					.then((response) => {
						console.log(response);
						var fTable = $("#adminFlightsTable").DataTable();
						fTable
							.row($(`tr.fTableRow[data-id="${flightId}"]`))
							.remove()
							.draw();
						$("#warningModalContent > .modal-footer > .btn-success").removeClass("adminFlightsDeleteConfirm");
					})
					.catch((error) => {
						console.log(error);
						
						$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
						$("#warningModal").modal("show");
					});
			});
			// Listener for Admin Flights Add Button
			$(document).on("click", ".adminAddFlight", () => {
				var flightId = $(event.target).data("id");
				// Validate Inputs
				// alert(`Edited ${flightId} successfully yay`);
				// flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price
				axios
					.post(
						`${baseUrl}/flight/`,
						{
							flightCode: $(`#adminAddFlightCode`).val(),
							aircraft: $(`#adminAddFlightAircraft`).val(),
							originAirport: $(`#adminAddFlightOrigin`).val(),
							destinationAirport: $(`#adminAddFlightDestination`).val(),
							embarkDate: $(`#adminAddFlightEmbarkDate`).val(),
							travelTime: $(`#adminAddFlightTravelTime`).val(),
							price: $(`#adminAddFlightPrice`).val(),
						},
						{
							headers: {
								Authorization: userToken,
							},
						}
					)
					.then((response) => {
						console.log(response);

						addedFlightId = response.data["flightid"];
						// Add datatable row
						axios
							.get(`${baseUrl}/flight/${addedFlightId}/`)
							.then((response) => {
								flight = response.data[0];
								console.log(flight);
								var fTable = $("#adminFlightsTable").DataTable();
								var fTableCell = fTable.row
									.add([
										`<td class="align-middle fId">${flight.flightId}</td>`,
										`<td class="align-middle fCode">${flight.flightCode}</td>`,
										`<td class="align-middle fAircraft">${flight.aircraft}</td>`,
										`<td class="align-middle fSelectO" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.originAirportCode}</span> ${flight.originAirportDescription}</td>`,
										`<td class="align-middle fSelectD" data-id="f${flight.flightId}"><span class='airportCodeBadge badge bg-secondary'>${flight.destinationAirportCode}</span> ${flight.destinationAirportDescription}</td>`,
										`<td class="align-middle fDatetime"><a data-toggle="tooltip" title="GMT ${flight.originAirportTimezone}" data-val="${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY-MM-DD[T]HH:mm")}">${moment.utc(flight.embarkDate, "YYYY/MM/DD HH:mm").utcOffset(flight.originAirportTimezone).format("YYYY/MM/DD HH:mm")}</a></td>`,
										`<td class="align-middle fDuration">${moment(flight.travelTime, "H m").format("HH:mm")}</td>`,
										`<td class="align-middle fPrice">${parseFloat(flight.price).toFixed(2)}</td>`,
										`<td class="align-middle fButton">Refresh</td>`,
									])
									.draw()
									.node();
								$(fTableCell).attr("data-id", `f${flight.flightId}`).addClass("fTableRow");
								//Loop through all the children of fTableCell and add class align-middle
								// fId, fCode, fAircraft, fOrigin, fDestination, fDatetime, fDuration, fPrice, fButton
								
								$("#successModalContent > .modal-body").text(`Added flight successfully yay`);
								$("#successModal").modal("show");
							})
							.catch((error) => {
								console.log(error);
							});
					})
					.catch((error) => {
						console.log(error);
						
						$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
						$("#warningModal").modal("show");
					});
			});
		})
		.catch((error) => {
			console.log(error);
			
			$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
			$("#warningModal").modal("show");
		});

	// For airports
	axios
		.get(`${baseUrl}/airport/`)
		.then((response) => {
			var airports = response.data;
			airports.forEach(function (airport) {
				$("#adminAirportsTable tbody").append(`<tr data-id="a${airport.airportid}" class="aTableRow">
					<td class="align-middle aId">${airport.airportid}</td>
					<td class="align-middle aName">${airport.name}</td>
					<td class="align-middle aCode"><span class='airportCodeBadge badge bg-secondary'>${airport.code}</span></td>
					<td class="align-middle aCity">${airport.city}</td>
					<td class="align-middle aCountry">${airport.country}</td>
					<td class="align-middle aDescription">${airport.description}</td>
					<td class="align-middle aTimezone">${airport.timezone}</td>
					<td class="align-middle aButton"><div class="btn-group"><button type="button" class="adminAirportsEdit btn btn-secondary" data-id="a${airport.airportid}">
					<i class="bi bi-pencil-fill" data-id="a${airport.airportid}"></i>
				  </button>
				  <button type="button" class="adminAirportsDelete btn btn-danger"  data-id="a${airport.airportid}">
				  <i class="bi bi-trash3-fill" data-id="a${airport.airportid}"></i>
				</button></div></td>
				</tr>`);
			});
			$("#adminAirportsTable").DataTable({
				columns: [{ width: "20px" }, null, { width: "40px" }, null, null, null, { width: "48px" }, { width: "80px", orderable: false, searchable: false }],
				fixedHeader: {
					header: true,
					footer: false,
				},
				autoWidth: false,
			});

			// Listener for Admin Flights Edit Button
			$(document).on("click", ".adminAirportsEdit", () => {
				var airportid = $(event.target).data("id");
				// alert(`Edited ${flightId}`);
				$(`tr.aTableRow[data-id="${airportid}"]`)
					.children("td")
					.each(function () {
						if ($(this).hasClass("aId")) {
							$(this).html($(this).text());
						} else if ($(this).hasClass("aName") || $(this).hasClass("aCode") || $(this).hasClass("aCity") || $(this).hasClass("aCountry") || $(this).hasClass("aDescription") || $(this).hasClass("aTimezone")) {
							$(this).html(`<input type="text" class="form-control" value="${$(this).text()}">`);
						} else if ($(this).hasClass("aButton")) {
							$(this).html(`
							<button type="submit" class="btn btn-success adminAirportsEditSubmit" aria-label="edit item" data-id="${airportid}">
								<i class="bi bi-pencil-fill" data-id="${airportid}"></i>
							</button>`);
						}
					});
				// $(`tr[data-id="${flightId}"] > td`).wrapAll(`<form>`);
			});
			// Listener for Admin Flights Edit Button Confirmation
			$(document).on("click", ".adminAirportsEditSubmit", () => {
				var airportid = $(event.target).data("id");
				// Validate Inputs
				// alert(`Edited ${flightId} successfully yay`);

				// flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price
				axios
					.put(
						`${baseUrl}/airport/`,
						{
							airportid: $(`tr.aTableRow[data-id="${airportid}"] > td.aId`).text(),
							name: $(`tr.aTableRow[data-id="${airportid}"] > td.aName > input`).val(),
							code: $(`tr.aTableRow[data-id="${airportid}"] > td.aCode > input`).val(),
							city: $(`tr.aTableRow[data-id="${airportid}"] > td.aCity > input`).val(),
							country: $(`tr.aTableRow[data-id="${airportid}"] > td.aCountry > input`).val(),
							description: $(`tr.aTableRow[data-id="${airportid}"] > td.aDescription > input`).val(),
							timezone: $(`tr.aTableRow[data-id="${airportid}"] > td.aTimezone > input`).val(),
						},
						{
							headers: {
								Authorization: userToken,
							},
						}
					)
					.then((response) => {
						console.log(response);
						axios
							.get(`${baseUrl}/airport/${airportid.substring(1)}/`)
							.then((response) => {
								airport = response.data[0];
								console.log(airport);
								$(`tr.aTableRow[data-id="${airportid}"]`).html(`
								<td class="align-middle aId">${airport.airportid}</td>
								<td class="align-middle aName">${airport.name}</td>
								<td class="align-middle aCode"><span class='airportCodeBadge badge bg-secondary'>${airport.code}</span></td>
								<td class="align-middle aCity">${airport.city}</td>
								<td class="align-middle aCountry">${airport.country}</td>
								<td class="align-middle aDescription">${airport.description}</td>
								<td class="align-middle aTimezone">${airport.timezone}</td>
								<td class="align-middle aButton"><div class="btn-group"><button type="button" class="adminAirportsEdit btn btn-secondary" data-id="a${airport.airportid}">
								<i class="bi bi-pencil-fill" data-id="a${airport.airportid}"></i>
							  </button>
							  <button type="button" class="adminAirportsDelete btn btn-danger"  data-id="a${airport.airportid}">
							  <i class="bi bi-trash3-fill" data-id="a${airport.airportid}"></i>
							</button></div></td>
								`);
								
								$("#successModalContent > .modal-body").text(`Edited ${airportid} successfully yay`);
								$("#successModal").modal("show");
							})
							.catch((error) => {
								console.log(error);
								
								$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
								$("#warningModal").modal("show");
							});
					})
					.catch((error) => {
						console.log(error);
						
						$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
						$("#warningModal").modal("show");
					});
				// $(`tr[data-id="${flightId}"] > td`).wrapAll(`<form>`);
			});
			// Listener for Admin Flights Delete Button
			$(document).on("click", ".adminAirportsDelete", () => {
				var flightId = $(event.target).data("id");
				
				$("#warningModalContent > .modal-body").text(`Are you very sure you want to delete ${flightId}???`);
				$("#warningModal").modal("show");
				$("#warningModalContent > .modal-footer > .btn-success").attr("data-id", flightId);
				$("#warningModalContent > .modal-footer > .btn-success").addClass("adminAirportsDeleteConfirm");
			});
			// Listener for Admin Flights Delete Button Confirmation
			$(document).on("click", ".adminAirportsDeleteConfirm", () => {
				var flightId = $(event.target).data("id");
				// alert(`Delet ${flightId} yo`);
				axios
					.delete(`${baseUrl}/flight/${flightId.substring(1)}/`, {
						headers: {
							Authorization: userToken,
						},
					})
					.then((response) => {
						console.log(response);
						var fTable = $("#adminFlightsTable").DataTable();
						fTable
							.row($(`tr.fTableRow[data-id="${flightId}"]`))
							.remove()
							.draw();
						$("#warningModalContent > .modal-footer > .btn-success").removeClass("adminFlightsDeleteConfirm");
					})
					.catch((error) => {
						console.log(error);
						
						$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
						$("#warningModal").modal("show");
					});
			});
			// Listener for Admin Airport Add Button
			$(document).on("click", ".adminAddAirport", () => {
				// Validate Inputs
				// alert(`Edited ${flightId} successfully yay`);
				// flightId, flightCode, aircraft, originAirport, destinationAirport, embarkDate, travelTime, price
				axios
					.post(
						`${baseUrl}/airport/`,
						{
							name: $(`#adminAddAirportName`).val(),
							code: $(`#adminAddAirportCode`).val(),
							city: $(`#adminAddAirportCity`).val(),
							country: $(`#adminAddAirportCountry`).val(),
							description: $(`#adminAddAirportDescription`).val(),
							timezone: $(`#adminAddAirportTimezone`).val(),
						},
						{
							headers: {
								Authorization: userToken,
							},
						}
					)
					.then((response) => {
						console.log(response);
						addedAirport = response.data["airportid"];
						// Add datatable row
						axios
							.get(`${baseUrl}/airport/${addedAirport}/`)
							.then((response) => {
								airport = response.data[0];
								console.log(airport);
								var aTable = $("#adminAirportsTable").DataTable();
								var aTableCell = aTable.row
									.add([
										`<td class="align-middle aId">${airport.airportid}</td>`,
										`<td class="align-middle aName">${airport.name}</td>`,
										`<td class="align-middle aCode"><span class='airportCodeBadge badge bg-secondary'>${airport.code}</span></td>`,
										`<td class="align-middle aCity">${airport.city}</td>`,
										`<td class="align-middle aCountry">${airport.country}</td>`,
										`<td class="align-middle aDescription">${airport.description}</td>`,
										`<td class="align-middle aTimezone">${airport.timezone}</td>`,
										`<td class="align-middle aButton">Refresh
									</td>`,
									])
									.draw()
									.node();
								$(aTableCell).attr("data-id", `a${airport.airportid}`).addClass("aTableRow");
								//Loop through all the children of fTableCell and add class align-middle
								// fId, fCode, fAircraft, fOrigin, fDestination, fDatetime, fDuration, fPrice, fButton
								
								$("#successModalContent > .modal-body").text(`Added airport successfully yay`);
								$("#successModal").modal("show");
							})

							.catch((error) => {
								console.log(error);
							});
					})
					.catch((error) => {
						console.log(error);
						if (error.toJSON().status == 422) {
							
							$("#warningModalContent > .modal-body").html(error.response.data.replaceAll("\n","<br>"));
							$("#warningModal").modal("show");
						} else {
							
							$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
							$("#warningModal").modal("show");
						}
					});
			});
		})
		.catch((error) => {
			console.log(error);
			
			$("#warningModalContent > .modal-body").text(`Oopsie Woopsie! An error occurred. Check console log for more details.`);
			$("#warningModal").modal("show");
		});
});
