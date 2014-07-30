SpriteButton.prototype = Object.create(GeneralButton.prototype);
SpriteButton.prototype.constructor = SpriteButton;

/**
 * A button with a sprite on it.
 * @param {string} key - The sprite key.
 * @param {string} frame - The frame of the sprite (optional).
 * @param {Object} options - A list of options (in addition to GeneralButton):
 * @return {Object} Itself.
 */
function SpriteButton (key, frame, options) {
	GeneralButton.call(this, options); // Parent constructor.

	var half = this.size/2;
	var padded = this.size*0.9;

	this.sprite = this.create(half, half, key, frame);
	this.sprite.anchor.set(0.5);
	this.sprite.scale.set(padded/(this.sprite.width > this.sprite.height ?
		this.sprite.width : this.sprite.height));

	return this;
}