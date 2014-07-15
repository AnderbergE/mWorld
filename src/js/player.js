/* Player object */
function Player () {
	this._agent = null;
	this._water = 0;

	var temp = Backend.getPlayer();
	this.agent = GLOBAL.AGENT[temp.agent];
	this._water = temp.water;

	return this;
}

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