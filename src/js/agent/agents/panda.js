/*
 * Inherits Agent
 * The panda agent.
 */
function Panda () {
	Agent.call(this); // Call parent constructor.

	this.gfx.create(0, 0, 'panda');
	var coords = {
		leftEye: { x: 146 + 45, y: 156 + 45 },
		rightEye: { x: 341 + 45, y: 161 + 45 },
		eyeDepth: 20,
		eyeMaxMove: 8
	};
	this.gfx.leftEye = this.gfx.create(coords.leftEye.x, coords.leftEye.y, 'pandaEye');
	this.gfx.leftEye.anchor.setTo(0.5);
	this.gfx.leftEye.depth = coords.eyeDepth;
	this.gfx.leftEye.maxMove = coords.eyeMaxMove;
	this.gfx.rightEye = this.gfx.create(coords.rightEye.x, coords.rightEye.y, 'pandaEye');
	this.gfx.rightEye.anchor.setTo(0.5);
	this.gfx.rightEye.depth = coords.eyeDepth;
	this.gfx.rightEye.maxMove = coords.eyeMaxMove;

	return this;
}

// inheritance
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;