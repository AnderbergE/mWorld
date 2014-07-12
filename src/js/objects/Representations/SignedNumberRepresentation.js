/* The number symbol representation of a number. */
SignedNumberRepresentation.prototype = Object.create(Phaser.Text.prototype);
SignedNumberRepresentation.prototype.constructor = SignedNumberRepresentation;
function SignedNumberRepresentation (number, x, y, size, color) {
	size = size || 40;
	color = color || '#000000';

	Phaser.Text.call(this, game, x+size, y+size, (number > 0 ? '+' : '') + number.toString(), {
		font: size + 'pt ' + GLOBAL.FONT,
		fill: color,
		stroke: color,
		strokeThickness: 3
	}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}