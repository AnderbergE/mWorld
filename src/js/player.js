/**
 * Creates an instance of Player.
 * The player will load information about it from server upon instantiation.
 *
 * @constructor
 */
function Player () {
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
	 * @property {number} tint - A tint for the agent.
	 */
	this.tint = 0xffffff;

	/* Load player data from server. */
	var data = Backend.getPlayer();
	if (data) {
		this.agent = GLOBAL.AGENT[data.agent];
		this.tint = data.tint || this.tint;
		this._water = data.water || 0; // Do not use water since that fires an event.
	}

	return this;
}

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
			var diff = value - this._water;
			this._water = value;
			EventSystem.publish(GLOBAL.EVENT.waterAdded, [this._water, diff]);
		}
	}
});

/**
 * @property {Object} agent - Pointer to the agent constructor.
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
 * @return {Object} An instance of the agent belonging to the player.
 */
Player.prototype.createAgent = function () {
	var agent = new this.agent();
	agent.tint = this.tint;
	return agent;
};