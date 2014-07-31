/**
 * Handles the communication with the backend.
 * The communication needs a Route object set which will tell where
 * to send the different get and post requests.
 * @global
 */
var Backend = {
	/**
	 * @property {Object} _maxTries - Max tries to send requests.
	 * @default
	 * @private
	 */
	_maxTries: 10,

	/**
	 * Basic ajax call.
	 * Publishes connection event if ajax call fail.
	 * @param {Object} settings - An object with settings to jQuery ajax call
	 * @param {number} tries - Amount of times to resend if something goes wrong.
	 *                         Default value is max tries.
	 *                         NOTE: If server code is between 400 and 500 it will not retry.
	 * @return {Array} A promise to the ajax request.
	 *                 NOTE: This has a fail function set which will show connection lost.
	 */
	ajax: function (settings, tries) {
		if (isNaN(tries) || tries === null) {
			tries = this._maxTries;
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
					(_this._maxTries - tries) * 1000);
			} else {
				EventSystem.publish(GLOBAL.EVENT.connectionLost);
			}
		});
	},

	/**
	 * GET request.
	 * Publishes connection event when get is done.
	 * NOTE: This request is sent synchronous.
	 * @param {String} routeName - The name of the route function.
	 * @param {*} parameters - optional parameters for the route action.
	 * @return {Object} The object returned from the ajax request.
	 */
	get: function (routeName, parameters) {
		var ret = null;

		if (typeof Routes !== 'undefined' && Routes[routeName]) {
			var settings = {
				url: Routes[routeName](parameters),
				async: false
			};

			this.ajax(settings).done(function (data) {
				ret = data;
				EventSystem.publish(GLOBAL.EVENT.connection, [true]);
			});
		}

		return ret;
	},

	/**
	 * POST data.
	 * Publishes connection event when post is done.
	 * @param {String} routeName - The name of the route function.
	 * @param {Object} data - The data to send (will be transformed to JSON-format).
	 */
	post: function (routeName, data, callback) {
		/* We wrap the data in "magic" to make it easier to find at the server. */
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
			/* This should only be used when in local mode. */
			console.log('POST (' + routeName + '): ' + stringified);
		}
	},


	/**
	 * GET the data of the player.
	 * @return {Object} An object with data about the player.
	 */
	getPlayer: function () {
		return this.get('current_api_players_path');
	},

	/**
	 * GET the garden appearance.
	 * @return {Object} An object with data about the garden.
	 */
	getGarden: function () {
		return this.get('current_api_gardens_path');
	},

	/**
	 * GET the next game that should be played.
	 * @return {Object} An object with data about the next game.
	 */
	getScenario: function () {
		var data = this.get('current_api_scenarios_path');

		if (data) {
			// Add intro and outro for the game.
			data.mode.unshift(GLOBAL.MODE.intro);
			data.mode.push(GLOBAL.MODE.outro);
		}

		return data;
	},

	/**
	 * POST agent updates.
	 * @param {Object} data - The agent updates.
	 */
	putAgent: function (data) {
		this.post('', data);
	},

	/**
	 * POST garden updates.
	 * Publishes plantUpgrade event.
	 * @param {Object} data - The garden updates.
	 */
	putUpgradePlant: function (data) {
		this.post('upgrade_field_api_gardens_path', data, function (data) {
			EventSystem.publish(GLOBAL.EVENT.plantUpgrade, [data]);
		});
	},

	/**
	 * POST player session results.
	 * @param {Object} data - The session results.
	 */
	putSession: function (data) {
		this.post('register_api_player_sessions_path', data);
	}
};