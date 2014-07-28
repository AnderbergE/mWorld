GeneralButton.prototype = Object.create(Phaser.Group.prototype);
GeneralButton.prototype.constructor = GeneralButton;
/**
 * A general button.
 * @param {Object} A list of options:
 *		x: the x position (default 0)
 *		y: the y position (default 0)
 *		size: the side of the button (default 75)
 *		background: the background for the button
 *		color: the color of the representation (default '#000000')
 *		disabled: true if the buttons should be disabled (default false)
 * @returns {Object} Itself.
 */
function GeneralButton (options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.color = options.color || '#000000';
	this.disabled = options.disabled || false;

	this.bg = game.add.sprite(0, 0, options.background, 0, this);
	this.bg.inputEnabled = true;
	this.bg.events.onInputDown.add(function () {
		if (this.disabled) { return; }

		game.add.audio('click').play();
		if (this.bg.frame % 2 === 0) { this.bg.frame++; }
		if (this.onClick) { this.onClick(); }
	}, this);

	this.setSize(options.size || 75);

	return this;
}

GeneralButton.prototype.setSize = function (size) {
	this.size = size;
	this.bg.width = size;
	this.bg.height = size;
};

GeneralButton.prototype.reset = function () {
	this.bg.frame -= this.bg.frame % 2;
};

GeneralButton.prototype.highlight = function (duration) {
	return TweenMax.to(this, 0.5, { alpha: 0 }).backForth(duration || 3);
};