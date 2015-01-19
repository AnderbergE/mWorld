var GeneralButton = require('./GeneralButton.js');

module.exports = SpriteButton;

SpriteButton.prototype = Object.create(GeneralButton.prototype);
SpriteButton.prototype.constructor = SpriteButton;

/**
 * A button with a sprite on it.
 * @param {Object} game - A reference to the Phaser game.
 * @param {string} key - The sprite key.
 * @param {string} frame - The frame of the sprite (optional).
 * @param {Object} options - A list of options (see GeneralButton).
 * @return {Object} Itself.
 */
function SpriteButton (game, key, frame, options) {
	GeneralButton.call(this, game, options); // Parent constructor.

	var half = this.size/2;

	this.sprite = this.create(half, half, key, frame);
	this.sprite.anchor.set(0.5);
	this._scaleSprite();

	return this;
}

/**
 * Scale the sprite according to the button size.
 * @private
 */
SpriteButton.prototype._scaleSprite = function () {
	var padded = this.size*0.9;

	this.sprite.scale.set(padded/(this.sprite.width > this.sprite.height ?
		this.sprite.width : this.sprite.height));
};

/**
 * Set the size of this button.
 * @param {Number} The new size.
 */
SpriteButton.prototype.setSize = function (size) {
	GeneralButton.prototype.setSize.call(this, size);

	if (this.sprite) {
		this._scaleSprite();
	}
};