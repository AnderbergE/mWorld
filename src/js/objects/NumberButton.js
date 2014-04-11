NumberButton.prototype = Object.create(Phaser.Group.prototype);
NumberButton.prototype.constructor = NumberButton;

/*
 * Inherits Phaser.Group
 * A NumberButton is used in the minigames to interact with.
 */
function NumberButton (number, representation, x, y, size, background, color, noEvent) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.number = number;
	x = x || 0;
	y = y || 0;
	size = size || 100;

	var bg = game.add.sprite(x, y, background, 0, this);
	bg.width = size;
	bg.height = size;
	if (!noEvent) {
		bg.inputEnabled = true;
		bg.events.onInputDown.add(function () {
			if (bg.frame % 2 === 0) {
				bg.frame++;
			}
			publish(GLOBAL.EVENT.numberPress, [number, representation]);
		}, this);
	}
	this.reset = function () {
		if (bg.frame % 2 !== 0) {
			bg.frame--;
		}
	};

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
	} else if (representation === GLOBAL.NUMBER_REPRESENTATION.yesno) {
		var h = size/2;
		var t = new Phaser.Text(game, x+h, y+h, (number ? 'y' : 'n'), {
			font: h + 'pt The Girl Next Door',
			fill: color,
			stroke: color,
			strokeThickness: 3
		});
		t.anchor.setTo(0.5);
		this.add(t);
	}

	return this;
}
