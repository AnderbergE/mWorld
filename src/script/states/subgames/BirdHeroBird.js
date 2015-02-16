var Character = require('../../agent/Character.js');

module.exports = BirdheroBird;

BirdheroBird.prototype = Object.create(Character.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;

/**
 * The bird that you are helping home.
 * @constructor
 * @param {number} tint - The tint of the bird.
 * @return {Object} Itself.
 */
function BirdheroBird (game, tint) {
	Character.call(this, game); // Parent constructor.
	this.turn = true;

	this._number = null;

	this.rightLeg = this.game.add.sprite(50, 160, 'birdhero', 'leg', this);
	this.rightWing = this.game.add.sprite(160, -90, 'birdhero', 'wing5', this);
	this.rightWing.visible = false;
	this.body = this.game.add.sprite(0, 0, 'birdhero', 'body', this);
	this.body.anchor.set(0.5);
	this.leftLeg = this.game.add.sprite(0, 175, 'birdhero', 'leg', this);
	this.wing = this.game.add.sprite(75, -20, 'birdhero', 'wing', this);
	this.wing.anchor.set(1, 0);
	this.leftWing = this.game.add.sprite(90, -125, 'birdhero', 'wing5', this);
	this.leftWing.angle = 10;
	this.leftWing.scale.x = -1;
	this.leftWing.visible = false;
	this.game.add.sprite(110, -160, 'birdhero', 'eyes', this);
	this.game.add.sprite(118, -145, 'birdhero', 'pupils', this);
	this.beak = this.game.add.sprite(190, -70, 'birdhero', 'beak0', this);
	this.beak.anchor.set(0.5);

	this.tint = tint || 0xffffff;

	/* Animations */
	this.talk = TweenMax.to(this.beak, 0.2, {
		frame: this.beak.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.walk = new TimelineMax({ repeat: -1, paused: true })
		.fromTo(this.leftLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0)
		.fromTo(this.rightLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0.2);

	return this;
}

Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.wing.tint = value - 0x111111;
		this.rightWing.tint = this.wing.tint;
		this.leftWing.tint = this.wing.tint;
	}
});

Object.defineProperty(BirdheroBird.prototype, 'number', {
	get: function() { return this._number; },
	set: function(value) {
		this._number = value;
		this.rightWing.frameName = 'wing' + (value > 5 ? 5 : value);
		if (value > 5) { this.leftWing.frameName = 'wing' + (value - 5); }
	}
});

/**
 * The bird will show its wings.
 * @param {boolean} true = show, false = hide  (default is true)
 */
BirdheroBird.prototype.showWings = function (on) {
	on = (typeof on === 'undefined' || on === null) ? true : on;
	this.rightWing.visible = on;
	this.wing.visible = !on || this.number <= 5;
	this.leftWing.visible = on && this._number > 5;
};

/**
 * Point at the birds feathers.
 * @return {Object} The animation timeline
 */
BirdheroBird.prototype.countFeathers = function () {
	var number = this.number;
	var fun = function (i) {
		this.number = i;
		this.showWings();
	};

	var t = new TimelineMax();
	for (var i = 1; i <= number; i++) {
		t.addCallback(fun, i-1, [i], this);
	}
	t.addCallback(function () {}, '+=1');
	return t;
};
