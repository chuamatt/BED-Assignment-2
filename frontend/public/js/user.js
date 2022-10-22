$(document).ready(function () {
	// API url
	const baseUrl = "http://localhost:8081";

	// Call data about user from localStorage
	var userInfo = localStorage.getItem("userInfo");
	var userToken = localStorage.getItem("token");

	// Redirect to home page if no token is found
	if (!userInfo || !userToken) {
		window.location.assign(window.location.origin + "/");
	}
	userInfo = JSON.parse(userInfo);

	// Populate values
	$("#accountName").attr("value", userInfo.username);
	$("#accountEmail").attr("value", userInfo.email);
	$("#accountContact").attr("value", userInfo.contact);
	$("#accountPicture").attr("src", `assets/img/${userInfo.profile_pic_url}`);
	if (userInfo.role == "Admin") {
		$("#adminDashboardButton").removeClass("d-none");
	}

	// Listener for modification of values
	$("#btnMakeChanges").click(function () {
		$("#accountPicture").addClass("d-none");
		$("#accountPictureEdit").removeClass("d-none");
		$("#accountName").removeAttr("readonly").removeClass("form-control-plaintext").addClass("form-control");
		$("#accountEmail").removeAttr("readonly").removeClass("form-control-plaintext").addClass("form-control");
		$("#accountPassword").removeAttr("readonly").removeClass("form-control-plaintext").addClass("form-control");
		$("#accountContact").removeAttr("readonly").removeClass("form-control-plaintext").addClass("form-control");
		$("#userPasswordToggle").removeClass("d-none");
		$("#btnMakeChanges").addClass("d-none");
		$("#btnSaveChanges").removeClass("d-none");
	});

	// Listener for saving changes
	$("#btnSaveChanges").click(function () {
		// Make request to server
		// userid, username, email, contact, password, role, profile_pic_url
		var bodyFormData = new FormData();
		bodyFormData.append("image", $("#accountPictureEdit").prop("files")[0]);
		if ($("#accountPictureEdit").prop("files")[0]) {
			axios
				.put(`${baseUrl}/user/upload/${userInfo.userid}/`, bodyFormData, {
					headers: {
						Authorization: userToken,
						"Content-Type": "multipart/form-data",
					},
				})
				.then((response) => {
					console.log(response);
				})
				.catch((error) => {
					console.log(error);
				});
		}
		var data = {
			userid: userInfo.userid,
			username: $("#accountName").val(),
			email: $("#accountEmail").val(),
			contact: $("#accountContact").val(),
			password: $("#accountPassword").val(),
			role: userInfo.role,
		};
		axios
			.put(`${baseUrl}/users/${userInfo.userid}/`, data, {
				headers: {
					Authorization: userToken,
				},
			})
			.then((response) => {
				console.log(response);
				// Request server for new values
				axios
					.get(`${baseUrl}/users/${userInfo.userid}/`, {
						headers: {
							Authorization: userToken,
						},
					})
					.then((response) => {
						user = response.data;
						// Restore to original
						$("#accountPicture").removeClass("d-none");
						$("#accountPictureEdit").addClass("d-none");
						$("#accountName").attr("readonly", "").addClass("form-control-plaintext").removeClass("form-control");
						$("#accountEmail").attr("readonly", "").addClass("form-control-plaintext").removeClass("form-control");
						$("#accountPassword").attr("readonly", "").addClass("form-control-plaintext").removeClass("form-control");
						$("#accountContact").attr("readonly", "").addClass("form-control-plaintext").removeClass("form-control");
						$("#userPasswordToggle").addClass("d-none");
						$("#btnMakeChanges").removeClass("d-none");
						$("#btnSaveChanges").addClass("d-none");
						$("#accountName").attr("value", user.username);
						$("#accountEmail").attr("value", user.email);
						$("#accountContact").attr("value", user.contact);
						$("#accountPicture").attr("src", `assets/img/${user.profile_pic_url}`);
						localStorage.setItem("userInfo", JSON.stringify(user));
					})
					.catch((error) => {
						console.log(error);
					});
			})
			.catch((error) => {
				console.log(error);
			});
		return false;
	});
});
