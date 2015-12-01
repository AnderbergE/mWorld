var GLOBAL = require('./global.js');
var EventSystem = require('./pubsub.js');

/**
 * Handles the communication with the backend.
 * The communication needs a Route object set, that object will tell where
 * to send the different get and post requests.
 * @global
 */
module.exports = {
	/**
	 * @property {Object} _maxTries - Max tries to send requests.
	 * @default
	 * @private
	 */
	_maxTries: 10,

	/**
	 * @property {Object} _rnd - A random data generator (we have no access to game object here).
	 * @private
	 */
	_rnd: new Phaser.RandomDataGenerator(),

	/**
	 * @property {Object} _previous - The previous scenario.
	 * @private
	 */
	_previous: -1,

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
		if (typeof Routes !== 'undefined') {
			return this.get('current_api_gardens_path');

		} else {
			// If there is no server connection, use temporary storage.
			return this._tempStore;
		}
	},

	/**
	 * GET the next game that should be played.
	 * @return {Object} An object with data about the next game.
	 */
	getScenario: function () {
		var data = this.get('current_api_scenarios_path');

		if (data) {
			// Setup subgame. First check if we should pick a random game.
			if (data.subgame === GLOBAL.STATE.random) {
				do {
					data.subgame = this._rnd.pick(GLOBAL.STATE.randomGames);
				} while (data.subgame === this._previous);
			}
			this._previous = data.subgame;

			// Representations are only one integer, but can include several representations.
			// Every position holds its own representation, see global.js for more info.
			var rep = [];
			while (data.representation >= 10) {
				rep.unshift(data.representation % 10);
				data.representation = Math.floor(data.representation/10);
			}
			rep.unshift(data.representation);
			data.representation = rep;

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
		this.post('update_agent_api_players_path', data);
	},

	/**
	 * POST garden updates.
	 * Publishes plantUpgrade event.
	 * @param {Object} data - The garden updates.
	 */
	putUpgradePlant: function (data) {
		if (typeof Routes !== 'undefined') {
			this.post('upgrade_field_api_gardens_path', data, function (data) {
				EventSystem.publish(GLOBAL.EVENT.plantUpgrade, [data]);
			});

		} else {
			// If we are missing a route to the server, we temporarily save the garden.
			this.localPutPlantUpgrade(data);
		}
	},

	putMovePlant: function (data) {
		if (typeof Routes !== 'undefined') {
			this.post('move_field_api_gardens_path', data, function (data) {
				EventSystem.publish(GLOBAL.EVENT.plantUpgrade, [data]);
			});

		} else {
			// If we are missing a route to the server, we temporarily save the garden.
			this._tempStore = this._tempStore || { fields: {} };
			var o = data.field;
			this._tempStore.fields[o.tag].x = o.x;
			this._tempStore.fields[o.tag].y = o.y;
		}
	},

	/**
	 * POST player session results.
	 * @param {Object} data - The session results.
	 */
	putSession: function (data) {
		this.post('register_api_player_sessions_path', data);
	},

	localPutPlantUpgrade: function (data) {
		var o = data.field;
		this._tempStore = this._tempStore || { fields: {} };

		if (!o.tag) { // New plant!
			o.tag = Math.random();
		}

		this._tempStore.fields[o.tag] = o;
		data.success = true;
		EventSystem.publish(GLOBAL.EVENT.plantUpgrade, [data]);
	}
};
