"use strict";

angular.module("swdownloader.logInView", ["ngRoute"])
	.config(["$routeProvider", function($routeProvider) {

		$routeProvider.when("/swdownloader/login", {
			templateUrl: "/views/logInView/logInView.html",
			controller: "logInViewCtrl"
		});
	}])
	.controller("logInViewCtrl", function($scope, $http, userService) {
		$scope.userService = userService;
		$scope.info = "";

		$scope.logIn = function() {

			let requestBody = {
				"username": $scope.username,
				"password": $scope.password
			};
			$http.post("/swdownloader/loginaction", requestBody)
				.then(res => {
					userService.id = res.data.id;
					userService.username = $scope.username;
					userService.permission = res.data.permission;
					window.location.href = "#!/swdownloader";
				}).catch(err => {
					if (err.status === 401)
						$scope.info = err.data;
					console.log(err.data);
				});
		};

		$scope.signUp = function() {

			let requestBody = {
				"username": $scope.username,
				"password": $scope.password
			};
			$http.post("/swdownloader/signupaction", requestBody)
				.then(res => {
					userService.id = res.data.id;
					userService.username = $scope.username;
					userService.permission = res.data.permission;
					window.location.href = "#!/swdownloader";
				}).catch(err => {
					if (err.status === 400 || err.status === 401)
						$scope.info = err.data;
					else {
						$scope.info = "Something went wrong.";
						console.log(err.data);
					}
				});
		}
	});
