ButtonPanel.prototype = Object.create(Phaser.Group.prototype);
ButtonPanel.prototype.constructor = ButtonPanel;
/**
 * Create a panel filled with buttons.
 * See NumberButton and GeneralButton for more information.
 * @param {Number} amount - The number of buttons (NOTE, this will be overwritten if you set options min or max)
 * @param {Number|Array} representations - The representations to use on the buttons.
 * @param {Object} options - options for the panel:
 *        {Number} x - The x position (default is 0)
 *        {Number} y - The y position (default is 0)
 *        {Number} size - The size of the panel (default is game width or height, depending on if vertical is set)
 *        {Number} method - The method of the panel (default is GLOBAL.METHOD.count)
 *        {Boolean} vertical - If the panel should be vertical (default is false)
 *        {Boolean} reversed - If the panel should display the buttons in reverse (default is false)
 *        {Number} min - The smallest number on the panel (default is 1)
 *        {Number} max - The biggest number on the panel (default is min + amount - 1)
 *        {Function} onClick - What should happen when clicking the button
 *        {String} background - The sprite key for the button backgrounds
 *        {String} color - The color of the representation
 *        {Number} maxButtonSize - The maximum size of the buttons (default is 75)
 *                                 NOTE: The button size is always calculated to not overlap
 */
function ButtonPanel (amount, representations, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.min = options.min || 1;
	this.max = options.max || (this.min + amount - 1);
	this.amount = this.max - this.min + 1;

	options.vertical = options.vertical || false;
	options.size = options.size || (options.vertical ? game.world.height : game.world.width);
	options.method = options.method || GLOBAL.METHOD.count;
	options.maxButtonSize = options.maxButtonSize || 75;

	var buttonOptions = {
		background: options.background,
		color: options.color,
		onClick: options.onClick
	};
	if (options.method === GLOBAL.METHOD.incrementalSteps) {
		buttonOptions.min = this.min;
		buttonOptions.max = this.max;
		this.amount = 4; // Since we have these buttons: (-) (number) (+) (ok)
	}

	var buttonSize = options.size/this.amount;
	if (buttonSize > options.maxButtonSize) { buttonSize = options.maxButtonSize; }
	var widthLeft = options.size - buttonSize*this.amount;
	var paddingSize = widthLeft/this.amount;
	if (paddingSize > buttonSize/2) { paddingSize = buttonSize/2; }
	var margin = (options.size - this.amount*buttonSize - (this.amount-1)*paddingSize)/2;
	var fullSize = paddingSize+buttonSize;

	buttonOptions.size = buttonSize;
	var i;

	// Set up the buttons that should be in the panel.
	if (options.method === GLOBAL.METHOD.incrementalSteps) {
		var change = new NumberButton(1, representations, buttonOptions);
		buttonOptions.onClick = function () { change.number--; };
		this.add(new TextButton('-', buttonOptions));
		this.add(change);
		buttonOptions.onClick = function () { change.number++; };
		this.add(new TextButton('+', buttonOptions));
		buttonOptions.onClick = function () { change.bg.events.onInputDown.dispatch(); };
		this.add(new TextButton('v', buttonOptions));
	} else {
		buttonOptions.vertical = !options.vertical;
		for (i = this.min; i <= this.max; i++) {
			this.add(new NumberButton(i, representations, buttonOptions));
		}
	}

	// Reverse the order of the buttons if needed.
	if (options.reversed) { this.reverse(); }

	// Set up the x and y positions.
	if (options.vertical) {
		for (i = 0; i < this.length; i++) { this.children[i].y = margin + fullSize*i; }
	} else {
		for (i = 0; i < this.length; i++) { this.children[i].x = margin + fullSize*i; }
	}

	return this;
}

ButtonPanel.prototype.reset = function () {
	for (var i = 0; i < this.length; i++) {
		this.children[i].reset();
	}
};

ButtonPanel.prototype.highlight = function (duration) {
	var t = new TimelineMax();
	for (var i = 0; i < this.length; i++) {
		t.add(this.children[i].highlight(duration), 0);
	}
	return t;
};

ButtonPanel.prototype.disable = function (value) {
	for (var i = 0; i < this.length; i++) {
		this.children[i].disabled = value;
	}
};