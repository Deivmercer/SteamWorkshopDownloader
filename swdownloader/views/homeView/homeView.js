"use strict";

angular.module("swdownloader.homeView", ["ngRoute"])
	.config(["$routeProvider", function($routeProvider) {

		$routeProvider.when("/swdownloader", {
			templateUrl: "/views/homeView/homeView.html",
			controller: "homeViewCtrl"
		});
	}])
	.controller("homeViewCtrl", function($scope, userService) {

		$scope.userService = userService;
		if($scope.userService.id === -1)
			window.location.href = "#!/swdownloader/login";

		$scope.downloadView = "/views/downloadView/downloadView.html";

		$scope.adminView = "";
		if(userService.permission === 'A')
			$scope.adminView = "/views/adminView/adminView.html";
	});
