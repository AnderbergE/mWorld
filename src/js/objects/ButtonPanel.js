/*
 * Inherits Phaser.Group
 * A ButtonPanel is used in the minigames to interact with.
 */
function ButtonPanel (representation, amount, x, y, length, maxSize, background, vertical, noEvent) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	x = x || 0;
	y = y || 0;
	vertical = vertical || false;
	length = length || vertical ? game.world.height : game.world.width;
	maxSize = maxSize || 75;

	// Add buttons
	var buttonSize = length/amount;
	if (buttonSize > maxSize) { buttonSize = maxSize; }
	var widthLeft = length - buttonSize*amount;
	var paddingSize = widthLeft/amount;
	if (paddingSize > buttonSize/2) { paddingSize = buttonSize/2; }
	var margin = (game.world.width - amount*buttonSize - (amount-1)*paddingSize)/2;

	var i = 1;
	if (vertical) {
		for (; i <= amount; i++) {
			this.add(new NumberButton(i, representation,
				x,
				y + margin + (paddingSize+buttonSize)*(i-1),
				buttonSize, background, noEvent));
		}
	} else {
		for (; i <= amount; i++) {
			this.add(new NumberButton(i, representation,
				x + margin + (paddingSize+buttonSize)*(i-1),
				y, //-buttonSize*1.3
				buttonSize, background, noEvent));
		}
	}

	return this;
}

// inheritance
ButtonPanel.prototype = Object.create(Phaser.Group.prototype);
ButtonPanel.prototype.constructor = ButtonPanel;
