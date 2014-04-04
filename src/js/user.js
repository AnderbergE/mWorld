function User () {
	this.logout();

	return this;
}

User.prototype.login = function (name, pass) {
	var temp = backend.login(name, pass);
	this.agent = new GLOBAL.AGENT[temp[0]]();
};

User.prototype.logout = function () {
	this.agent = null;
	this.water = 0;
};