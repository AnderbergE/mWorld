var Character = require('./Character.js');

module.exports = WoodLouse;

/* Grålle, the wood louse you are helping. */
WoodLouse.prototype = Object.create(Character.prototype);
WoodLouse.prototype.constructor = WoodLouse;
function WoodLouse (game, x, y) {
	Character.call(this, game); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;

	this.body = this.create(0, 0, 'balloon', 'louse');
	this.body.anchor.set(0.5);

	this.pike = this.create(this.width / 2 - 10, this.height * 0.2, 'balloon', 'hook');
	this.pike.width = 0;

	return this;
}
