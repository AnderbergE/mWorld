var Character = require('./Character.js');
var LANG = require('../language.js');

module.exports = Bee;

/* Humfrid, the bee you are helping. */
Bee.prototype = Object.create(Character.prototype);
Bee.prototype.constructor = Bee;

function Bee (game, x, y) {
	Character.call(this, game, x, y, true); // Parent constructor.
	this.name = LANG.TEXT.bumblebeeName;

	this.body = this.create(0, 0, 'bee', 'body');
	this.body.anchor.set(0.5);
	this.mouth = this.create(50, 35, 'bee', 'mouth_happy');
	this.mouth.anchor.set(0.5);
	this.wings = this.create(-25, -43, 'bee', 'wings1');
	this.wings.anchor.set(0.5);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame + 1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	this._flap = TweenMax.to(this.wings, 0.1, {
		frame: this.wings.frame + 1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.wings.frameName = 'wings0';
}

Bee.prototype.setNeutral = function () {
	this.mouth.frameName = 'mouth_happy';
};

Bee.prototype.setHappy = function () {
	this.mouth.frameName = 'mouth_happy';
	this.flap(true);
};

Bee.prototype.setSad = function () {
	this.mouth.frameName = 'mouth_sad';
	this.flap(false);
};

Bee.prototype.setSurprised = function () {
	this.mouth.frameName = 'mouth_open';
};

Bee.prototype.flap = function (on) {
	if (on) {
		if (this._flap.paused()) {
			this.wings.frameName = 'wings1';
			this._flap.restart(0);
			this.oscillate(true);
		}
	} else {
		this._flap.pause(0);
		this.wings.frameName = 'wings0';
		this.oscillate(false);
	}
};

Bee.prototype.oscillate = function (on) {
	if (on) {
		// Set update function, not tween (since it might already be tweening)
		var time = 0;
		var xRand = (Math.random() + 0.7) * 10;
		var yRand = (Math.random() + 0.7) * 10;
		console.log(xRand, yRand);
		this.update = function () {
			this.x += Math.sin(time) / xRand;
			this.y += Math.sin(time) / yRand;
			time += 0.05;
		};
	} else {
		// Set update function to nothing.
		this.update = function () {};
	}
};
