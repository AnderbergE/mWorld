/*
 * Handles the communication with the backend.
 */
var Backend = (function () {
	/**
	* GET the next game that should be played.
	* @returns {Object} An object with data about the next game.
	*/
	this.nextGame = function () {
		return {
			type: 3,
			representation: 0,
			amount: 4,
			roundsPerMode: 1
		};
	};

	/**
	* PUT the login for a specific user.
	* TODO: Investigate if login should be made from the game or before.
	* @param {string} The user id.
	* @param {string} The user password.
	* @returns {Object} An object with data about the user.
	*/
	this.login = function (name, pass) {
		return [0, name === pass];
	};

	return this;
})();