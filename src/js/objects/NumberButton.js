/* A button for a number with flexible representation. */
NumberButton.prototype = Object.create(GeneralButton.prototype);
NumberButton.prototype.constructor = NumberButton;
/**
 * A button with a representation on it (publishes numberPress event on click).
 * @param {Number} The number for the button
 * @param {Number} The representations of the button (see GLOBAL.REPRESENTATION)
 * @param {Object} A list of options (in addition to GeneralButton):
 *		vertical: stretch button vertically, otherwise horisontally (default true)
 *		onClick: a function to run when a button is clicked
 * @returns {Object} Itself.
 */
function NumberButton (number, representations, options) {
	GeneralButton.call(this, options); // Parent constructor.
	this.representations = Array.isArray(representations) ? representations : [representations];
	this.vertical = options.vertical || true;
	this.clicker = options.onClick;
	this.min = options.min || 1;
	this.max = options.max || 9;
	if (this.vertical) { this.bg.height *= this.representations.length; }
	else { this.bg.width *= this.representations.length; }

	this._number = 0;
	this.number = number;

	this.onClick = function () {
		if (this.clicker) { this.clicker(this.number); }
		Event.publish(GLOBAL.EVENT.numberPress, [this.number, this.representations]);
	};

	return this;
}

Object.defineProperty(NumberButton.prototype, 'number', {
	get: function() { return this._number; },
	set: function(value) {
		if (value < this.min) { value = this.min; }
		if (value > this.max) { value = this.max; }
		this._number = value;
		if (this.children.length > 1) {
			this.removeBetween(1, this.children.length-1, true);
		}

		var x = 0;
		var y = 0;
		for (var i = 0; i < this.representations.length; i++) {
			if (this.vertical) { y = this.size * i; }
			else { x = this.size * i; }

			if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.dots) {
				var offset = this.size/6;
				this.add(new DiceRepresentation(this._number, x+offset, y+offset, this.size-offset*2, this.color));

			} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.numbers) {
				this.add(new NumberRepresentation(this._number, x, y, this.size/2, this.color));

			} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
				this._number = this._number % 2;
				this.add(new YesnoRepresentation(this._number, x, y, this.size/2, this.color));
			}
		}
	}
});