/* User object */
function User () {
	this._water = 0;
	this._agent = null;
	this.logout();

	return this;
}
Object.defineProperty(User.prototype, 'water', {
	get: function() {
		return this._water;
	},
	set: function(value) {
		if (value >= 0) {
			var diff = value - this._water;
			this._water = value;
			Event.publish(GLOBAL.EVENT.waterAdded, [this._water, diff]);
		}
	}
});
Object.defineProperty(User.prototype, 'agent', {
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
 * Log in a user.
 * @param {string} The user id.
 * @param {string} The user password.
 */
User.prototype.login = function (name, pass) {
	var temp = Backend.login(name, pass);
	this.agent = GLOBAL.AGENT[temp[0]];
	this.water = 2;
};

/**
 * Log out the user.
 */
User.prototype.logout = function () {
	this.agent = null;
	this.water = 0;
};