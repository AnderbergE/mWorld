Cover.prototype = Object.create(Phaser.Sprite.prototype);
Cover.prototype.constructor = Cover;

/**
 * A cover over the entire game. Traps all input events.
 * @param {number} color - The color of the cover (default '#000000');
 * @param {number} alpha - The alpha of the cover (default 1);
 * @return {Object} Itself.
 */
function Cover (color, alpha) {
	var bmd = game.add.bitmapData(game.world.width, game.world.height);
	bmd.ctx.fillStyle = color || '#000000';
	bmd.ctx.fillRect(0, 0, game.world.width, game.world.height);

	Phaser.Sprite.call(this, game, 0, 0, bmd); // Parent constructor.
	this.alpha = (typeof alpha !== 'undefined') ? alpha : 1;
	this.inputEnabled = true;

	return this;
}