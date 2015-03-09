var GeneralButton = require('./GeneralButton.js');
var DotsRepresentation = require('../representations/DotsRepresentation.js');
var FingerRepresentation = require('../representations/FingerRepresentation.js');
var StrikeRepresentation = require('../representations/StrikeRepresentation.js');
var NumberRepresentation = require('../representations/NumberRepresentation.js');
var DiceRepresentation = require('../representations/DiceRepresentation.js');
var YesnoRepresentation = require('../representations/YesnoRepresentation.js');
var GLOBAL = require('../../global.js');
var EventSystem = require('../../pubsub.js');

module.exports = NumberButton;

NumberButton.prototype = Object.create(GeneralButton.prototype);
NumberButton.prototype.constructor = NumberButton;

/**
 * A button with number representations on it.
 * If you supply more than one representation the button will stretch.
 * Publishes numberPress event on click.
 * NOTE: This button will not go to "up" state after click unless you set keepDown option to false.
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} number - The number for the button.
 * @param {number|Array} representations - The representations of the button (see GLOBAL.NUMBER_REPRESENTATION).
 * @param {Object} options - A list of options (in addition to GeneralButton):
 *        {number} min: The minimum value of the button.
 *        {number} max: The maximum value of the button.
 *        {number} size: the small side of the button (the other depend on representation amount) (default 75).
 *        {boolean} vertical: stretch button vertically if many representations, otherwise horisontally (default true).
 *        {string} spriteKey: Used for object representation only. The key to the sprite.
 *        {string} spriteFrame: Used for object representation only. The framename in the sprite.
                                NOTE: Used like this: spriteFrame + this.number
 * @returns {Object} Itself.
 */
function NumberButton (game, number, representations, options) {
	/* The order here is a bit weird because GeneralButton calls setSize, which this class overshadows. */
	if (typeof options.keepDown === 'undefined' || options.keepDown === null) {
		options.keepDown = true;
	}
	this.representations = representations;
	this.background = options.background;
	this.spriteKey = options.spriteKey;
	this.spriteFrame = options.spriteFrame;

	GeneralButton.call(this, game, options); // Parent constructor.

	this.vertical = options.vertical;
	if (typeof this.vertical === 'undefined' || this.vertical === null) {
		this.vertical = true;
	}
	this.setDirection(!this.vertical);

	this.min = options.min || null;
	this.max = options.max || null;
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
		if (this.min && value < this.min) { value = this.min; }
		if (this.max && value > this.max) { value = this.max; }
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

	if (typeof this.background === 'undefined' && this.representations[0] !== GLOBAL.NUMBER_REPRESENTATION.yesno) {
		if (this._number > 0) {
			this.bg.frameName = 'button_plus';
		} else if (this._number < 0) {
			this.bg.frameName = 'button_minus';
		} else {
			this.bg.frameName = 'button_zero';
		}
		this.setSize();
		this.reset();
	}

	/* Add new graphics. */
	var x = 0;
	var y = 0;
	var offset = 0;
	var useNum = Math.abs(this._number);
	var rep;
	for (var i = 0; i < this.representations.length; i++) {
		if (this.vertical) {
			y = this.size * i;
		} else {
			x = this.size * i;
		}
		if (i > 0) {
			var bmd = this.vertical ? this.game.add.bitmapData(this.size - 10, 3) : this.game.add.bitmapData(3, this.size - 10);
			bmd.ctx.fillStyle = '#000000';
			bmd.ctx.globalAlpha = 0.2;
			bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 2).fill();
			if (this.vertical) {
				this.create(x + 5, y - 1, bmd);
			} else {
				this.create(x - 1, y + 5, bmd);
			}
		}

		rep = this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.mixed ? this.game.rnd.pick([
			GLOBAL.NUMBER_REPRESENTATION.dots,
			GLOBAL.NUMBER_REPRESENTATION.fingers,
			GLOBAL.NUMBER_REPRESENTATION.strikes,
			GLOBAL.NUMBER_REPRESENTATION.numbers,
			GLOBAL.NUMBER_REPRESENTATION.dice
		]) : this.representations[i];

		if (rep === GLOBAL.NUMBER_REPRESENTATION.dots) {
			offset = this.calcOffset(16);
			this.add(new DotsRepresentation(this.game, useNum, x+offset.x, y+offset.y, this.size-offset.o, this.color));

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.fingers) {
			offset = this.calcOffset(24);
			this.add(new FingerRepresentation(this.game, useNum, x+offset.x, y+offset.y, this.size-offset.o, this.color));

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.strikes) {
			offset = this.calcOffset(12);
			this.add(new StrikeRepresentation(this.game, useNum, x+offset.x, y+offset.y, this.size-offset.o, this.color, this.max - this.min + 1));

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.objects) {
			var s = this.create(x, y, this.spriteKey, (this.spriteFrame ? this.spriteFrame + Math.abs(this._number) : null));
			var scale = this.size/(s.width > s.height ? s.width : s.height)*0.8;
			s.scale.set(scale);
			s.x = (!this.direction ? (this._number > 0 ? this.size * 0.8 : this.size * 1.2) : this.size)/2 - s.width/2;
			s.y = (this.direction ? (this._number > 0 ? this.size * 1.2 : this.size * 0.8) : this.size)/2 - s.height/2;

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.numbers) {
			this.add(new NumberRepresentation(this.game, this._number, x, y+this.size/8, this.size/2, this.color));

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.dice) {
			offset = this.calcOffset(12);
			this.add(new DiceRepresentation(this.game, useNum, x+offset.x, y+offset.y, this.size-offset.o, this.color));

		} else if (rep === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			this._number = this._number % 2;
			offset = this.size*0.1;
			this.add(new YesnoRepresentation(this.game, this._number, x + offset, y + offset, this.size - offset*2));
		}
	}
};

/**
 * Calculate the different offsets for the button (needed due to arrow in button).
 * @param {Number} offset - Offset from button edge (used like: this.size/offset).
 * @returns {Object} Offsets on the form { o: offset, x: x, y: y }.
 */
NumberButton.prototype.calcOffset = function (offset) {
	var t = {
		x: 0,
		y: 0,
		o: this.size/offset
	};

	if (this.background) { // Probably square looking button.
		t.x = t.o*2;
		t.y = t.o*2;
	} else if (this.direction) { /* Up/Down */
		t.x = t.o*1.8;
		t.y = t.o*(this._number >= 0 ? 3.3 : 1);
	} else { /* Left/Right */
		t.x = t.o*(this._number >= 0 ? 1 : 3.3);
		t.y = t.o*2;
	}

	t.o *= 4;
	return t;
};

/**
 * Set the size of this button.
 * @param {Number} The new size.
 * @returns {Object} This button.
 */
NumberButton.prototype.setSize = function (size) {
	GeneralButton.prototype.setSize.call(this, size || this.size);

	// If the button should expand horizontally it will be rotated.
	// So we always want to change height, not width.
	this.bg.height *= this.representations.length;

	return this;
};

/**
 * Set the direction of the background button (where the arrow should point).
 * @param {Boolean} val - True = up/down, false = left/right.
 * @returns {Object} This button.
 */
NumberButton.prototype.setDirection = function (val) {
	this.direction = val;
	if (val) {
		this.bg.rotation = -Math.PI/2;
		this.bg.y += this.bg.width;
		this.bg.adjusted = this.bg.width;
	} else {
		this.bg.rotation = 0;
		this.bg.y -= this.bg.adjusted || 0;
	}

	if (this.number) {
		this.updateGraphics();
	}

	return this;
};