var GLOBAL = require('../../global.js');
var TextButton = require('./TextButton.js');
var NumberButton = require('./NumberButton.js');

module.exports = ButtonPanel;

ButtonPanel.prototype = Object.create(Phaser.Group.prototype);
ButtonPanel.prototype.constructor = ButtonPanel;

/**
 * Create a panel filled with buttons.
 * See NumberButton and GeneralButton for more information.
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} amount - The number of buttons (NOTE, this will be overwritten if you set option max)
 * @param {number|Array} representations - The representations to use on the buttons.
 * @param {Object} options - options for the panel:
 *        {number} x - The x position (default is 0)
 *        {number} y - The y position (default is 0)
 *        {number} size - The size of the panel (default is game width or height, depending on if vertical is set)
 *        {number} method - The method of the panel (default is GLOBAL.METHOD.count)
 *        {boolean} vertical - If the panel should be vertical (default is false)
 *        {boolean} reversed - If the panel should display the buttons in reverse (default is false)
 *        {number} min - The smallest number on the panel (default is 1)
 *        {number} max - The biggest number on the panel (default is min + amount - 1)
 *        {function} onClick - What should happen when clicking the button
 *        {string} background - The sprite key for the button backgrounds
 *        {string} color - The color of the representation
 *        {number} maxButtonSize - The maximum size of the buttons (default is 75)
 *                                 NOTE: The button size is always calculated to not overlap
 * @return {Object} Itself.
 */
function ButtonPanel (game, amount, representations, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.representations = representations;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.vertical = options.vertical || false;
	this.reversed = options.reversed || false;
	this.size = options.size || (this.vertical ? this.game.world.height : this.game.world.width);
	this.method = options.method || GLOBAL.METHOD.count;

	this.color = options.color;
	this.background = options.background;
	if (!this.background && (this.method === GLOBAL.METHOD.count || this.method === GLOBAL.METHOD.incrementalSteps)) {
		this.background = 'button';
	}
	this.maxButtonSize = options.maxButtonSize || 75;
	this.onClick = options.onClick;

	/* Set range of the panel, which will create the buttons. */
	options.min = options.min || 1;
	this.setRange(options.min, options.max || (options.min + amount - 1));

	return this;
}

/**
 * Create the buttons.
 * @private
 */
ButtonPanel.prototype._createButtons = function () {
	this.removeAll(true);

	/* Calculate max button size. */
	var buttonSize = this.size/this.amount;
	if (buttonSize > this.maxButtonSize) {
		buttonSize = this.maxButtonSize;
	}

	/* These options will be used when creating the buttons. */
	var buttonOptions = {
		min: this.min,
		max: this.max,
		size: buttonSize,
		background: this.background,
		color: this.color,
		vertical: !this.vertical,
		onClick: this.onClick
	};

	/* Set up the buttons that should be in the panel. */
	if (this.method === GLOBAL.METHOD.incrementalSteps) {
		buttonOptions.doNotAdapt = true;
		// Create buttons first, then add them in their order (this is because we manipulate the buttonOptions later)
		var change = new NumberButton(this.game, 1, this.representations, buttonOptions);

		// Put the other buttons centered.
		buttonOptions[this.vertical ? 'x' : 'y'] = ((this.representations.length - 1) * buttonSize)/2;
		buttonOptions.onClick = function () { change.bg.events.onInputDown.dispatch(); };
		var go = new NumberButton(this.game, 1, GLOBAL.NUMBER_REPRESENTATION.yesno, buttonOptions);

		buttonOptions.keepDown = false;
		buttonOptions.background = 'button_minus';
		buttonOptions.onClick = function () { change.number--; };
		var minus = new TextButton(this.game, '-', buttonOptions);

		buttonOptions.background = 'button_plus';
		buttonOptions.onClick = function () { change.number++; };
		var plus = new TextButton(this.game, '+', buttonOptions);

		if (this.vertical) {
			minus.bg.rotation = -Math.PI/2;
			minus.bg.y += minus.bg.width;
			minus._text.y -= 6;
			plus.bg.rotation = -Math.PI/2;
			plus.bg.y += plus.bg.width;
			plus._text.y += 5;
		} else {
			minus._text.x += 5;
			plus._text.x -= 4;
		}

		this.add(minus);
		this.add(change);
		this.add(plus);
		this.add(go);

	} else {
		for (var i = this.min; i <= this.max; i++) {
			this.add(new NumberButton(this.game, i, this.representations, buttonOptions));
		}
	}

	/* Reverse the order of the buttons if needed. */
	if (this.reversed) { this.reverse(); }


	/* Calculate white space. */
	var widthLeft = this.size - buttonSize*this.amount;
	var paddingSize = widthLeft/this.amount;
	if (paddingSize > buttonSize/2) {
		paddingSize = buttonSize/2;
	}
	var margin = (this.size - this.amount*buttonSize - (this.amount - 1)*paddingSize)/2;
	var fullSize = paddingSize + buttonSize;

	/* Set up the x and y positions. */
	var direction = this.vertical ? 'y' : 'x';
	for (var j = 0; j < this.length; j++) {
		this.children[j][direction] = margin + fullSize*j;
	}
};

/**
 * Update the values of the buttons.
 * @private
 */
ButtonPanel.prototype._updateButtons = function () {
	if (this.method === GLOBAL.METHOD.incrementalSteps) {
		var button = this.children[this.reversed ? 2 : 1];
		button.min = this.min;
		button.max = this.max;
	} else {
		var val, dir;
		if (this.reversed) {
			val = this.max;
			dir = -1;
		} else {
			val = this.min;
			dir = 1;
		}
		for (var key in this.children) {
			this.children[key].min = this.min;
			this.children[key].max = this.max;
			this.children[key].number = val;
			val += dir;
		}
	}
};

/**
 * Set the range for the button panel. It will create or update the panel accordingly.
 * @param {Number} The minimum amount in the panel.
 * @param {Number} The maximum amount in the panel.
 */
ButtonPanel.prototype.setRange = function (min, max) {
	this.min = min;
	this.max = max;

	var oldAmount = this.amount || 0;
	// incrementalSteps have these buttons: (-) (number) (+) (ok)
	this.amount = this.method === GLOBAL.METHOD.incrementalSteps ? 4 : (this.max - this.min + 1);

	if (this.amount !== oldAmount || this.length <= 0) {
		this._createButtons();
	} else {
		this._updateButtons();
	}
};

/**
 * Reset all buttons to "up" state.
 */
ButtonPanel.prototype.reset = function () {
	for (var i = 0; i < this.length; i++) {
		this.children[i].reset();
	}
};

/**
 * Highlight all buttons.
 * @param {Number} duration - How long to highlight the buttons.
 * @param {Number} from - The opacity to highlight from (will end at this as well) (default 1).
 * @returns {Object} The animation timeline.
 */
ButtonPanel.prototype.highlight = function (duration, from) {
	var t = new TimelineMax();
	for (var i = 0; i < this.length; i++) {
		t.add(this.children[i].highlight(duration, from), 0);
	}
	return t;
};

/**
 * Disable/Enable all buttons.
 * @param {Boolean} disable - True is disabled, false is enabled
 */
ButtonPanel.prototype.disable = function (value) {
	for (var i = 0; i < this.length; i++) {
		this.children[i].disabled = value;
	}
};