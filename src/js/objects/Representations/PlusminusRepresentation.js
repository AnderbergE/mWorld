/* The yes no representation. */
PlusminusRepresentation.prototype = Object.create(Phaser.Text.prototype);
PlusminusRepresentation.prototype.constructor = PlusminusRepresentation;
function PlusminusRepresentation (yes, x, y, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x+size, y+size, (yes ? '+' : '-'), {
		font: size + 'pt ' + GLOBAL.FONT,
		fill: color,
		stroke: color,
		strokeThickness: 3
	}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}