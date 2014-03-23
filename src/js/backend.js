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
		return [2, 1, 6];
	};

	return this;
}