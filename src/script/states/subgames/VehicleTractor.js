var Character = require('../../agent/Character.js');

module.exports = VehicleTractor;

VehicleTractor.prototype = Object.create(Character.prototype);
VehicleTractor.prototype.constructor = VehicleTractor;

VehicleTractor.prototype.pos = {
	eyeNeutralPos: { x: 51, y: -80 },
	eyeAgentPos: { x: 49, y: -84 },
	eyeCranePos: { x: 49, y: -82 }
};

/**
 * The tractor that you are helping to load the trailer.
 * @constructor
 * @param {Object} game - The game object.
 * @param {number} x - The x position.
 * @param {number} y - The y position.
 * @return {Object} Itself.
 */
function VehicleTractor (game, x, y) {
	Character.call(this, game); // Parent constructor.
	this.turn = true;
	this.x = x || 0;
	this.y = y || 0;

	this.body = this.game.add.sprite(0, 0, 'vehicle', 'tractor', this);
	this.body.anchor.set(0, 1);
	this.eyes = this.game.add.sprite(51, -80, 'vehicle', 'tractor_eyes', this);
	this.eyes.anchor.set(0.5, 0.5);
	this.mouth = this.game.add.sprite(50, -62, 'vehicle', 'tractor_happy', this);
	this.mouth.anchor.set(0.5, 0);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	return this;
}

/**
 * Set the tractors eyes to look at the crane.
 * @return {Object} The animation timeline.
 */
VehicleTractor.prototype.lookAtCrane = function ()
{
	var t = new TimelineMax();
	
	t.to(this.eyes, 0.6, { x: this.pos.eyeCranePos.x, y: this.pos.eyeCranePos.y, ease: Power1.easeInOut });
	
	return t;
};

/**
 * Set the tractors eyes to look at the agent.
 * @return {Object} The animation timeline.
 */
VehicleTractor.prototype.lookAtAgent = function ()
{
	var t = new TimelineMax();
	
	t.to(this.eyes, 0.4, { x: this.pos.eyeAgentPos.x, y: this.pos.eyeAgentPos.y, ease: Power1.easeInOut });
	
	return t;
};

/**
 * Set the cranes eyes to look at the user.
 * @return {Object} The animation timeline.
 */
VehicleTractor.prototype.lookAtUser = function ()
{
	var t = new TimelineMax();
	
	t.to(this.eyes, 0.4, { x: this.pos.eyeNeutralPos.x, y: this.pos.eyeNeutralPos.y, ease: Power1.easeInOut });
	
	return t;	
};
