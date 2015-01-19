var GLOBAL = require('../../global.js');

module.exports = NumberRepresentation;

NumberRepresentation.prototype = Object.create(Phaser.Text.prototype);
NumberRepresentation.prototype.constructor = NumberRepresentation;

/**
 * Number symbol representation of a number.
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} number - The number to represent.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Font size of the representation (default 50).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function NumberRepresentation (game, number, x, y, size, color) {
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