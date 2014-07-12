/**
 * Handles the communication with the backend.
 */
var Backend = {

	/**
	 * GET the data of the player.
	 * @returns {Object} An object with data about the player.
	 */
	getUser: function () {
		var data = {
			agent: 0,
			water: 2
		};

		return data;
	},

	/**
	 * GET the garden appearance.
	 * @returns {Object} An object with data about the garden.
	 */
	getGarden: function () {
		return [];
	},

	/**
	 * GET the next game that should be played.
	 * @returns {Object} An object with data about the next game.
	 */
	getScenario: function () {
		var data = {
			subgame: 1,
			method: 0,
			representation: [0],
			range: [1, 4],
			mode: [0, 1, 2],
			roundsPerMode: 3
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
	},


	/**
	 * PUT updates of player information.
	 */
	put: function (data) {
		console.log(JSON.stringify(data));
		return JSON.stringify(data);
	}
};