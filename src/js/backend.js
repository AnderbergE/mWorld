/**
 * Handles the communication with the backend.
 */
var Backend = (function () {

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             GET functions                                 */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

	/**
	* GET the next game that should be played.
	* @returns {Object} An object with data about the next game.
	*/
	this.nextGame = function () {
		var data = {
			type: 2,
			representation: [0],
			amount: 4, // TODO: Use range instead
			range: [1, 4],
			// mode: [0, 1, 2],
			roundsPerMode: 1
		};
		if (!Array.isArray(data.representation)) {
			data.representation = [data.representation];
		}
		if (!Array.isArray(data.range)) {
			data.range = [data.range];
		}
		if (data.mode) {
			if (!Array.isArray(data.mode)) {
				data.mode = [data.mode];
			}

			// Add intro and outro for the game.
			data.mode.unshift(GLOBAL.MODE.intro);
			data.mode.push(GLOBAL.MODE.outro);
		}

		return data;
	};

	/**
	* GET the garden appearance.
	* @returns {Object} An object with data about the garden.
	*/
	this.getGarden = function () {
		return [];
	};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             PUT functions                                 */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

	/**
	* PUT the login for a specific player.
	* TODO: Investigate if login should be made from the game or before.
	* @param {string} The player id.
	* @param {string} The player password.
	* @returns {Object} An object with data about the player.
	*/
	this.login = function (name, pass) {
		return [0, name === pass];
	};

	/**
	* PUT updates of player information.
	*/
	this.put = function (data) {
		return JSON.stringify(data);
	};

	return this;
})();