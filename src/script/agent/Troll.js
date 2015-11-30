var Agent = require('./Agent.js');
var LANG = require('../language.js');

module.exports = Troll;

Troll.prototype = Object.create(Agent.prototype);
Troll.prototype.constructor = Troll;

Troll.prototype.id = 'troll'; // Reference for LANG files and asset files
Troll.prototype.agentName = LANG.TEXT.trollName;

/**
 * The troll agent.
 * The asset files are loaded in the boot state using key: *.prototype.id.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Troll (game) {
	this.coords = {
		arm: {
			left: { x: -215, y: -260 },
			right: { x: 190, y: -260 }
		},
		leg: {
			left: { x: -188, y: 128 },
			right: { x: 188, y: 128 }
		},
		head: {
			x: 0, y: -600
		},
		eye: {
			left: { x: -98, y: -490 },
			right: { x: 50, y: -490 },
			depth: 20,
			maxMove: 9
		},
		mouth: {
			x: -25, y: -300
		}
	};

	Agent.call(this, game); // Call parent constructor.

	this.leftArm.rotation = -1.1;
	this.rightArm.rotation = 1.1;
	this.bringToTop(this.leftArm);
	this.bringToTop(this.rightArm);

	this.head = this.create(this.coords.head.x, this.coords.head.y, this.id, 'head');
	this.head.anchor.set(0.5);

	this.wand = this.leftArm.create(this.leftArm.x - 90, this.leftArm.y + 300, this.id, 'wand');
	this.wand.angle = 150;
	this.leftArm.sendToBack(this.wand);

	this.tip = this.leftArm.create(this.wand.x - 490, this.wand.y + 90, '', '');

	this.bringToTop(this.leftEye);
	this.bringToTop(this.rightEye);
	this.bringToTop(this.mouth);

	this.stone = this.create(this.x, this.y, this.id, 'stone');
	this.stone.anchor.set(0.5);
	this.stone.alpha = 0;

	this.emitter = this.game.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
	this.emitter.setAlpha(1, 0, 3000);
	this.emitter.makeParticles(this.id, 'star');

	return this;
}

Troll.prototype.changeShape = function (shape) {
	if (shape === 'stone') {
		this.stone.alpha = 1;

		this.leftArm.alpha = 0;
		this.rightArm.alpha = 0;
		this.leftLeg.alpha = 0;
		this.rightLeg.alpha = 0;
		this.body.alpha = 0;
		this.leftEye.alpha = 0;
		this.rightEye.alpha = 0;
		this.mouth.alpha = 0;
		this.head.alpha = 0;
		this.wand.alpha = 0;

	} else if (shape === 'troll') {
		this.stone.alpha = 0;

		this.leftArm.alpha = 1;
		this.rightArm.alpha = 1;
		this.leftLeg.alpha = 1;
		this.rightLeg.alpha = 1;
		this.body.alpha = 1;
		this.leftEye.alpha = 1;
		this.rightEye.alpha = 1;
		this.mouth.alpha = 1;
		this.head.alpha = 1;
		this.wand.alpha = 1;
	}
};

Troll.prototype.transform = function (fromTo) {

	var t = new TimelineMax();

	var getUp;

	if (fromTo === 'stoneToTroll') {

		this.stone.alpha = 1;

		this.leftArm.alpha = 0;
		this.rightArm.alpha = 0;
		this.leftLeg.alpha = 0;
		this.rightLeg.alpha = 0;
		this.body.alpha = 0;
		this.leftEye.alpha = 0;
		this.rightEye.alpha = 0;
		this.mouth.alpha = 0;
		this.head.alpha = 0;
		this.wand.alpha = 0;

		getUp = this.y - this.stone.height / 2 - this.leftLeg.height + 8;

		t.addCallback(function () {
			this.emitter.x = this.x;
			this.emitter.y = this.y;
			this.emitter.flow(2000, 10, 1, 120);
		}, null, null, this);

		t.addLabel('legs');

		t.add(new TweenMax(this.leftLeg, 0.2, {alpha:1}), 'legs');
		t.add(new TweenMax(this.rightLeg, 0.2, {alpha:1}), 'legs');

		t.add(new TweenMax.fromTo(this.leftLeg, 0.2, {height: 0}, {height: this.leftLeg.height, ease: Power1.easeIn}), 'legs');
		t.add(new TweenMax.fromTo(this.rightLeg, 0.2, {height: 0}, {height: this.rightLeg.height, ease: Power1.easeIn}), 'legs');

		t.to(this.stone, 0.2, {y: getUp, ease: Power1.easeIn}, 'legs+=0.2');

		t.addLabel('arms');

		t.add(new TweenMax(this.leftArm, 0.2, {alpha:1}), 'arms');
		t.add(new TweenMax(this.rightArm, 0.2, {alpha:1}), 'arms');
		t.add(new TweenMax(this.wand, 0.2, {alpha:1}), 'arms');

		t.add(new TweenMax.fromTo(this.leftArm, 0.2, {height: 0}, {height: this.leftArm.height, ease: Power1.easeIn}), 'arms');
		t.add(new TweenMax.fromTo(this.rightArm, 0.2, {height: 0}, {height: this.rightArm.height, ease: Power1.easeIn}), 'arms');
		t.add(new TweenMax.fromTo(this.wand, 0.2, {width: 0}, {width: this.wand.width, ease: Power1.easeIn}), 'arms');

		t.to(this.stone.scale, 0.2, {x: 0.8, y: 0.8, ease: Power1.easeIn}, 'arms+=0.08');

		t.addLabel('head');

		t.add(new TweenMax(this.head, 0.2, {alpha:1}), 'head');
		t.add(new TweenMax(this.leftEye, 0.2, {alpha:1}), 'head');
		t.add(new TweenMax(this.rightEye, 0.2, {alpha:1}), 'head');
		t.add(new TweenMax(this.mouth, 0.2, {alpha:1}), 'head');

		t.add(new TweenMax.fromTo(this.head, 0.2, {height: 0, width: 0}, {height: this.head.height, width: this.head.width, ease: Power1.easeIn}), 'head');

		t.addLabel('stone');

		t.to(this.stone.scale, 0.2, {x: 0.7, y: 0.7, ease: Power1.easeIn}, 'stone');
		t.to(this.stone, 0.2, {y: this.body.y, ease: Power1.easeIn}, 'stone');
		t.to(this.stone, 0.2, {height: this.stone.height / 2, ease: Power1.easeIn}, 'stone');

		t.addLabel('body', '+=0.08');

		t.add(new TweenMax(this.body, 0.2, {alpha:1}), 'body');
		t.add(new TweenMax(this.stone, 0.2, {alpha:0}), 'body-=0.02');

	} else if (fromTo === 'trollToStone') {

		this.stone.alpha = 0;

		this.leftArm.alpha = 1;
		this.rightArm.alpha = 1;
		this.leftLeg.alpha = 1;
		this.rightLeg.alpha = 1;
		this.body.alpha = 1;
		this.leftEye.alpha = 1;
		this.rightEye.alpha = 1;
		this.mouth.alpha = 1;
		this.head.alpha = 1;
		this.wand.alpha = 1;

		getUp = this.y - this.stone.height / 2 - this.leftLeg.height + 8;

		t.addCallback(function () {
			this.emitter.x = this.x;
			this.emitter.y = this.y;
			this.emitter.flow(2000, 10, 1, 120);
		}, null, null, this);

		t.addLabel('body');

		t.add(new TweenMax(this.stone, 0.2, {alpha:1}), 'body');
		t.add(new TweenMax(this.body, 0.2, {alpha:0}), 'body-=0.02');

		t.addLabel('stone');


		t.to(this.stone, 0.2, {height: this.stone.height * 2, ease: Power1.easeIn}, 'stone');
		t.to(this.stone.scale, 0.2, {x: 0.8, y: 0.8, ease: Power1.easeIn}, 'stone');

		t.addLabel('head');

		t.add(new TweenMax.fromTo(this.head, 0.2, {height: this.head.height, width: this.head.width}, {height: 0, width: 0, ease: Power1.easeIn}), 'head');

		t.add(new TweenMax(this.head, 0.2, {alpha:0}), 'head');
		t.add(new TweenMax(this.leftEye, 0.2, {alpha:0}), 'head');
		t.add(new TweenMax(this.rightEye, 0.2, {alpha:0}), 'head');
		t.add(new TweenMax(this.mouth, 0.2, {alpha:0}), 'head');

		t.addLabel('arms');

		t.to(this.stone.scale, 0.2, {x: 1, y: 1, ease: Power1.easeIn}, 'arms+=0.08');

		t.add(new TweenMax.fromTo(this.leftArm, 0.2, {height: this.leftArm.height}, {height: 0, ease: Power1.easeIn}), 'arms');
		t.add(new TweenMax.fromTo(this.rightArm, 0.2, {height: this.rightArm.height}, {height: 0, ease: Power1.easeIn}), 'arms');
		t.add(new TweenMax.fromTo(this.wand, 0.2, {width: this.wand.width}, {width: 0, ease: Power1.easeIn}), 'arms');

		t.add(new TweenMax(this.leftArm, 0.2, {alpha:0}), 'arms');
		t.add(new TweenMax(this.rightArm, 0.2, {alpha:0}), 'arms');
		t.add(new TweenMax(this.wand, 0.2, {alpha:0}), 'arms');


		t.addLabel('legs');

		t.to(this.stone, 0.2, {y: -getUp, ease: Power1.easeIn}, 'legs-=0.2');

		t.add(new TweenMax.fromTo(this.leftLeg, 0.2, {height: this.leftLeg.height}, {height: 0, ease: Power1.easeIn}), 'legs');
		t.add(new TweenMax.fromTo(this.rightLeg, 0.2, {height: this.rightLeg.height}, {height: 0, ease: Power1.easeIn}), 'legs');

		t.add(new TweenMax(this.leftLeg, 0.2, {alpha:0}), 'legs');
		t.add(new TweenMax(this.rightLeg, 0.2, {alpha:0}), 'legs');
	}

	return t;
};

Troll.prototype.water = function (posX, state) {
	this.parent.bringToTop(this);
	this.visible = true;
	this.angle = 0;

	var t = new TimelineMax();
	t.addLabel('arm');
	t.fromTo(this, 1.5, {x:posX, y:1300}, {x:posX, y:740, ease: Power3.easeIn});
	t.to(this.leftArm, 1, {rotation: 0.7, ease: Power4.easeIn, delay: 0.3}, 'arm+=0.5');
	t.addSound(this.speech, this, 'yesWater', 'arm+=1.5');

	t.addLabel('waterDone', '+=8');
	t.addCallback(function () {
		state.addWater(this.tip.world.x, this.tip.world.y)
			.add(state.addWater(this.tip.world.x, this.tip.world.y), '-=2')
			.add(state.addWater(this.tip.world.x, this.tip.world.y), '-=2');
	}, null, null, this);

	t.to(this, 0.5, {x:posX, y:1300, ease: Power3.easeOut}, 'waterDone');
	t.to(this.leftArm, 0.3, {rotation: -1.1, ease: Power4.easeIn});

	return t;
};

Troll.prototype.appear = function (randomPos, targetX, targetY, topX) {
	var horizontalX = this.game.rnd.between(200, 800);
	var verticalY = this.game.rnd.between(200, 550);

	var pos;
	if (randomPos === 'random') {
		pos = this.game.rnd.pick(['posTop', 'posLeft', 'posRight']);
	} else if (randomPos === 'top') {
		pos = 'posTop';
		horizontalX = horizontalX - topX;
	}

	this.parent.bringToTop(this);
	this.visible = true;

	var t = new TimelineMax();
	t.addCallback(function () {
		this.eyesFollowObject(this.emitter);
	}, null, null, this);

	if (pos === 'posTop') {
		this.angle = 180;

		t.addLabel('arm');
		t.fromTo(this, 3, {x:horizontalX, y:-500}, {x:horizontalX, y:30, ease: Power3.easeIn});
		t.to(this.leftArm, 1.2, {rotation: 1, ease: Power4.easeIn, delay: 0.3}, 'arm+=0.5');
		t.addSound(this.speech, this, 'iCanHelp', 'arm+=1.5');
		t.add(this.swish(targetX, targetY));
		t.to(this, 1.5, {x:horizontalX, y:-500, ease: Power3.easeOut}, '-=1.5');
		t.to(this.leftArm, 0.3, {rotation: -1.1, ease: Power4.easeIn});

	} else if (pos === 'posLeft') {
		this.angle = 90;

		t.addLabel('arm');
		t.fromTo(this, 3, {x:-500, y:verticalY}, {x:30, y:verticalY, ease: Power3.easeIn});
		t.to(this.leftArm, 1.2, {rotation: 1, ease: Power4.easeIn, delay: 0.3}, 'arm+=0.5');
		t.addSound(this.speech, this, 'iCanHelp', 'arm+=1.5');
		t.add(this.swish(targetX, targetY));
		t.to(this, 1.5, {x:-500, y:verticalY, ease: Power3.easeOut}, '-=1.5');
		t.to(this.leftArm, 0.3, {rotation: -1.1, ease: Power4.easeIn});

	} else if (pos === 'posRight') {
		this.angle = 270;

		t.addLabel('arm');
		t.fromTo(this, 3, {x:1600, y:verticalY}, {x:990, y:verticalY, ease: Power3.easeIn});
		t.to(this.leftArm, 1.2, {rotation: 1, ease: Power4.easeIn, delay: 0.3}, 'arm+=0.5');
		t.addSound(this.speech, this, 'iCanHelp', 'arm+=1.5');
		t.add(this.swish(targetX, targetY));
		t.to(this, 1.5, {x:1600, y:verticalY, ease: Power3.easeOut}, '-=1.5');
		t.to(this.leftArm, 0.3, {rotation: -1.1, ease: Power4.easeIn});
	}

	t.addCallback(this.eyesStopFollow, null, null, this);

	return t;
};

Troll.prototype.swish = function (targetX, targetY) {
	var t = new TimelineMax();
	t.to(this.leftArm, 0.05, {rotation: 0.4, ease: Power4.easeIn});
	t.addCallback(function () {
		this.emitter.x = this.tip.world.x;
		this.emitter.y = this.tip.world.y;
		this.emitter.flow(2000, 10, 1, 120);
	}, '+=0.4', null, this);
	t.to(this.emitter, 2.6, {x:targetX, y:targetY, ease: Power2.easeOut});
	return t;
};
