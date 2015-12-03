var Character = require('./Character.js');

module.exports = WoodLouse;

/* Grålle, the wood louse you are helping. */
WoodLouse.prototype = Object.create(Character.prototype);
WoodLouse.prototype.constructor = WoodLouse;
WoodLouse.prototype.id = 'woodlouse'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
WoodLouse.load = function() {
	this.game.load.image(WoodLouse.prototype.id, 'img/characters/woodlouse/woodlouse.png');
};

function WoodLouse (game, x, y) {
	Character.call(this, game, x, y); // Parent constructor.

	this.body = this.create(0, 0, this.id);
	this.body.anchor.set(0.5);

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
