/*
 * Handles the communication with the backend.
 */
var Backend = (function () {
	this.nextGame = function () {
		return {
			type: 3,
			representation: 0,
			amount: 4
		};
	};

	this.login = function (name, pass) {
		return [0, name === pass];
	};

	return this;
})();