var Character = require('./Character.js');

module.exports = Bird;

Bird.prototype = Object.create(Character.prototype);
Bird.prototype.constructor = Bird;
Bird.prototype.id = 'bird'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Bird.load = function() {
	this.game.load.atlasJSONHash(Bird.prototype.id, 'img/characters/bird/atlas.png', 'img/characters/bird/atlas.json');
};

/**
 * The bird that you are helping home.
 * @constructor
 * @param {number} tint - The tint of the bird.
 * @return {Object} Itself.
 */
function Bird (game, x, y, tint) {
	Character.call(this, game, x, y, true); // Parent constructor.

	this._number = null;

	this.rightLeg = this.game.add.sprite(50, 160, this.id, 'leg', this);
	this.rightWing = this.game.add.sprite(160, -90, this.id, 'wing5', this);
	this.rightWing.visible = false;
	this.body = this.game.add.sprite(0, 0, this.id, 'body', this);
	this.body.anchor.set(0.5);
	this.leftLeg = this.game.add.sprite(0, 175, this.id, 'leg', this);
	this.wing = this.game.add.sprite(75, -20, this.id, 'wing', this);
	this.wing.anchor.set(1, 0);
	this.leftWing = this.game.add.sprite(90, -125, this.id, 'wing5', this);
	this.leftWing.angle = 10;
	this.leftWing.scale.x = -1;
	this.leftWing.visible = false;
	this.game.add.sprite(110, -160, this.id, 'eyes', this);
	this.game.add.sprite(118, -145, this.id, 'pupils', this);
	this.beak = this.game.add.sprite(190, -70, this.id, 'beak0', this);
	this.beak.anchor.set(0.5);

	this.tint = tint || 0xffffff;

	/* Animations */
	this.talk = TweenMax.to(this.beak, 0.2, {
		frame: this.beak.frame + 1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.walk = new TimelineMax({ repeat: -1, paused: true })
		.fromTo(this.leftLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0)
		.fromTo(this.rightLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0.2);

	this._happy = new TimelineMax({ repeat: -1, paused: true });
	this._happy.to(this, 0.3, { y:'-=15', ease: Power0.easeInOut, repeat: 1, yoyo: true }, 0);
	this._happy.to(this.rightLeg, 0.3, { angle: -40, ease: Power0.easeInOut, repeat: 1, yoyo: true }, 0);
	this._happy.to(this.leftLeg, 0.3, { angle: 40, ease: Power0.easeInOut, repeat: 1, yoyo: true }, 0);

	return this;
}

Object.defineProperty(Bird.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.wing.tint = value - 0x111111;
		this.rightWing.tint = this.wing.tint;
		this.leftWing.tint = this.wing.tint;
	}
});

Object.defineProperty(Bird.prototype, 'number', {
	get: function() { return this._number; },
	set: function(value) {
		this._number = value;
		this.rightWing.frameName = 'wing' + (value > 5 ? 5 : value);
		if (value > 5) { this.leftWing.frameName = 'wing' + (value - 5); }
	}
});

Bird.prototype.setNeutral = function () {
	this.beak.frameName = 'beak0';
	this._happy.pause(0);
};

Bird.prototype.setHappy = function () {
	this.beak.frameName = 'beak1';
	this._happy.play();
};

Bird.prototype.setSurprised = Bird.prototype.setNeutral;
Bird.prototype.setSad = Bird.prototype.setNeutral;


/**
 * The bird will show its wings.
 * @param {boolean} true = show, false = hide  (default is true)
 */
Bird.prototype.showWings = function (on) {
	on = (typeof on === 'undefined' || on === null) ? true : on;
	this.rightWing.visible = on;
	this.wing.visible = !on || this.number <= 5;
	this.leftWing.visible = on && this._number > 5;
};

/**
 * Point at the birds feathers.
 * @return {Object} The animation timeline
 */
Bird.prototype.countFeathers = function () {
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
