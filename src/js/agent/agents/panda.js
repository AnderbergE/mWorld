/* The panda agent */
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;

function Panda () {
	Agent.call(this); // Call parent constructor.
	this.coords = {
		eye: {
			left: { x: 146 + 45, y: 156 + 45 },
			right: { x: 341 + 45, y: 161 + 45 },
			depth: 20,
			maxMove: 8
		}
	};

	this.create(0, 0, 'panda');

	this.leftEye = this.create(this.coords.eye.left.x, this.coords.eye.left.y, 'pandaEye');
	this.leftEye.anchor.setTo(0.5);
	this.rightEye = this.create(this.coords.eye.right.x, this.coords.eye.right.y, 'pandaEye');
	this.rightEye.anchor.setTo(0.5);

	return this;
}