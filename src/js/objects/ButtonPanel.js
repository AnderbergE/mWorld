/* A panel filled with buttons. */
ButtonPanel.prototype = Object.create(Phaser.Group.prototype);
ButtonPanel.prototype.constructor = ButtonPanel;
/**
 *
 */
function ButtonPanel (amount, representations, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = options.x || 0;
	this.y = options.y || 0;
	var buttonOptions = {
		background: options.background,
		color: options.color
	};

	options.method = options.method || GLOBAL.METHOD.count;
	options.vertical = options.vertical || false;
	options.size = options.size || (options.vertical ? game.world.height : game.world.width);
	options.maxButtonSize = options.maxButtonSize || 75;
	if (options.method === GLOBAL.METHOD.basicMath) {
		buttonOptions.min = 1;
		buttonOptions.max = amount;
		amount = 4;
	}

	var buttonSize = options.size/amount;
	if (buttonSize > options.maxButtonSize) { buttonSize = options.maxButtonSize; }
	var widthLeft = options.size - buttonSize*amount;
	var paddingSize = widthLeft/amount;
	if (paddingSize > buttonSize/2) { paddingSize = buttonSize/2; }
	var margin = (options.size - amount*buttonSize - (amount-1)*paddingSize)/2;
	var fullSize = paddingSize+buttonSize;

	buttonOptions.size = buttonSize;
	var i;

	// Set up the buttons that should be in the panel.
	if (options.method === GLOBAL.METHOD.basicMath) {
		buttonOptions.onClick = options.onClick;
		var change = new NumberButton(1, representations, buttonOptions);
		buttonOptions.onClick = function () { change.number--; };
		this.add(new TextButton('-', buttonOptions));
		this.add(change);
		buttonOptions.onClick = function () { change.number++; };
		this.add(new TextButton('+', buttonOptions));
		buttonOptions.onClick = function () { change.bg.events.onInputDown.dispatch(); };
		this.add(new TextButton('v', buttonOptions));
	} else {
		buttonOptions.onClick = options.onClick;
		buttonOptions.vertical = !options.vertical;
		for (i = 1; i <= amount; i++) {
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
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].reset();
	}
};

ButtonPanel.prototype.highlight = function (duration) {
	var t = new TimelineMax();
	for (var i = 0; i < this.children.length; i++) {
		t.add(this.children[i].highlight(duration), 0);
	}
	return t;
};

ButtonPanel.prototype.disable = function (value) {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].disabled = value;
	}
};