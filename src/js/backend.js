/**
 * Handles the communication with the backend.
 */
var Backend = {

	/**
	 * Basic ajax call.
	 * @param {Object} settings - An object with settings to jQuery ajax call
	 */
	ajax: function (settings) {
		var _this = this;
		return $.ajax(settings).fail(function (jqXHR) {
			console.log(jqXHR.status + ' ' + jqXHR.statusText);
			EventSystem.publish(GLOBAL.EVENT.connection, [false]);

			// TODO: Monitor error codes, such as 403 or 500
			// TODO: Create a function that is called if this takes too long.
			setTimeout(function () { _this.ajax(settings); }, 1000);
		});
	},

	/**
	 * GET data.
	 * @param {String} routeName - The name of the route function
	 * @param {*} parameters - optional parameter for the route action
	 */
	get: function (routeName, parameters) {
		var data = null;

		if (typeof Routes !== 'undefined' && Routes[routeName]) {
			var settings = {
				url: Routes[routeName](parameters),
				async: false
			};

			this.ajax(settings).done(function (data) {
				data = JSON.parse(data);
				EventSystem.publish(GLOBAL.EVENT.connection, [true]);
			});
		}

		return data;
	},

	/**
	 * PUT data.
	 * @param {String} routeName - The name of the route function
	 * @param {Object} data - The data to send (will be transformed to JSON-format)
	 */
	put: function (routeName, data, callback) {
		var stringified = JSON.stringify({ magic: data });
		if (typeof Routes !== 'undefined' && Routes[routeName]) {
			var settings = {
				url: Routes[routeName](),
				type: 'POST',
				data: stringified
			};

			this.ajax(settings).done(function (data) {
				EventSystem.publish(GLOBAL.EVENT.connection, [true]);
				callback(data);
			});
		} else {
			console.log('PUT (' + routeName + '): ' + stringified);
		}
	},


	/**
	 * GET the data of the player.
	 * @returns {Object} An object with data about the player.
	 */
	getPlayer: function () {
		return this.get('current_api_players_path');
	},

	/**
	 * GET the garden appearance.
	 * @returns {Object} An object with data about the garden.
	 */
	getGarden: function () {
		return this.get('current_api_gardens_path');
	},

	/**
	 * GET the next game that should be played.
	 * @returns {Object} An object with data about the next game.
	 */
	getScenario: function () {
		var data = this.get('current_api_scenarios_path');

		if (!Array.isArray(data.representation)) {
			data.representation = [data.representation];
		}

		if (!Array.isArray(data.mode)) {
			data.mode = [data.mode];
		}

		// Add intro and outro for the game.
		data.mode.unshift(GLOBAL.MODE.intro);
		data.mode.push(GLOBAL.MODE.outro);

		return data;
	},

	/**
	 * PUT agent updates.
	 * @param {Object} data - The agent updates
	 */
	putAgent: function (data) {
		this.put('', data);
	},

	/**
	 * PUT garden updates.
	 * @param {Object} data - The garden updates
	 */
	putUpgradePlant: function (data) {
		this.put('upgrade_field_api_gardens_path', data, function (data) {
			EventSystem.publish(GLOBAL.EVENT.plantUpgrade, [data]);
		});
	},

	/**
	 * PUT player session results.
	 * @param {Object} data - The session results
	 */
	putSession: function (data) {
		this.put('register_api_player_sessions_path', data);
	}
};