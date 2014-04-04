/*
 * Singleton
 * Handles the communication with the backend.
 */
function Backend () {
	if (Backend.prototype.singleton) {
		return Backend.prototype.singleton;
	}
	Backend.prototype.singleton = this;

	this.nextGame = function () {
		return [4, 0, 4];
	};

	this.login = function (name, pass) {
		return [0, name === pass];
	};

	return this;
}