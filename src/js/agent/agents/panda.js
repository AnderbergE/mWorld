/* The panda agent */
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;

function Panda () {
	Agent.call(this); // Call parent constructor.
	this.coords = {
		eye: {
			left: { x: -96, y: -220 },
			right: { x: 99, y: -215 },
			depth: 20,
			maxMove: 8
		}
	};

	this.body = this.create(0, 0, 'panda');
	this.body.anchor.setTo(0.5);

	this.leftEye = this.create(this.coords.eye.left.x, this.coords.eye.left.y, 'pandaEye');
	this.leftEye.anchor.setTo(0.5);
	this.rightEye = this.create(this.coords.eye.right.x, this.coords.eye.right.y, 'pandaEye');
	this.rightEye.anchor.setTo(0.5);

	return this;
}