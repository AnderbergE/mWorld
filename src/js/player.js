/* Player object */
function Player () {
	this._agent = null;
	this._water = 0;

	this.tint = 0xffffff;

	var data = Backend.getPlayer();
	if (data) {
		this.agent = GLOBAL.AGENT[data.agent];
		this.tint = data.tint || this.tint;
		this._water = data.water || 0;
	}

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

Player.prototype.createAgent = function () {
	var agent = new this.agent();
	agent.tint = this.tint;
	return agent;
};