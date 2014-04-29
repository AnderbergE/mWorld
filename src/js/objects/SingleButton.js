/* A button for a number with flexible representation. */
SingleButton.prototype = Object.create(Phaser.Group.prototype);
SingleButton.prototype.constructor = SingleButton;
/**
 * A button with a representation on it (publishes event on click).
 * @param {Number} The number for the button
 * @param {Number} The representation of the button (see GLOBAL.REPRESENTATION)
 * @param {Object} A list of options:
 *		x: the x position
 *		y: the y position
 *		size: the size of the button (width = height)
 *		background: the background for the button
 *		color: the color of the representation
 *		onClick: a function to run when a button is clicked
 * @returns {Object} Itself.
 */
function SingleButton (number, representation, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.number = number;
	this.x = options.x || 0;
	this.y = options.y || 0;
	var size = options.size || 100;
	var color = options.color || '#000000';

	var bg = game.add.sprite(0, 0, options.background, 0, this);
	bg.width = size;
	bg.height = size;
	bg.inputEnabled = true;
	bg.events.onInputDown.add(function () {
		game.add.audio('click');
		if (bg.frame % 2 === 0) {
			bg.frame++;
		}
		if (options.onClick) { options.onClick(this.number); }
		publish(GLOBAL.EVENT.numberPress, [this.number, representation]);
	}, this);

	this.reset = function () {
		bg.frame -= bg.frame % 2;
	};

	if (representation === GLOBAL.NUMBER_REPRESENTATION.dots) {
		var offset = size/6;
		this.add(new DiceRepresentation(this.number, offset, offset, size-offset*2, color));

	} else if (representation === GLOBAL.NUMBER_REPRESENTATION.numbers) {
		this.add(new NumberRepresentation(this.number, 0, 0, size/2, color));

	} else if (representation === GLOBAL.NUMBER_REPRESENTATION.yesno) {
		this.number = this.number % 2;
		this.add(new YesnoRepresentation(this.number, 0, 0, size/2, color));
	}

	return this;
}