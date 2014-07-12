/* Player object */
function Player () {
	this._water = 0;
	this._agent = null;
	this.logout();

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

/**
 * Log in a player.
 * @param {string} The player id.
 * @param {string} The player password.
 */
Player.prototype.login = function (name, pass) {
	var temp = Backend.login(name, pass);
	this.agent = GLOBAL.AGENT[temp[0]];
	this.water = 2;
};

/**
 * Log out the player.
 */
Player.prototype.logout = function () {
	this.agent = null;
	this.water = 0;
};