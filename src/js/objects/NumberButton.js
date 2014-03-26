/*
 * Inherits Phaser.Group
 * A NumberButton is used in the minigames to interact with.
 */
function NumberButton (number, representation, x, y, size, background, color, noEvent) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	x = x || 0;
	y = y || 0;
	size = size || 100;

	var bg = game.add.sprite(x, y, background, null, this);
	bg.width = size;
	bg.height = size;
	if (!noEvent) {
		bg.inputEnabled = true;
		bg.events.onInputDown.add(function () {
			publish(GLOBAL.EVENT.numberPress, [number]);
		}, this);
	}

	if (representation === GLOBAL.NUMBER_REPRESENTATION.dots) {
		var offset = size/6;
		game.add.sprite(x+offset, y+offset, new Dice(number, size-offset*2, color), null, this);
	} else if (representation === GLOBAL.NUMBER_REPRESENTATION.numbers) {
		var half = size/2;
		var text = new Phaser.Text(game, x+half, y+half, number.toString(), {
			font: half + 'pt The Girl Next Door',
			fill: color,
			stroke: color,
			strokeThickness: 3
		});
		text.anchor.setTo(0.5);
		this.add(text);
	}

	return this;
}

// inheritance
NumberButton.prototype = Object.create(Phaser.Group.prototype);
NumberButton.prototype.constructor = NumberButton;
