var backend = require('./backend.js');
var GLOBAL = require('./global.js');
var LANG = require('./language.js');
var EventSystem = require('./pubsub.js');

module.exports = Player;

/**
 * Creates an instance of Player.
 * The player will load information about it from server upon instantiation.
 *
 * @constructor
 * @param {Object} game - A reference to the Phaser game.
 */
function Player (game) {
	this.game = game;

	/**
	 * @property {number} _agent - A pointer to the agent type.
	 * @private
	 */
	this._agent = null;

	/**
	 * @property {number} _water - The amount of water the player has.
	 * @private
	 */
	this._water = 0;

	/**
	 * @property {number} name - The name of the player.
	 */
	this.name = LANG.TEXT.anonymous;

	/**
	 * @property {number} tint - A tint for the agent.
	 */
	this.tint = 0xffffff;

	/* Load player data from server. */
	var data = backend.getPlayer();
	if (data) {
		this.name = data.name;
		this.agent = GLOBAL.AGENT[data.agent.type];
		this.tint = data.agent.tint || this.tint;
		this._water = data.water || 0; // Do not use water since that fires an event.
	}

	return this;
}

/**
 * @property {number} maxWater - The maximum amount of water the player can have.
 */
Player.prototype.maxWater = 6;

/**
 * @property {number} water - The amount of water the player has.
 *                            Publishes waterAdded event when changed.
 */
Object.defineProperty(Player.prototype, 'water', {
	get: function() {
		return this._water;
	},
	set: function(value) {
		if (value >= 0) {
			value = value > this.maxWater ? this.maxWater : value;
			var diff = value - this._water;
			this._water = value;
			EventSystem.publish(GLOBAL.EVENT.waterAdded, [this._water, diff]);
		}
	}
});

/**
 * @property {Object} agent - Pointer to the agent constructor.
 *                            NOTE: Do not use this to create an agent, use createAgent.
 *                            NOTE: Updates the language object as well.
 */
Object.defineProperty(Player.prototype, 'agent', {
	get: function() {
		return this._agent;
	},
	set: function(value) {
		this._agent = value;
		if (this._agent && this._agent.prototype.id) {
			LANG.setAgent(this._agent.prototype.id);
		}
	}
});

/**
 * Creates an agent of the current type the player uses.
 * @returns {Object} An instance of the agent belonging to the player.
 */
Player.prototype.createAgent = function () {
	var agent = new this.agent(this.game);
	agent.tint = this.tint;
	return agent;
};