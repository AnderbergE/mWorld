var Character = require('../../agent/Character.js');

module.exports = BeeFlightBee;

/* Humfrid, the bee you are helping. */
BeeFlightBee.prototype = Object.create(Character.prototype);
BeeFlightBee.prototype.constructor = BeeFlightBee;
function BeeFlightBee (game, x, y) {
	Character.call(this, game); // Parent constructor.
	this.turn = true;
	this.x = x || 0;
	this.y = y || 0;

	this.body = this.create(0, 0, 'bee', 'body');
	this.body.anchor.set(0.5);
	this.mouth = this.create(50, 35, 'bee', 'mouth_happy');
	this.mouth.anchor.set(0.5);
	this.wings = this.create(-25, -43, 'bee', 'wings1');
	this.wings.anchor.set(0.5);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	this._flap = TweenMax.to(this.wings, 0.1, {
		frame: this.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.wings.frameName = 'wings0';
}

BeeFlightBee.prototype.flap = function (on) {
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

BeeFlightBee.prototype.oscillate = function (on) {
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