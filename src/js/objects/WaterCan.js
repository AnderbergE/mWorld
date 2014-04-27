/* The graphical representation of the watering can. */
WaterCan.prototype = Object.create(Phaser.Group.prototype);
WaterCan.prototype.constructor = WaterCan;

function WaterCan (x, y, amount) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;
	this.amount = amount || user.water;
	var origin = 52;
	var waterStep = 5;

	var bmd = game.add.bitmapData(55, 1);
	bmd.ctx.fillStyle = '#0000ff';
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	var water = game.add.sprite(20, origin, bmd, null, this);
	water.height = waterStep*this.amount;
	water.y -= water.height;

	game.add.sprite(0, 0, 'watercan', 0, this);

	/* Keep track of when the user's water changes */
	this._sub = subscribe(GLOBAL.EVENT.waterAdded, function (total) {
		var h = waterStep*total;
		TweenMax.to(water, 0.5, { height: h, y: origin - h });
	});

	return this;
}

WaterCan.prototype.destroy = function (destroyChildren, soft) {
	unsubscribe(this._sub); // Otherwise possible memory leak.
	Phaser.Group.prototype.destroy.call(this, destroyChildren, soft);
};