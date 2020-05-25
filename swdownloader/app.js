"use strict";

// Declare app level module which depends on views, and core components
angular.module("swdownloader", [
	"ngRoute",
	"swdownloader.userService",
	"swdownloader.logInView",
	"swdownloader.homeView",
	"swdownloader.downloadView",
	"swdownloader.adminView"
]).config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {

	$locationProvider.hashPrefix("!");
	$routeProvider.otherwise({redirectTo: "/swdownloader/login"});
}]);
