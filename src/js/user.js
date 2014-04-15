/* User object */
function User () {
	this.logout();

	return this;
}

/**
 * Log in a user.
 * @param {string} The user id.
 * @param {string} The user password.
 */
User.prototype.login = function (name, pass) {
	var temp = Backend.login(name, pass);
	this.agent = new GLOBAL.AGENT[temp[0]]();
};

/**
 * Log out the user.
 */
User.prototype.logout = function () {
	this.agent = null;
	this.water = 0;
};