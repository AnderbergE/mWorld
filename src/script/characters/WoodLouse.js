var Character = require('./Character.js');
var LANG = require('../language.js');

module.exports = WoodLouse;

/* Grålle, the wood louse you are helping. */
WoodLouse.prototype = Object.create(Character.prototype);
WoodLouse.prototype.constructor = WoodLouse;

function WoodLouse (game, x, y) {
	Character.call(this, game, x, y); // Parent constructor.
	this.name = LANG.TEXT.woodlouseName;

	this.body = this.create(0, 0, 'balloon', 'louse');
	this.body.anchor.set(0.5);

	this.pike = this.create(this.width / 2 - 10, this.height * 0.2, 'balloon', 'hook');
	this.pike.width = 0;

	this._happy = TweenMax.to(this, 0.2, {
		y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	return this;
}

WoodLouse.prototype.setNeutral = function () {
	this._happy.pause(0);
};

WoodLouse.prototype.setHappy = function () {
	this._happy.play();
};

WoodLouse.prototype.setSurprised = WoodLouse.prototype.setNeutral;
WoodLouse.prototype.setSad = WoodLouse.prototype.setNeutral;
