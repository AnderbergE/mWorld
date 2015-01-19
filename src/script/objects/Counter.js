module.exports = Counter;

/** 
 * An easy-to-use counter with a max value.
 * NOTE: This is not a graphical counter, only a programmatic.
 *
 * @constructor
 * @param {integer} max - The max value for the counter.
 * @param {boolean} loop - If the counter should loop back to 0 when reaching max value (default is false).
 * @param {integer} start - The start value the first loop (default is 0).
 * @return {Counter} This object.
 */
function Counter (max, loop, start) {
	/**
	 * @property {boolean} _loop - If the counter should loop.
	 * @default false
	 * @private
	 */
	this._loop = loop || false;

	/**
	 * @property {number} _value - The value of the counter.
	 * @default 0
	 * @private
	 */
	this._value = start || 0;


	/**
	 * @property {number} max - The max value of the counter.
	 */
	this.max = max;

	/**
	 * @property {function} onAdd - A function to run when adding water.
	 */
	this.onAdd = null;

	/**
	 * @property {function} onMax - A function to run when water is at max.
	 */
	this.onMax = null;

	return this;
}

/**
 * @property {number} left - Value left until max.
 * @readonly
 */
Object.defineProperty(Counter.prototype, 'left', {
	get: function() {
		return this.max - this._value;
	}
});

/**
 * @property {number} value - The value of the counter.
 *                            This will fire onAdd and onMax when applicable.
 */
Object.defineProperty(Counter.prototype, 'value', {
	get: function() {
		return this._value;
	},
	set: function(value) {
		var diff = value - this._value;
		this._value = value;

		if (this.onAdd) { this.onAdd(this._value, diff, this.left); }

		if (this._value >= this.max) {
			if (this._loop) { this._value = 0; }
			if (this.onMax) { this.onMax(this._value); }
		}
	}
});

/** Calls the onAdd function with current values. */
Counter.prototype.update = function () {
	if (this.onAdd) { this.onAdd(this._value, 0, this.left); }
};