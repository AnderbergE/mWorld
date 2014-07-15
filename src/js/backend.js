/**
 * Handles the communication with the backend.
 */
var Backend = {

	/**
	 * GET data.
	 */
	get: function (action) {
		var data = null;

		if (typeof Routes !== 'undefined' && Routes[action]) {
			var url = Routes[action]();

			var getter = function () {
				$.ajax(url, { async: false })
					.done(function (data) {
						data = JSON.parse(data);
						EventSystem.publish(GLOBAL.EVENT.connection, [true]);
					})
					.fail(function () {
						EventSystem.publish(GLOBAL.EVENT.connection, [false]);
						setTimeout(function () {
							getter();
						}, 1000);
					});
			};
			getter();
		}

		return data;
	},

	/**
	 * PUT data.
	 */
	put: function (action, data) {
		if (typeof Routes !== 'undefined' && Routes[action]) {
			var url = Routes[action]();
			var jsonData = JSON.stringify(data);

			var poster = function () {
				$.post(url, jsonData)
					.done(function () {
						EventSystem.publish(GLOBAL.EVENT.connection, [true]);
					})
					.fail(function () {
						EventSystem.publish(GLOBAL.EVENT.connection, [false]);
						setTimeout(function () {
							poster();
						}, 1000);
					});
			};
			poster();
		}
	},


	/**
	 * GET the data of the player.
	 * @returns {Object} An object with data about the player.
	 */
	getPlayer: function () {
		var data = this.get('current_api_players_path');
		if (!data) {
			data = {
				agent: 0,
				water: 2
			};
		}

		return data;
	},

	/**
	 * GET the garden appearance.
	 * @returns {Object} An object with data about the garden.
	 */
	getGarden: function () {
		var data = [
			{ id: '00', x: 0, y: 0, level: 1 },
			{ id: '20', x: 2, y: 0, level: 3 }
		];

		return data;
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
	 * PUT player session results.
	 */
	putSession: function (data) {
		this.put('register_api_player_sessions_path', data);
	},

	/**
	 * PUT garden updates.
	 */
	putGardenUpdates: function (data) {
		this.put('', data);
	}
};