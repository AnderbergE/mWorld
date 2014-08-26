NumberButton.prototype = Object.create(GeneralButton.prototype);
NumberButton.prototype.constructor = NumberButton;

/**
 * A button with number representations on it.
 * If you supply more than one representation the button will stretch.
 * Publishes numberPress event on click.
 * NOTE: This button will not go to "up" state after click unless you set keepDown option to false.
 * @param {number} number - The number for the button.
 * @param {number|Array} representations - The representations of the button (see GLOBAL.NUMBER_REPRESENTATION).
 * @param {Object} options - A list of options (in addition to GeneralButton):
 *        {number} min: The minimum value of the button (default number parameter).
 *        {number} max: The maximum value of the button (default number parameter).
 *        {number} size: the small side of the button (the other depend on representation amount) (default 75).
 *        {boolean} vertical: stretch button vertically if many representations, otherwise horisontally (default true).
 * @return {Object} Itself.
 */
function NumberButton (number, representations, options) {
	/* The order here is a bit weird because GeneralButton calls setSize, which this class overshadows. */
	if (typeof options.keepDown === 'undefined' || options.keepDown === null) {
		options.keepDown = true;
	}
	this.vertical = options.vertical;
	if (typeof this.vertical === 'undefined' || this.vertical === null) {
		this.vertical = true;
	}
	this.representations = representations;


	GeneralButton.call(this, options); // Parent constructor.

	this.min = options.min || number;
	this.max = options.max || number;
	this._number = 0;
	this.number = number;

	this._clicker = options.onClick;
	/* This will be called in the GeneralButton's onInputDown */
	this.onClick = function () {
		EventSystem.publish(GLOBAL.EVENT.numberPress, [this.number, this.representations]);
		if (this._clicker) {
			this._clicker(this.number);
		}
	};

	return this;
}

/**
 * @property {number|Array} representations - The representations on the button.
 */
Object.defineProperty(NumberButton.prototype, 'representations', {
	get: function () {
		return this._representations;
	},
	set: function (value) {
		this._representations = Array.isArray(value) ? value : [value];
		if (typeof this.number !== 'undefined' && this.number !== null) {
			this.updateGraphics();
		}
	}
});

/**
 * @property {number} number - The number on the button. Set according to representations.
 *                             NOTE: This can not be less or more than min or max.
 */
Object.defineProperty(NumberButton.prototype, 'number', {
	get: function () {
		return this._number;
	},
	set: function (value) {
		/* Chcek boundaries */
		if (value < this.min) { value = this.min; }
		if (value > this.max) { value = this.max; }
		if (value === this._number) { return; }

		this._number = value;

		this.updateGraphics();
	}
});

/**
 * Update the graphics of the button.
 */
NumberButton.prototype.updateGraphics = function () {
	/* Remove old graphics. */
	if (this.children.length > 1) {
		this.removeBetween(1, this.children.length-1, true);
	}

	/* Add new graphics. */
	var x = 0;
	var y = 0;
	var offset = 0;
	var useNum = Math.abs(this._number);
	for (var i = 0; i < this.representations.length; i++) {
		if (this.vertical) { y = this.size * i; }
		else { x = this.size * i; }

		if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.dots) {
			offset = this.size/10;
			this.add(new DotsRepresentation(useNum, x+offset, y+offset, this.size-offset*2, this.color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.fingers) {
			offset = this.size/12;
			this.add(new FingerRepresentation(useNum, x+offset, y+offset, this.size-offset*2, this.color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.strikes) {
			offset = this.size/6;
			this.add(new StrikeRepresentation(useNum, x+offset, y+offset, this.size-offset*2, this.color, this.max));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.numbers) {
			this.add(new NumberRepresentation(this._number, x, y, this.size/2, this.color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.dice) {
			offset = this.size/6;
			this.add(new DiceRepresentation(useNum, x+offset, y+offset, this.size-offset*2, this.color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.signedNumbers) {
			this.add(new SignedNumberRepresentation(this._number, x, y, this.size/2, this.color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			this._number = this._number % 2;
			this.add(new YesnoRepresentation(this._number, x, y, this.size/2, this.color));
		}
	}
};

/**
 * Set the size of this button.
 * @param {Number} The new size.
 */
NumberButton.prototype.setSize = function (size) {
	GeneralButton.prototype.setSize.call(this, size);

	if (this.vertical) {
		this.bg.height *= this.representations.length;
	} else {
		this.bg.width *= this.representations.length;
	}
};