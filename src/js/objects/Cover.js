/* The graphical representation of the watering can. */
Cover.prototype = Object.create(Phaser.Sprite.prototype);
Cover.prototype.constructor = Cover;

function Cover (color, alpha) {
	var bmd = game.add.bitmapData(game.world.width, game.world.height);
	bmd.ctx.fillStyle = color || '#000000';
	bmd.ctx.fillRect(0, 0, game.world.width, game.world.height);

	Phaser.Sprite.call(this, game, 0, 0, bmd); // Parent constructor.
	this.alpha = (typeof alpha !== 'undefined') ? alpha : 1;

	return this;
}