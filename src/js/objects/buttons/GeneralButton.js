GeneralButton.prototype = Object.create(Phaser.Group.prototype);
GeneralButton.prototype.constructor = GeneralButton;

/**
 * A general button.
 * @param {Object} options - A list of options:
 *        {number} x: the x position (default 0).
 *        {number} y: the y position (default 0).
 *        {number} size: the side of the button (default 75).
 *        {string} background: the background for the button (default 'wood').
 *        {string} color: the color of the content (default '#000000').
 *        {function} onClick: a function to run when a button is clicked.
 *        {boolean} disabled: true if the button should be disabled (default false).
 *        {boolean} keepDown: true if the button should not auto raise when clicked (default false).
 * @return {Object} Itself.
 */
function GeneralButton (options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	options = options || {};
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.color = options.color || '#000000';
	this.onClick = options.onClick;
	this.disabled = options.disabled || false;
	this.keepDown = options.keepDown || false;

	if (typeof options.background === 'undefined') {
		options.background = 'wood';
	}
	this.bg = this.create(0, 0, options.background);
	this.bg.inputEnabled = true;

	this.bg.events.onInputDown.add(function () {
		if (this.disabled || this.bg.frame % 2 !== 0) {
			return;
		}

		this.bg.frame++;
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
	this.bg.frame -= this.bg.frame % 2;
};

/**
 * Highlight the buttons.
 * @param {Number} How long to highlight
 * @returns {Object} The animation tweenmax.
 */
GeneralButton.prototype.highlight = function (duration) {
	return TweenMax.to(this, 0.5, { alpha: 0 }).backForth(duration || 3);
};