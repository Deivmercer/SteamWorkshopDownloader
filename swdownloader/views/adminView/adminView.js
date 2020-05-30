"use strict";



angular.module("swdownloader.adminView", ["ngRoute"])
	.config(["$routeProvider", function($routeProvider) {

		$routeProvider.when("/swdownloader/admin", {
			templateUrl: "views/adminView/adminView.html"
		});
	}])
	.controller("adminViewCtrl", function($scope, $http, userService) {

		$scope.userService = userService;
		$scope.result = "";

		$scope.options = [
			{id: '?', name: ""},
			{id: 'N', name: "New"},
			{id: 'E', name: "Enabled"},
			{id: 'A', name: "Admin"}
		]

		$http.get("swdownloader/listusers")
			.then(res => {
				$scope.users = res.data;
			}).catch(err => console.log(err.data));

		$scope.selectUserPermission = function() {

			$scope.permissionSelect.id = $scope.users[$scope.userSelect.id - 1].permission;
		};

		$scope.updateUserPermission = function() {

				$http.post("swdownloader/updateuser", {"userId": $scope.userSelect.id, "permission": $scope.permissionSelect.id})
					.then(res => {
						$scope.result = res.data;
					}).catch(err => {
						$scope.result = "Internal server error. Check your browser's console for details.";
						console.log(err.data);
					})
		};
	});
