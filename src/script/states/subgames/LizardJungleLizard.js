var Character = require('../../agent/Character.js');
var GLOBAL = require('../../global.js');

module.exports = LizardJungleLizard;

/* Camilla Chameleon, the lizard that you are helping. */
LizardJungleLizard.prototype = Object.create(Character.prototype);
LizardJungleLizard.prototype.constructor = LizardJungleLizard;
function LizardJungleLizard (game, x, y) {
	Character.call(this, game); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;

	this.body = game.add.sprite(48, 0, 'lizard', 'body', this);
	this.head = game.add.group(this);
	this.head.x = 130;
	this.head.y = 60;

	this.tounge = game.add.sprite(-5, 17, 'lizard', 'tounge', this.head);
	this.tounge.anchor.set(1, 0.5);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.jaw = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
	this.jaw.anchor.set(1, 0.4);
	this.forehead = game.add.sprite(125, 35, 'lizard', 'head', this.head);
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
Object.defineProperty(LizardJungleLizard.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.forehead.tint = value;
		this.jaw.tint = value;
	}
});

LizardJungleLizard.prototype.sleeping = function (duration) {
	duration = duration || 3;

	var t = new TimelineMax({ repeat: TweenMax.prototype.calcYoyo(duration, 1.5) });
	t.add(TweenMax.fromTo(this.snore, 0.8, { alpha: 0 }, { x: '+=25', y: '-=25', alpha: 1 }));
	t.add(TweenMax.to(this.snore, 0.7, { x: '+=25', y: '-=25', alpha: 0, ease: Power1.easeIn }));
	return t;
};

LizardJungleLizard.prototype.followPointer = function (on) {
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

LizardJungleLizard.prototype.startShoot = function (hit) {
	var t = new TimelineMax();
	if (this.stuck) {
		t.add(this.shootReturn());
	}
	t.to(this.head, 0.2, { rotation: this.game.physics.arcade.angleBetween(hit, this.origin) });
	t.to(this.forehead, 0.5, { angle: 7 });
	t.to(this.jaw, 0.5, { angle: -4 }, '-=0.5');
	return t;
};

LizardJungleLizard.prototype.shoot = function (hit, stuck) {
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

LizardJungleLizard.prototype.shootReturn = function () {
	var t = new TimelineMax();
	t.to(this.tounge, 0.5, { width: 1, height: 5 });
	t.to(this.forehead, 0.2, { angle: 0 });
	t.to(this.jaw, 0.2, { angle: 0 }, '-=0.2');
	t.addCallback(function () { this.stuck = false; }, null, null, this);
	return t;
};

LizardJungleLizard.prototype.shootMiss = function (aim, hit) {
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

LizardJungleLizard.prototype.shootObject = function (obj) {
	var pos = obj.world || obj;
	var t = this.shoot(pos);
	t.add(new TweenMax(obj, 0.5, {
		x: obj.x + (this.tounge.world.x - pos.x),
		y: obj.y + (this.tounge.world.y - pos.y) }), 'stretched');
	return t;
};