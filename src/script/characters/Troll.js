var Agent = require('./Agent.js');
var LANG = require('../language.js');

module.exports = Troll;

Troll.prototype = Object.create(Agent.prototype);
Troll.prototype.constructor = Troll;
Troll.prototype.id = 'troll'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 * @param {Boolean} noAudio - Set to true to not load audio.
 */
Troll.load = function(noAudio) {
	this.load.atlasJSONHash(Troll.prototype.id, 'img/characters/troll/atlas.png', 'img/characters/troll/atlas.json');
	if (!noAudio) {
		this.game.load.audio(Troll.prototype.id + 'Speech', LANG.SPEECH.troll.speech);
	}
};

/**
 * The troll agent.
 * The asset files are loaded in the boot state using key: *.prototype.id.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Troll (game, x, y) {
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

	Agent.call(this, game, x, y); // Call parent constructor.

	this.leftArm.rotation = -1.1;
	this.rightArm.rotation = 1.1;
	this.bringToTop(this.leftArm);
	this.bringToTop(this.rightArm);

	this.head = this.create(this.coords.head.x, this.coords.head.y, this.id, 'head');
	this.head.anchor.set(0.5);

	this.wand = this.leftArm.create(this.leftArm.x - 90, this.leftArm.y + 300, this.id, 'wand');
	this.wand.angle = 150;
	this.leftArm.sendToBack(this.wand);

	this.tip = this.leftArm.create(this.wand.x - 490, this.wand.y + 90);

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
	var value;
	if (shape === 'stone') {
		this.stone.alpha = 1;
		value = 0;
	} else if (shape === 'troll') {
		this.stone.alpha = 0;
		value = 1;
	}

	this.leftArm.alpha = value;
	this.rightArm.alpha = value;
	this.leftLeg.alpha = value;
	this.rightLeg.alpha = value;
	this.body.alpha = value;
	this.leftEye.alpha = value;
	this.rightEye.alpha = value;
	this.mouth.alpha = value;
	this.head.alpha = value;
	this.wand.alpha = value;
};

Troll.prototype.transform = function (type) {
	var t = new TimelineMax();
	this.changeShape(type === 'stone' ? 'troll' : 'stone'); // Setup the "anti"-state.
	var getUp = this.y - this.stone.height / 2 - this.leftLeg.height + 8;

	t.addCallback(function () {
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.flow(2000, 10, 1, 120);
	}, null, null, this);

	if (type === 'troll') {
		t.fromTo(this.leftLeg, 0.2, { alpha: 0, height: 0 }, { alpha: 1, height: this.leftLeg.height, ease: Power1.easeIn }, 0);
		t.fromTo(this.rightLeg, 0.2, { alpha: 0, height: 0 }, { alpha: 1, height: this.rightLeg.height, ease: Power1.easeIn }, 0);
		t.to(this.stone, 0.2, { y: getUp, ease: Power1.easeIn }, 0);

		t.addLabel('arms');
		t.fromTo(this.leftArm, 0.2, { alpha: 0, height: 0 }, { alpha: 1, height: this.leftArm.height, ease: Power1.easeIn }, 'arms');
		t.fromTo(this.rightArm, 0.2, { alpha: 0, height: 0 }, { alpha: 1, height: this.rightArm.height, ease: Power1.easeIn }, 'arms');
		t.fromTo(this.wand, 0.2, { alpha: 0, width: 0 }, { alpha: 1, width: this.wand.width, ease: Power1.easeIn }, 'arms');
		t.to(this.stone.scale, 0.2, { x: 0.8, y: 0.8, ease: Power1.easeIn }, 'arms');

		t.addLabel('head');
		t.fromTo(this.head, 0.2, { alpha: 0, height: 0, width: 0 }, { alpha: 1, height: this.head.height, width: this.head.width, ease: Power1.easeIn }, 'head');
		t.to(this.leftEye, 0.2, { alpha: 1 }, 'head');
		t.to(this.rightEye, 0.2, { alpha: 1 }, 'head');
		t.to(this.mouth, 0.2, { alpha: 1 }, 'head');

		t.addLabel('stone');
		t.to(this.stone, 0.2, { y: this.body.y, ease: Power1.easeIn }, 'stone');
		t.to(this.stone, 0.2, { height: this.stone.height / 2, ease: Power1.easeIn }, 'stone');
		t.to(this.stone.scale, 0.2, { x: 0.7, y: 0.7, ease: Power1.easeIn }, 'stone');

		t.addLabel('body', '+=0.08');
		t.to(this.body, 0.2, { alpha: 1 }, 'body');
		t.to(this.stone, 0.2, { alpha: 0 }, 'body');

	} else { // To stone
		t.addLabel('body');
		t.to(this.stone, 0.2, { alpha: 1 }, 'body');
		t.to(this.body, 0.2, { alpha: 0 }, 'body');

		t.addLabel('stone');
		t.to(this.stone, 0.2, { height: this.stone.height * 2, ease: Power1.easeIn }, 'stone');
		t.to(this.stone.scale, 0.2, { x: 0.8, y: 0.8, ease: Power1.easeIn }, 'stone');

		t.addLabel('head');
		t.fromTo(this.head, 0.2, { alpha: 1, height: this.head.height, width: this.head.width}, { alpha: 0, height: 0, width: 0, ease: Power1.easeIn }, 'head');
		t.to(this.leftEye, 0.2, { alpha: 0 }, 'head');
		t.to(this.rightEye, 0.2, { alpha: 0 }, 'head');
		t.to(this.mouth, 0.2, { alpha: 0 }, 'head');

		t.addLabel('arms');
		t.to(this.stone.scale, 0.2, {x: 1, y: 1, ease: Power1.easeIn}, 'arms');

		t.fromTo(this.leftArm, 0.2, { alpha: 1, height: this.leftArm.height }, { alpha: 0, height: 0, ease: Power1.easeIn }, 'arms');
		t.fromTo(this.rightArm, 0.2, { alpha: 1, height: this.rightArm.height }, { alpha: 0, height: 0, ease: Power1.easeIn }, 'arms');
		t.fromTo(this.wand, 0.2, { alpha: 1, width: this.wand.width }, { alpha: 0, width: 0, ease: Power1.easeIn }, 'arms');

		t.addLabel('legs');
		t.to(this.stone, 0.2, { y: -getUp, ease: Power1.easeIn }, 'legs');
		t.fromTo(this.leftLeg, 0.2, { alpha: 1, height: this.leftLeg.height}, {  alpha: 0, height: 0, ease: Power1.easeIn}, 'legs');
		t.fromTo(this.rightLeg, 0.2, { alpha: 1, height: this.rightLeg.height}, {  alpha: 0, height: 0, ease: Power1.easeIn}, 'legs');
	}

	return t;
};

Troll.prototype.water = function (posX, state) {
	this.parent.bringToTop(this);
	this.visible = true;
	this.angle = 0;

	var t = new TimelineMax();
	t.fromTo(this, 1.5, { x: posX, y: 1300 }, { x: posX, y: 740, ease: Power3.easeIn }, 0);
	t.to(this.leftArm, 1, { rotation: 0.7, ease: Power4.easeIn }, 1);
	t.addSound(this.speech, this, 'yesWater', 1);

	t.addCallback(function () {
		// Doing this in a callback to make sure that tip position is correct.
		state.addWater(this.tip.world.x, this.tip.world.y)
			.add(state.addWater(this.tip.world.x, this.tip.world.y), '-=2')
			.add(state.addWater(this.tip.world.x, this.tip.world.y), '-=2');
	}, 2, null, this);

	t.to(this, 0.5, { x: posX, y: 1300, ease: Power3.easeOut }, 10);
	t.to(this.leftArm, 0.3, { rotation: -1.1, ease: Power4.easeIn });
	return t;
};

Troll.prototype.appear = function (targetX, targetY, side, offsetX) {
	side = side || this.game.rnd.pick(['top', 'left', 'right']);
	offsetX = offsetX || 0;

	var fromX = this.game.camera.x + this.game.rnd.between(this.width, this.game.camera.width - this.width);
	var fromY = this.game.rnd.between(this.width, this.game.world.height - this.width);
	var toX = fromX;
	var toY = fromY;
	if (side === 'top') {
		this.angle = 180;
		fromY = -500;
		toY = 30;
	} else if (side === 'left') {
		this.angle = 90;
		fromX = this.game.camera.x - 500;
		toX = this.game.camera.x + 30;
	} else { // right
		this.angle = 270;
		fromX = this.game.camera.x + this.game.camera.width + 500;
		toX = this.game.camera.x +this.game.camera.width - 30;
	}
	fromX += offsetX;
	toX += offsetX;

	var t = new TimelineMax();
	t.addCallback(function () {
		this.visible = true;
		this.parent.bringToTop(this);
		this.eyesFollowObject(this.emitter);
	}, null, null, this);

	t.fromTo(this, 1, { x: fromX, y: fromY }, { x: toX, y: toY, ease: Power3.easeIn }, 0);
	t.addSound(this.speech, this, 'iCanHelp', 0);
	t.to(this.leftArm, 0.5, { rotation: 1, ease: Power4.easeIn });
	t.add(this.swish(targetX, targetY));
	t.to(this, 1, { x: fromX, y: fromY, ease: Power3.easeOut }, '-=2' );
	t.to(this.leftArm, 0.3, { rotation: -1.1, ease: Power4.easeIn });

	t.addCallback(this.eyesStopFollow, null, null, this);
	return t;
};

Troll.prototype.swish = function (targetX, targetY) {
	var t = new TimelineMax();
	t.to(this.leftArm, 0.1, { rotation: 0.4, ease: Power4.easeIn });
	t.addCallback(function () {
		this.emitter.x = this.tip.world.x;
		this.emitter.y = this.tip.world.y;
		this.emitter.flow(2000, 10, 1, 120); // Lasts totally 3.2s.
	}, null, null, this);
	t.to(this.emitter, 2.6, { x: targetX, y: targetY, ease: Power2.easeOut });
	t.addCallback(this.emitter.kill, '+=0.6', null, this.emitter);
	return t;
};
