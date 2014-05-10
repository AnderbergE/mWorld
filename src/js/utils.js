/** 
 * A utility object to create counter with a max value.
 * Properties:
 * max:   What the max value is.
 * value: The current value of the counter. Setting it triggers onAdd function and possibly onMax.
 * left:  How much is left to max.

 * @param {integer} The max value for the counter.
 * @param {boolean} If the counter should loop back to 0 when reaching max value.
 * @param {integer} The start value the first loop.
 */
function Counter (max, loop, start) {
	this._loop = loop || false;

	this.max = max;
	this._value = start || 0;

	this.onAdd = null;
	this.onMax = null;

	return this;
}
Object.defineProperty(Counter.prototype, 'left', {
	get: function() { return this.max - this._value; },
});
Object.defineProperty(Counter.prototype, 'value', {
	get: function() { return this._value; },
	set: function(value) {
		this._value = value;
		if (this.onAdd) { this.onAdd(this._value, this.left); }

		if (this._value >= this.max) {
			if (this._loop) { this._value = 0; }
			if (this.onMax) { this.onMax(this._value); }
		}
	}
});

/** Calls the onAdd function. */
Counter.prototype.update = function () {
	if (this.onAdd) { this.onAdd(this._value, this.left); }
};

/** Adds a rounded rectangle to the built-in rendering context. */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) { r = w / 2; }
	if (h < 2 * r) { r = h / 2; }
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
	this.closePath();
	return this;
};