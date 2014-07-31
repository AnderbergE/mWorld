SignedNumberRepresentation.prototype = Object.create(Phaser.Text.prototype);
SignedNumberRepresentation.prototype.constructor = SignedNumberRepresentation;

/**
 * Signed number symbol representation of a number.
 * @param {number} number - The number to represent.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Font size of the representation (default 50).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
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