WaterCan.prototype = Object.create(Phaser.Group.prototype);
WaterCan.prototype.constructor = WaterCan;

/**
 * The graphical representation of the watering can.
 * @param {number} x - X position (default is game.width - 150).
 * @param {number} y - Y position (default is 5).
 * @param {number} amount - amount of water in the can (default player amount).
 * @return {Object} Itself.
 */
function WaterCan (x, y, amount) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x || game.width - 125;
	this.y = y || 5;
	this.amount = amount || player.water;
	var origin = 87;
	var waterStep = 54 / player.maxWater;

	/* Add water level */
	var bmd = game.add.bitmapData(62, 1);
	bmd.ctx.fillStyle = '#0000ff';
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	var water = this.create(20, origin, bmd);
	water.height = waterStep*this.amount;
	water.y -= water.height;

	/* Add can */
	this.can = this.create(0, 0, 'objects', 'watering_can');
	this.can.tint = 0xbb3333;

	/* Keep track of when the player's water changes */
	this._sub = EventSystem.subscribe(GLOBAL.EVENT.waterAdded, function (total) {
		var h = waterStep*total;
		TweenMax.to(water, 0.5, { height: h, y: origin - h });
	});

	return this;
}

/** Removes subscriptions in addition to Phaser.Group.destroy */
WaterCan.prototype.destroy = function (destroyChildren, soft) {
	EventSystem.unsubscribe(this._sub); // Otherwise possible memory leak.
	Phaser.Group.prototype.destroy.call(this, destroyChildren, soft);
};

/**
 * Pour water from the can.
 * @param {number} duration - Duration to pour.
 * @return {Object} The animation TweenMax.
 */
WaterCan.prototype.pour = function (duration) {
	var bmd = new Phaser.BitmapData(game, '', 6, 6);
	var half = bmd.width/2;
	bmd.ctx.fillStyle = '#2266cc';
	bmd.ctx.beginPath();
	bmd.ctx.arc(half, half, half, 0, Math.PI2);
	bmd.ctx.closePath();
	bmd.ctx.fill();
	var emitter = game.add.emitter(this.can.width, 5, 200);
	emitter.width = 5;
	emitter.makeParticles(bmd);
	emitter.setScale(0.5, 1, 0.5, 1);
	emitter.setYSpeed(100, 150);
	emitter.setXSpeed(50, 100);
	emitter.setRotation(0, 0);

	this.can.addChild(emitter);

	return new TweenMax(emitter, duration, {
		onStart: function () { emitter.start(false, 500, 10, (duration-0.5)*50); },
		onComplete: function () { emitter.destroy(); }
	});
};