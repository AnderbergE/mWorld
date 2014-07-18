/**
 * Handles the communication with the backend.
 */
var Backend = {

	/* Max tries to send requests. */
	maxTries: 10,

	/**
	 * Basic ajax call.
	 * @param {Object} settings - An object with settings to jQuery ajax call
	 */
	ajax: function (settings, tries) {
		if (isNaN(tries) || tries === null) {
			tries = this.maxTries;
		}
		tries--;

		var _this = this;
		return $.ajax(settings).fail(function (jqXHR) {
			if (jqXHR.status >= 400 && jqXHR.status < 500) {
				tries = 0;
			}

			if (tries > 0) {
				EventSystem.publish(GLOBAL.EVENT.connection, [false]);
				setTimeout(function () { _this.ajax(settings, tries); },
					(_this.maxTries - tries) * 1000);
			} else {
				EventSystem.publish(GLOBAL.EVENT.connectionLost);
			}
		});
	},

	/**
	 * GET data.
	 * @param {String} routeName - The name of the route function
	 * @param {*} parameters - optional parameter for the route action
	 */
	get: function (routeName, parameters) {
		var json = null;

		if (typeof Routes !== 'undefined' && Routes[routeName]) {
			var settings = {
				url: Routes[routeName](parameters),
				async: false
			};

			this.ajax(settings).done(function (data) {
				json = data;
				EventSystem.publish(GLOBAL.EVENT.connection, [true]);
			});
		}

		return json;
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
				dataType: 'json',
				contentType: 'application/json',
				data: stringified
			};

			this.ajax(settings).done(function (data) {
				EventSystem.publish(GLOBAL.EVENT.connection, [true]);
				if (callback) {
					callback(data);
				}
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