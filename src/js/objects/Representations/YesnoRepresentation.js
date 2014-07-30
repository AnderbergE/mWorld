YesnoRepresentation.prototype = Object.create(Phaser.Text.prototype);
YesnoRepresentation.prototype.constructor = YesnoRepresentation;

/**
 * Yes - No representation.
 * @param {boolean} yes - True is yes, false is no.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Font size of the representation (default 50).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function YesnoRepresentation (yes, x, y, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x+size, y+size, (yes ? 'y' : 'n'), {
		font: size + 'pt ' + GLOBAL.FONT,
		fill: color,
		stroke: color,
		strokeThickness: 3
	}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}