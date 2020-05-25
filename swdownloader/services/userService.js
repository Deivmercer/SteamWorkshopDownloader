"use strict";

angular.module("swdownloader.userService", [])
	.service("userService", function() {

		this.id = -1;
		this.username = "";
		this.permission = -1;
	});
