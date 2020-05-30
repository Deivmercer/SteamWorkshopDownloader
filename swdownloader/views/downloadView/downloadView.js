"use strict";

angular.module("swdownloader.downloadView", ["ngRoute"])
	.config(["$routeProvider", function($routeProvider) {

		$routeProvider.when("/swdownloader/download", {
			templateUrl: "/views/downloadView/downloadView.html",
			controller: "downloadViewCtrl"
		});
	}])
	.controller("downloadViewCtrl", function($scope, $http, userService) {

		$scope.userService = userService;
		$scope.username = userService.username;
		$scope.result = "";

		$scope.disable= false;
		if($scope.userService.permission === 'N') {
			$scope.disable = true;
			$scope.result = "Your account has not been activated yet. Contact your server administrator.";
		}

		$scope.download = function() {
			$scope.result = "";
			$http.post("/swdownloader/downloadaction", {"userId": userService.id, "contentId": $scope.contentId})
				.then(res => $scope.result = res.data)
				.catch(err => {
					$scope.result = "Internal server error. Check your browser's console for details.";
					console.log(err.data);
				})
		}
	});
