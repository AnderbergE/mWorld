/* The panda agent */
Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;
Panda.prototype.id = 'panda'; // Reference for LANG files

function Panda () {
	Agent.call(this); // Call parent constructor.
	this.name = LANG.TEXT.pandaName;
	this.coords.arm = {
		left: { x: -150, y: -20 },
		right: { x: 150, y: -20 }
	};
	this.coords.leg = {
		left: { x: -130, y: 320 },
		right: { x: 130, y: 320 }
	};
	this.coords.eye = {
		left: { x: -65, y: -238 },
		right: { x: 65, y: -238 },
		depth: 20,
		maxMove: 9
	};

	this.body = this.create(0, 0, 'pandaBody');
	this.body.anchor.set(0.5);

	this.leftArm.x = this.coords.arm.left.x;
	this.leftArm.y = this.coords.arm.left.y;
	var leftarm = game.add.sprite(0, 0, 'pandaArm', null, this.leftArm);
	leftarm.anchor.set(1, 0.5);
	this.rightArm.x = this.coords.arm.right.x;
	this.rightArm.y = this.coords.arm.right.y;
	var rightarm = game.add.sprite(0, 0, 'pandaArm', null, this.rightArm);
	rightarm.anchor.set(1, 0.5);
	rightarm.scale.x = -1;
	this.leftLeg.x = this.coords.leg.left.x;
	this.leftLeg.y = this.coords.leg.left.y;
	var leftleg = game.add.sprite(0, 0, 'pandaLeg', null, this.leftLeg);
	leftleg.anchor.set(0.5, 0);
	this.rightLeg.x = this.coords.leg.right.x;
	this.rightLeg.y = this.coords.leg.right.y;
	var rightleg = game.add.sprite(0, 0, 'pandaLeg', null, this.rightLeg);
	rightleg.anchor.set(0.5, 0);
	rightleg.scale.x = -1;

	this.leftEye = this.create(this.coords.eye.left.x, this.coords.eye.left.y, 'pandaEye');
	this.leftEye.anchor.set(0.5);
	this.rightEye = this.create(this.coords.eye.right.x, this.coords.eye.right.y, 'pandaEye');
	this.rightEye.anchor.set(0.5);

	return this;
}