/* A button for a number with flexible representation. */
NumberButton.prototype = Object.create(Phaser.Group.prototype);
NumberButton.prototype.constructor = NumberButton;
/**
 * A button with a representation on it (publishes event on click).
 * @param {Number} The number for the button
 * @param {Number} The representations of the button (see GLOBAL.REPRESENTATION)
 * @param {Object} A list of options:
 *		x: the x position (default 0)
 *		y: the y position (default 0)
 *		size: the small side of the button (the other depend on representation amount) (default 75)
 *		vertical: stretch button vertically, otherwise horisontally (default true)
 *		background: the background for the button
 *		color: the color of the representation (default '#000000')
 *		onClick: a function to run when a button is clicked
 * @returns {Object} Itself.
 */
function NumberButton (number, representations, options) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.number = number;
	this.representations = Array.isArray(representations) ? representations : [representations];
	this.x = options.x || 0;
	this.y = options.y || 0;
	var vertical = options.vertical || true;
	var size = options.size || 75;
	var color = options.color || '#000000';
	this.disabled = options.disabled || false;

	var bg = game.add.sprite(0, 0, options.background, 0, this);
	bg.width = size;
	bg.height = size;
	if (vertical) { bg.height *= this.representations.length; }
	else { bg.width *= this.representations.length; }

	bg.inputEnabled = true;
	bg.events.onInputDown.add(function () {
		if (this.disabled) { return; }

		game.add.audio('click');
		if (bg.frame % 2 === 0) {
			bg.frame++;
		}
		if (options.onClick) { options.onClick(this.number); }
		Event.publish(GLOBAL.EVENT.numberPress, [this.number, this.representations]);
	}, this);

	this.reset = function () {
		bg.frame -= bg.frame % 2;
	};

	var x = 0;
	var y = 0;
	for (var i = 0; i < this.representations.length; i++) {
		if (vertical) { y = size * i; }
		else { x = size * i; }

		if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.dots) {
			var offset = size/6;
			this.add(new DiceRepresentation(this.number, x+offset, y+offset, size-offset*2, color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.numbers) {
			this.add(new NumberRepresentation(this.number, x, y, size/2, color));

		} else if (this.representations[i] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			this.number = this.number % 2;
			this.add(new YesnoRepresentation(this.number, x, y, size/2, color));
		}
	}

	return this;
}