module.exports = Cover;

Cover.prototype = Object.create(Phaser.Sprite.prototype);
Cover.prototype.constructor = Cover;

/**
 * A cover over the entire game. Traps all input events.
 * The returned sprite will have the width and height of the world, so do not change scale unless you know how much.
 *
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} color - The color of the cover (default '#000000');
 * @param {number} alpha - The alpha of the cover (default 1);
 * @return {Object} Itself.
 */
function Cover (game, color, alpha) {
	var bmd = game.add.bitmapData(1, 1);
	bmd.ctx.fillStyle = color || '#000000';
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);

	Phaser.Sprite.call(this, game, 0, 0, bmd); // Parent constructor.
	this.width = game.world.width;
	this.height = game.world.height;
	this.alpha = (typeof alpha !== 'undefined') ? alpha : 1;
	this.inputEnabled = true;

	return this;
}
