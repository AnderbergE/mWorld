var Character = require('./Character.js');
var GLOBAL = require('../global.js');

module.exports = Lizard;

/* Camilla Chameleon, the lizard that you are helping. */
Lizard.prototype = Object.create(Character.prototype);
Lizard.prototype.constructor = Lizard;
Lizard.prototype.id = 'lizard'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Lizard.load = function() {
	this.game.load.atlasJSONHash(Lizard.prototype.id, 'img/characters/lizard/atlas.png', 'img/characters/lizard/atlas.json');
};

function Lizard (game, x, y) {
	Character.call(this, game, x, y, true); // Parent constructor.

	this.body = game.add.sprite(48, 0, this.id, 'body', this);
	this.head = game.add.group(this);
	this.head.x = 130;
	this.head.y = 60;

	this.tounge = game.add.sprite(-5, 17, this.id, 'tounge', this.head);
	this.tounge.anchor.set(1, 0.5);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.jaw = game.add.sprite(20, 23, this.id, 'jaw', this.head);
	this.jaw.anchor.set(1, 0.4);
	this.forehead = game.add.sprite(125, 35, this.id, 'head', this.head);
	this.forehead.anchor.set(1, 1);
	this.tint = 0x00aa00;

	this.origin = {
		x: this.x + this.head.x + this.tounge.x,
		y: this.y + this.head.y + this.tounge.y
	};
	this.stuck = false;

	this.talk = new TimelineMax({ repeat: -1, yoyo: true, paused: true });
	this.talk.to(this.jaw, 0.2, { angle: -6 });
	this.talk.to(this.forehead, 0.2, { angle: 2 }, 0);

	this.snore = game.add.text(this.head.x, this.head.y - 100, 'zzz', {
		font: '40pt ' +  GLOBAL.FONT,
		fill: '#ffffff'
	}, this);
	this.snore.alpha = 0; // Maybe this should be visible = false, but whatever.
}

Object.defineProperty(Lizard.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.forehead.tint = value;
		this.jaw.tint = value;
	}
});

Lizard.prototype.setNeutral = function () {
	this.jaw.angle = -9;
};

Lizard.prototype.setHappy = function () {
	this.jaw.angle = -18;
};

Lizard.prototype.setSad = function () {
	this.jaw.angle = -3;
};

Lizard.prototype.setSurprised = Lizard.prototype.setNeutral;

Lizard.prototype.sleeping = function (duration) {
	duration = duration || 3;

	var t = new TimelineMax({ repeat: TweenMax.prototype.calcYoyo(duration, 1.5) });
	t.add(TweenMax.fromTo(this.snore, 0.8, { alpha: 0 }, { x: '+=25', y: '-=25', alpha: 1 }));
	t.add(TweenMax.to(this.snore, 0.7, { x: '+=25', y: '-=25', alpha: 0, ease: Power1.easeIn }));
	return t;
};

Lizard.prototype.followPointer = function (on) {
	if (on && !this.stuck) {
		var angleOrigin = { x: this.x + this.head.x, y: this.y + this.head.y };
		var angleTo = { x: 100 };
		this.update = function () {
			angleTo.y = this.game.input.activePointer.y;
			var a = this.game.physics.arcade.angleBetween(angleTo, angleOrigin);
			this.head.rotation = a;
		};
	} else {
		this.update = function () {};
	}
};

Lizard.prototype.startShoot = function (hit) {
	var t = new TimelineMax();
	if (this.stuck) {
		t.add(this.shootReturn());
	}
	t.to(this.head, 0.2, { rotation: this.game.physics.arcade.angleBetween(hit, this.origin) });
	t.to(this.forehead, 0.5, { angle: 7 });
	t.to(this.jaw, 0.5, { angle: -4 }, '-=0.5');
	return t;
};

Lizard.prototype.shoot = function (hit, stuck) {
	var t = this.startShoot(hit);
	t.to(this.tounge, 0.75, {
		width: this.game.physics.arcade.distanceBetween(hit, this.tounge.world),
		height: 18
	});
	t.addLabel('stretched');
	t.addCallback(function () { this.stuck = true; }, null, null, this);
	if (!stuck) {
		t.add(this.shootReturn());
	}
	return t;
};

Lizard.prototype.shootReturn = function () {
	var t = new TimelineMax();
	t.to(this.tounge, 0.5, { width: 1, height: 5 });
	t.to(this.forehead, 0.2, { angle: 0 });
	t.to(this.jaw, 0.2, { angle: 0 }, '-=0.2');
	t.addCallback(function () { this.stuck = false; }, null, null, this);
	return t;
};

Lizard.prototype.shootMiss = function (aim, hit) {
	var t = this.startShoot(aim);
	t.to(this.tounge, 1, {
		width: this.game.physics.arcade.distanceBetween(aim, this.tounge.world)*1.4,
		height: 18
	});

	t.to(this.head, 1.4, { rotation: this.game.physics.arcade.angleBetween(hit, this.origin) }, '-=0.4');
	t.to(this.tounge, 1, { width: this.game.physics.arcade.distanceBetween(hit, this.tounge.world), }, '-=1');

	t.addCallback(function () { this.stuck = true; }, null, null, this);
	return t;
};

Lizard.prototype.shootObject = function (obj) {
	var pos = obj.world || obj;
	var t = this.shoot(pos);
	t.add(new TweenMax(obj, 0.5, {
		x: obj.x + (this.tounge.world.x - pos.x),
		y: obj.y + (this.tounge.world.y - pos.y) }), 'stretched');
	return t;
};
