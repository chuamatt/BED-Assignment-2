$(document).ready(function () {
	$("form#flightSearchForm").dirtyForms();

	// Call data about user from localStorage
	var userInfo = localStorage.getItem("userInfo");
	var userToken = localStorage.getItem("token");

	// Check if user is logged in, if logged in, show the logout button
	if (userInfo && userToken) {
		$("nav.navbar > .container > button.btn-primary").remove();
		$("#userButtons").removeClass("d-none");
	}

	// API url
	const baseUrl = "http://localhost:8081";

	// For flight info search
	setInterval(() => {
		if ($("input#formOneway").is(":checked")) {
			$("#formArrival").attr("disabled", "");
		} else if ($("input#formOneway").is(":not(:checked)")) {
			$("#formArrival").removeAttr("disabled");
		}
	}, 100);

	// To autopopulate airports
	axios
		.get(`${baseUrl}/airport/`)
		.then((response) => {
			var airports = response.data;
			airports.forEach(function (airport) {
				$(".airportPicker").append(`<option value="${airport.airportid}" data-content="<span class='airportCodeBadge badge bg-secondary me-1'>${airport.code}</span> ${airport.description}">${airport.name} (${airport.code})</option>`);
			});
			$("select.airportPicker").selectpicker();
		})
		.catch((error) => {
			console.log(error);
		});

	// Source for following function: Bootstrap (https://getbootstrap.com/docs/5.1/forms/validation/)
	(function () {
		"use strict";

		// Fetch all the forms we want to apply custom Bootstrap validation styles to
		var forms = document.querySelectorAll(".needs-validation");

		// Loop over them and prevent submission
		Array.prototype.slice.call(forms).forEach(function (form) {
			form.addEventListener(
				"submit",
				function (event) {
					if (!form.checkValidity()) {
						event.preventDefault();
						event.stopPropagation();
						form.classList.add("error");
						setTimeout(function () {
							form.classList.remove("error");
						}, 300);
					}

					form.classList.add("was-validated");
				},
				false
			);
		});
	})();

	$("#loginForm").submit(function () {
		var email = $("#loginEmail").val();
		var pwd = $("#loginPassword").val();
		var data = { email: email, password: pwd };

		axios
			.post(`${baseUrl}/user/login/`, data)
			.then((response) => {
				if (response.data != null) {
					localStorage.setItem("token", response.data.token);
					localStorage.setItem("userInfo", JSON.stringify(JSON.parse(response.data.UserData)[0]));
					if (window.location.pathname == "/booking") {
						window.location.reload();
					} else {
						window.location.assign(window.location.origin + "/user");
					}
				} else {
					console.log("Error");
				}
			})
			.catch((error) => {
				if (error.response.status == 401) {
					alert("Unauthorised!!!");
					$("form#loginForm .invalid-feedback").addClass("d-block");
				}
				console.log(error);
			});
		return false;
	});

	$(document).on("click", ".logoutButton", () => {
		localStorage.removeItem("userInfo");
		localStorage.removeItem("token");
		window.location.assign(window.location.origin + "/");
	});
});
