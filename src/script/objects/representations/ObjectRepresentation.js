module.exports = ObjectRepresentation;

ObjectRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
ObjectRepresentation.prototype.constructor = ObjectRepresentation;

/**
 * Yes - No representation.
 * @param {Object} game - A reference to the Phaser game.
 * @param {String} key - Sprite key.
 * @param {String} frame - Sprite frame.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Size of the sprite object.
 * @return {Object} Itself.
 */
function ObjectRepresentation (game, key, frame, x, y, size) {
	Phaser.Sprite.call(this, game, x, y, key, frame);
	if (this.width > this.height) {
		this.scale.set(size / this.width);
	} else {
		this.scale.set(size / this.height);
	}
	this.x += (size - this.width) / 2;
	this.y += (size - this.height) / 2;

	return this;
}