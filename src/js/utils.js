/* Utility functions */
function Counter (max, loop, start) {
	this._loop = loop || false;

	this._max = max;
	this._value = start || 0;
}
Counter.prototype.left = function () {
	return this._max - this.value;
};
Counter.prototype.add = function (value) {
	if (value >= this._max) {
		if (this._loop) {
			this._value = 0;
		}
		return true;
	} else {
		this._value = value;
		return false;
	}
};