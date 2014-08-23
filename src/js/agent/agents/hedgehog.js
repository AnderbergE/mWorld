Hedgehog.prototype = Object.create(Agent.prototype);
Hedgehog.prototype.constructor = Hedgehog;

Hedgehog.prototype.id = 'hedgehog'; // Reference for LANG files and asset files
Hedgehog.prototype.agentName = LANG.TEXT.hedgehogName;

/**
 * The panda agent.
 * The asset files are loaded in the boot state using key: Hedgehog.prototype.id.
 * @return Itself
 */
function Hedgehog () {
	this.coords = {
		arm: {
			left: { x: -130, y: -80 },
			right: { x: 130, y: -80 }
		},
		leg: {
			left: { x: -150, y: 300 },
			right: { x: 150, y: 300 }
		},
		eye: {
			left: { x: -53, y: -272 },
			right: { x: 35, y: -272 },
			depth: 10,
			maxMove: 9
		},
		mouth: {
			x: -6, y: -205
		}
	};

	Agent.call(this); // Call parent constructor.

	var leftEyeSocket = this.create(this.coords.eye.left.x + 1, this.coords.eye.left.y - 8, this.id, 'socket');
	leftEyeSocket.anchor.set(0.5);
	this.bringToTop(this.leftEye);

	var rightEyeSocket = this.create(this.coords.eye.right.x - 1, this.coords.eye.right.y - 8, this.id, 'socket');
	rightEyeSocket.anchor.set(0.5);
	rightEyeSocket.scale.set(-1, 1);
	this.bringToTop(this.rightEye);

	var nose = this.create(this.coords.mouth.x - 2, this.coords.mouth.y - 15, this.id, 'nose');
	nose.anchor.set(0.5);
	
	var back = this.create(0, 0, this.id, 'back');
	back.anchor.set(0.5);
	this.sendToBack(back);

	return this;
}