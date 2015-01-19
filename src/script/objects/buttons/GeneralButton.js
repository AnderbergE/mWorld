var GLOBAL = require('../../global.js');

module.exports = GeneralButton;

GeneralButton.prototype = Object.create(Phaser.Group.prototype);
GeneralButton.prototype.constructor = GeneralButton;
GeneralButton.prototype.buttonColor = GLOBAL.BUTTON_COLOR; // TODO: Can we use this global directly instead?

/**
 * A general button.
 * @param {Object} game - A reference to the Phaser game.
 * @param {Object} options - A list of options:
 *        {number} x: the x position (default 0).
 *        {number} y: the y position (default 0).
 *        {number} size: the side of the button (default 75).
 *        {string} background: the frame of the background (default 'button').
                               NOTE: Needs to be in the 'objects' atlas.
 *        {number} color: the color of the button (default 0xb2911d).
 *                        NOTE: You can also set the prototype property buttonColor.
 *        {number} colorPressed: the color when the button is pressed (default darker color).
 *        {function} onClick: a function to run when a button is clicked.
 *        {boolean} disabled: true if the button should be disabled (default false).
 *        {boolean} keepDown: true if the button should not auto raise when clicked (default false).
 * @return {Object} Itself.
 */
function GeneralButton (game, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	options = options || {};
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.color = options.color || this.buttonColor;
	if (options.colorPressed) {
		this.colorPressed = options.colorPressed;
	} else {
		var col = Phaser.Color.getRGB(this.color);
		col.red -= col.red < 40 ? col.red : 40;
		col.green -= col.green < 40 ? col.green : 40;
		col.blue -= col.blue < 40 ? col.blue : 40;
		this.colorPressed = Phaser.Color.getColor(col.red, col.green, col.blue);
	}
	this.onClick = options.onClick;
	this.disabled = options.disabled || false;
	this.keepDown = options.keepDown || false;

	var background = options.background;
	if (typeof background === 'undefined') {
		background = 'button';
	}
	this.bg = this.create(0, 0, (background === null ? null : 'objects'), background);
	this.bg.inputEnabled = true;

	this.bg.events.onInputDown.add(function () {
		if (this.disabled || this.bg.tint === this.colorPressed) {
			return;
		}

		this.bg.tint = this.colorPressed;
		game.add.audio('click').play();

		if (this.onClick) {
			this.onClick();
		}
	}, this);

	this.bg.events.onInputUp.add(function () {
		if (!this.keepDown) {
			this.reset();
		}
	}, this);

	this.reset();
	this.setSize(options.size || 75);

	return this;
}

/**
 * Set the size of this button.
 * @param {Number} The new size.
 */
GeneralButton.prototype.setSize = function (size) {
	this.size = size;
	this.bg.width = size;
	this.bg.height = size;
};

/**
 * Reset the buttons to "up" state.
 */
GeneralButton.prototype.reset = function () {
	this.bg.tint = this.color;
};

/**
 * Set the buttons to "down" state.
 * NOTE: This does not fire the click functions.
 */
GeneralButton.prototype.setDown = function () {
	this.bg.tint = this.colorPressed;
};

/**
 * Highlight the buttons.
 * @param {Number} How long to highlight
 * @returns {Object} The animation tweenmax.
 */
GeneralButton.prototype.highlight = function (duration) {
	return TweenMax.to(this, 0.5, { alpha: 0 }).backForth(duration || 3);
};