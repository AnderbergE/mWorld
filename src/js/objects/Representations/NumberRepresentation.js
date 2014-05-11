/* The number symbol representation of a number. */
NumberRepresentation.prototype = Object.create(Phaser.Text.prototype);
NumberRepresentation.prototype.constructor = NumberRepresentation;
function NumberRepresentation (number, x, y, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x+size, y+size, number.toString(), {
		font: size + 'pt ' + GLOBAL.FONT,
		fill: color,
		stroke: color,
		strokeThickness: 3
	}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}