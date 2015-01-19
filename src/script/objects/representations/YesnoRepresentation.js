module.exports = YesnoRepresentation;

YesnoRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
YesnoRepresentation.prototype.constructor = YesnoRepresentation;

/**
 * Yes - No representation.
 * @param {Object} game - A reference to the Phaser game.
 * @param {boolean} yes - True is yes, false is no.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Font size of the representation (default 50).
 * @return {Object} Itself.
 */
function YesnoRepresentation (game, yes, x, y, size) {
	size = size || 50;
	var typ = yes ? 'yes' : 'no';

	Phaser.Sprite.call(this, game, x, y, 'objects', typ + 1);
	this.width = size;
	this.height = size;

	this.animations.add('cycle', [typ + 1, typ + 2, typ + 1, typ + 3, typ + 1], 5, true).play();

	return this;
}