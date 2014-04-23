/* The panda agent */
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;

function Panda () {
	Agent.call(this); // Call parent constructor.
	var coords = {
		leftEye: { x: 146 + 45, y: 156 + 45 },
		rightEye: { x: 341 + 45, y: 161 + 45 },
		eyeDepth: 20,
		eyeMaxMove: 8
	};

	this.create(0, 0, 'panda');
	this.leftEye = this.create(coords.leftEye.x, coords.leftEye.y, 'pandaEye');
	this.leftEye.anchor.setTo(0.5);
	this.leftEye.depth = coords.eyeDepth;
	this.leftEye.maxMove = coords.eyeMaxMove;
	this.rightEye = this.create(coords.rightEye.x, coords.rightEye.y, 'pandaEye');
	this.rightEye.anchor.setTo(0.5);
	this.rightEye.depth = coords.eyeDepth;
	this.rightEye.maxMove = coords.eyeMaxMove;

	return this;
}