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
	options.vertical = options.vertical || false;
	options.size = options.size || (options.vertical ? game.world.height : game.world.width);
	options.maxButtonSize = options.maxButtonSize || 75;
	options.reversed = options.reversed || false;

	var buttonSize = options.size/amount;
	if (buttonSize > options.maxButtonSize) { buttonSize = options.maxButtonSize; }
	var widthLeft = options.size - buttonSize*amount;
	var paddingSize = widthLeft/amount;
	if (paddingSize > buttonSize/2) { paddingSize = buttonSize/2; }
	var margin = (options.size - amount*buttonSize - (amount-1)*paddingSize)/2;

	var buttonOptions = {
		x: 0,
		y: 0,
		size: buttonSize,
		vertical: !options.vertical,
		background: options.background,
		color: options.color,
		onClick: options.onClick
	};

	for (var i = 1; i <= amount; i++) {
		if (options.vertical) { buttonOptions.y = margin + (paddingSize+buttonSize)*(i-1); }
		else { buttonOptions.x = margin + (paddingSize+buttonSize)*(i-1); }

		this.add(new NumberButton((options.reversed ? amount-i+1 : i), representations, buttonOptions));
	}

	return this;
}

ButtonPanel.prototype.reset = function () {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].reset();
	}
};

ButtonPanel.prototype.disable = function (value) {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].disabled = value;
	}
};