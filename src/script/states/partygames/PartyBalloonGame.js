var PartyGame = require('./PartyGame.js');
var GLOBAL = require('../../global.js');
var util = require('../../utils.js');
var Hedgehog = require('../../characters/agents/Hedgehog.js');
var NumberButton = require('../../objects/buttons/NumberButton.js');

module.exports = PartyBalloonGame;

PartyBalloonGame.prototype = Object.create(PartyGame.prototype);
PartyBalloonGame.prototype.constructor = PartyBalloonGame;

function PartyBalloonGame () {
	PartyGame.call(this); // Call parent constructor.
}

var balloonFrames = ['b1', 'b2', 'b3', 'b4', 'b5'];
var trollChance = 40;

PartyBalloonGame.prototype.pos = {
	helper1: { x: 370, y: 540 },
	helper2: { x: 580, y: 520 },
	pump: { x: 550, y: 306 },
	stack: { x: 800, y: 470 },
	balloonHeight: 30,
	thoughtOffset: 10,
	atStack: 0 // Set in create function.
};

PartyBalloonGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('partyBalloon', 'img/partygames/balloonGame/atlas.png', 'img/partygames/balloonGame/atlas.json');
};

PartyBalloonGame.prototype.create = function () {
	// The balloon game uses helper1, it should be Mouse or Hedgehog as backup.
	if (this.birthdayType === Hedgehog) {
		this.switchAgents();
	}

	PartyGame.prototype.create.call(this);
	this.afterGarlands();

	this.pos.atStack = this.helper2 instanceof Hedgehog ? 95 : 70;

	this.gameGroup.create(0, 0, 'partyBalloon', 'background1');

	this.balloonStack = this.add.group(this.gameGroup);
	this.balloonStack.x = this.pos.stack.x;
	this.balloonStack.y = this.pos.stack.y;

	this.pump = new Pump(this.game, this.pos.pump.x, this.pos.pump.y);
	this.pump.bottom.events.onInputDown.add(this.pressPump, this);
	this.gameGroup.add(this.pump);
	this.gameGroup.create(0, 650, 'partyBalloon', 'background2'); // This is a sneaky way of hiding the pump when it is going down.

	this.thoughtGroup = this.add.group(this.gameGroup);
	this.thoughtGroup.x = 340;
	this.thoughtGroup.y = 210;
	this.thoughtGroup.visible = false;

	var bubble = this.thoughtGroup.create(0, 0, 'objects', 'thought_bubble');
	bubble.scale.set(-1.2, 1.2);
	bubble.anchor.set(0.5);
	bubble.angle = -15;

	this.representations = this.add.group(this.thoughtGroup);

	var bmd = this.add.bitmapData(3, 160);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#bdbdbd';
	bmd.ctx.fill();
	this.representations.divider = this.representations.create(0, -10, bmd);
	this.representations.divider.anchor.set(0.5);
	this.representations.divider.visible = false;

	this.representations.add(this.representations.divider);
	this.representations.tube = new Pump(this.game, 0, -90);
	this.representations.tube.onlyMarkers();
	this.representations.tube.scale.set(0.55);
	this.representations.add(this.representations.tube);
	this.representations.dice = new NumberButton(this.game, 1, GLOBAL.NUMBER_REPRESENTATION.dice, { y: -50, vertical: false });
	this.representations.add(this.representations.dice);
	this.representations.number = this.game.add.text(0, 0, 0, { font: '60pt ' + GLOBAL.FONT });
	this.representations.number.anchor.set(0.5);
	this.representations.add(this.representations.number);

	this.explosion = this.gameGroup.create(this.pump.x - this.pump.tube.width, this.pump.y + this.pump.height / 2, 'partyBalloon', 'explosion');
	this.explosion.visible = false;
	this.explosion.anchor.set(0.5);

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Change level of difficulty, amount
PartyBalloonGame.prototype.getAmount = function (max) {
	return this.game.rnd.between(1, max);
};

PartyBalloonGame.prototype.generateRound = function () {
	var max = this.difficulty < 4 ? 4 : this.difficulty | 0;
	max = max > 9 ? 9 : max;
	this.correctAmount = this.getAmount(max); // "|" is a fast way to round down.
	this.pump.setupMarkers(max);

	if (this.difficulty < 2) {
		return 'tube';
	} else if (this.difficulty < 4) {
		return ['tube', 'dice'];
	} else if (this.difficulty < 6) {
		return 'dice';
	} else if (this.difficulty < 8) {
		return ['dice', 'number'];
	} else {
		return 'number';
	}
};

PartyBalloonGame.prototype.setRepresentation = function (reps) {
	reps = Array.isArray(reps) ? reps : [reps];
	var x = this.pos.thoughtOffset - (reps.length - 1) * 50;
	var t = new TimelineMax();

	for (var i = 0; i < this.representations.length; i++) {
		this.representations.children[i].visible = false;
	}
	this.representations.divider.visible = reps.length > 1;

	for (i = 0; i < reps.length; i++) {
		var rep = this.representations[reps[i]];
		rep.x = x + i * 100;
		rep.visible = true;

		if (reps[i] === 'tube') {
			rep.x -= (rep.bottom.width * rep.scale.x) / 2;
			rep.reset();
			rep.setupMarkers(this.pump.getMax());
			t.add(rep.setVolume(this.correctAmount));
		} else if (reps[i] === 'dice') {
			rep.x -= rep.width / 2;
			rep.number = this.correctAmount;
		} else if (reps[i] === 'number') {
			rep.text = this.correctAmount;
		}
	}

	return t;
};

PartyBalloonGame.prototype.newBalloon = function () {
	var pos = this.pump.getBalloonPosition();
	this.balloon = this.gameGroup.create(pos.x, pos.y, 'partyBalloon', 'b' + this.game.rnd.integerInRange(1, 5));
	var startScale = this.pos.balloonHeight / this.balloon.height;
	this.balloon.anchor.set(0.5, 1);
	this.balloon.scale.set(0);
	this.balloon.update = function () {
		this.scale.x = this.scale.y;
	};

	this.balloon.events.onInputDown.add(this.moveBalloon, this);
	this.balloon.events.onInputUp.add(this.dropBalloon, this);

	return util.popin(this.balloon, true, 0.2, startScale);
};

PartyBalloonGame.prototype.newRound = function () {
	var rep = this.generateRound();
	this.pump.bottom.inputEnabled = true;

	var t = new TimelineMax();
	t.add(this.pump.setVolume(0));
	t.addCallback(this.setRepresentation, null, [rep], this);
	t.addLabel('think');
	t.add(util.fade(this.thoughtGroup, true, 1), 'think');
	t.addSound(this.helper1.speech, this.helper1, 'push' + this.correctAmount, 'think');
	t.add(this.newBalloon());
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.trolling = function (chance) {
	var t = new TimelineMax();

	if (this.rnd.integerInRange(1, 100) <= chance) {
		t.add(this.troll.appear(this.balloon.x, this.balloon.y));

		var delay = t.totalDuration();
		var nr = this.game.rnd.between(1, 100);
		if (nr <= 40 && this.correctAmount > 1) {
			// Not enough air.
			t.add(this.pressPump(this.rnd.integerInRange(1, this.correctAmount - 1)));
			delay += 1.5;

		} else if (nr <= 80) {
			// Too much air.
			t.add(this.pressPump(10));
			delay += 1.5;

		} else {
			// Swap balloon graphics.
			t.addCallback(function () {
				var name;
				do {
					name = this.rnd.pick(balloonFrames);
				} while (name === this.balloon.frameName);
				this.balloon.frameName = name;
			}, null, null, this);
			t.addCallback(this.disable, null, [false], this);
		}

		t.addSound(this.troll.speech, this, 'oops' + this.rnd.integerInRange(1, 2), delay);

	} else {
		// In case no trolling. Do not do this always, since pressPump will do it.
		t.addCallback(this.disable, null, [false], this);
	}

	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Round functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.pressPump = function (amount) {
	var value = this.pump.value + (typeof amount === 'number' ? amount : 1);
	// Calculate height for the balloon.
	var height = value <= this.pump.getMax() ?
		(this.pos.balloonHeight + this.pump.partHeight * value) :
		(marksHeight * 1.5);
	var marks = this.pump.setVolume(value);

	if (this.pumping) {
		this.pumping.kill();
	}

	this.pumping = new TimelineMax();
	this.pumping.addCallback(this.helper1.eyesFollowObject, null, [this.pump.handle], this.helper1);

	// Pump down.
	this.pumping.addLabel('pump');
	this.pumping.addLabel('up', '+=2');
	this.pumping.to(this.pump.pumpGroup, 2, { y: this.pump.bottom.y - this.pump.handle.height });
	this.pumping.to(this.balloon, 2 + marks.totalDuration(), { height: height, ease: Power1.easeIn }, 'pump');

	// Pump up.
	this.pumping.addCallback(this.disable, 'up', [true], this);
	this.pumping.to(this.pump.pumpGroup, 1, { y: 0 }, 'up');
	this.pumping.add(marks, 'up');
	if (this.pump.value > this.correctAmount) {
		this.pumping.add(this.popBalloon());
	}

	this.pumping.addCallback(this.checkAnswer, null, null, this);

	// Add an animation so the user can see that it has clicked.
	this.pumping.add(this.pump.tinter(this.pump.colourClick), 0);
	this.pumping.add(this.pump.tinter(this.pump.colour), 0.2);

	return this.pumping;
};

PartyBalloonGame.prototype.popBalloon = function () {
	this.explosion.scale.set(0);

	var t = new TimelineMax();
	t.addCallback(this.balloon.destroy, null, null, this.balloon);
	t.addLabel('popper');
	t.addSound(this.sfx, null, 'pop', 'popper');
	t.add(util.fade(this.explosion, true, 0.1), 'popper');
	t.to(this.explosion.scale, 0.2, { x: 1.5, y: 1.5 }, 'popper');
	t.add(util.fade(this.explosion, false, 0.05));
	return t;
};

PartyBalloonGame.prototype.checkAnswer = function () {
	var t = new TimelineMax();
	t.addCallback(this.helper1.eyesStopFollow, null, null, this.helper1);
	if (this.pump.value >= this.correctAmount) {
		t.add(util.fade(this.thoughtGroup, false, 1), 0);
	}

	if (this.pump.value === this.correctAmount) {
		this.pump.bottom.inputEnabled = false;
		this.balloon.inputEnabled = true;

		t.addSound(this.helper1.speech, this.helper1, 'wasGood', 0);

		if (!this.balloonStack.length) {
			t.add(this.helper2.move({ x: this.pos.stack.x + this.pos.atStack, ease: Power0.easeNone}, 2.5));
			t.addSound(this.helper2.speech, this.helper2, 'hi');
			t.addCallback(function () {}, '+=1');
		}
		t.addLabel('dragBalloon');
		t.addSound(this.helper1.speech, this.helper1, 'dragBalloon');

	} else if (this.pump.value < this.correctAmount) {
		t.addSound(this.helper1.speech, this.helper1, 'moreAir');

	} else { // More than correct amount.
		t.addSound(this.helper1.speech, this.helper1, 'tooMuchAir');
		t.addSound(this.helper1.speech, this.helper1, 'newBalloon', '+=0.6');
		t.add(this.newRound());
	}

	t.addCallback(this.disable, 'dragBalloon', [false], this); // Label is added in correct case only, if it does not exist the callback is added last.
};

PartyBalloonGame.prototype.moveBalloon = function () {
	this.balloon.update = function () {
		this.x = this.game.input.activePointer.x;
		this.y = this.game.input.activePointer.y;
	};

	if (!this.balloonStack.length) {
		TweenMax.to(this.helper2.leftArm, 0.5, { rotation: 0, ease: Power1.easeIn });
	}

	this.helper1.eyesFollowObject(this.balloon);
	this.helper2.eyesFollowObject(this.balloon);
};

PartyBalloonGame.prototype.dropBalloon = function () {
	this.disable(true);
	this.balloon.update = function () {};
	this.balloon.events.destroy();

	var group = this.add.group(this.gameGroup);
	group.add(this.balloon);
	var string = group.create(0, 0, 'partyBalloon', 'string');
	string.anchor.set(0.5, 1);

	var balloonScale = this.balloon.scale.x * 0.4;
	var angle = Math.ceil(this.balloonStack.length / 2) * 15;
	angle *= this.balloonStack.length % 2 ? -1 : 1;

	var t = new TimelineMax();
	t.addLabel('dropper');
	t.to(this.balloon, 0.5, { x: this.balloonStack.x, y: this.balloonStack.y, ease: Power1.easeIn }, 'dropper');
	t.to(this.balloon.scale, 0.5, { x: balloonScale, y: balloonScale, ease: Power1.easeIn }, 'dropper');
	t.addCallback(function () {
		this.balloon.x = 0;
		this.balloon.y = 0;
		this.balloonStack.add(group);
	}, null, null, this);

	t.addLabel('stringer');
	t.to(this.balloon, 1, { y: 5 - string.height }, 'stringer');
	t.fromTo(string.scale, 1, { y: 0 }, { y: 1 }, 'stringer');
	t.to(group, 1, { angle: angle }, 'stringer');
	t.addSound(this.helper2.speech, this.helper2, 'thanks', 'stringer');

	t.addCallback(function () {
		this.helper1.eyesStopFollow();
		this.helper2.eyesStopFollow();

		this.nextRound();
	}, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.skippable();

	t.add(this.helper2.wave(2, -1));
	t.addSound(this.helper2.speech, this.helper2, 'hi', 0);
	t.addSound(this.helper2.speech, this.helper2, 'niceComeBack', '+=0.3');
	t.addSound(this.helper2.speech, this.helper2, 'helpUsAgain', '+=0.3');

	t.addSound(this.helper1.speech, this.helper1, 'haveToBalloons', '+=0.8');

	t.addLabel('maker', '+=0.2');
	t.add(this.helper1.move({ x: this.world.width * 0.2, y: this.world.height * 0.6 }, 2), 'maker');
	t.addSound(this.helper1.speech, this.helper1, 'makeBalloons', 'maker');
	t.to(this.gladeIntro, 2.5, { y: -900, ease: Power2.easeInOut }, 'maker');
	t.to(this.gladeIntro.scale, 2.5, { x: 3, y: 3, ease: Power2.easeInOut }, 'maker');

	t.add(util.fade(this.gladeIntro, false, 2));

	t.addCallback(function () {
		this.gladeIntro.x = 0;
		this.gladeIntro.y = 0;
		this.gladeIntro.scale.set(1);

		this.helper1.scale.set(0.2);
		this.helper1.x = -300;
		this.helper1.y = 500;
		this.gameGroup.add(this.helper1);

		this.helper2.scale.set(0.18);
		this.helper2.x = this.world.width + this.helper2.width;
		this.helper2.y = 480;
		this.gameGroup.add(this.helper2);

		this.gameGroup.bringToTop(this.balloonStack);
		this.gameGroup.bringToTop(this.explosion);

		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);

	t.add(this.helper1.move({ x: 200, ease: Power0.easeNone }, 2));
	t.addSound(this.helper1.speech, this.helper1, 'herePump');
	t.addCallback(this.nextRound, null, null, this);
};

PartyBalloonGame.prototype.modePlayerDo = function (intro) {
	var t = new TimelineMax();

	if (intro) {
		t.addSound(this.helper1.speech, this.helper1, 'helpMePump', '+=0.5');
		t.addCallback(function () {}, '+=0.5');
		t.add(this.newRound());
		t.addCallback(this.disable, null, [false], this);

		var arrow =  this.gameGroup.create(this.pump.x + this.pump.bottom.width + 100, this.pump.y + this.pump.height - this.pump.bottom.height / 2, 'objects', 'arrow');
		arrow.tint = 0xf0f000;
		arrow.visible = false;
		arrow.anchor.set(0, 0.5);
		t.add(util.fade(arrow, true, 0.2));
		t.to(arrow, 1, { x: '-=100', ease: Power1.easeInOut,  repeat: 4, yoyo: true });
		t.addCallback(arrow.destroy, null, null, arrow);

	} else {
		t.addSound(this.helper1.speech, this.helper1, 'anotherBalloon', 0);
		t.add(this.newRound());
		t.addCallback(this.trolling, null, [trollChance], this);
		// Trolling function will do enabling.
	}
};

PartyBalloonGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.helper1.speech, this.helper1, 'manyNiceBalloons');

	t.addLabel('walk');
	t.add(this.helper2.move({ x: '-=260', y: '+=175', ease: Power0.easeNone }, 3), 'walk');
	t.to(this.balloonStack, 3, { x: '-=270', y: '+=175', ease: Power0.easeNone }, 'walk');
	t.to(this.helper2.scale, 3, { x: 0.21, y: 0.21, ease: Power1.easeIn }, 'walk');
	t.to(this.balloonStack.scale, 3, { x: 1.5, y: 1.5, ease: Power1.easeIn }, 'walk');

	t.addSound(this.helper1.speech, this.helper1, 'goPutThemUp', '+=0.5');

	t.addLabel('leave');
	t.add(this.helper1.move({ x: -500, ease: Power0.easeNone }, 3), 'leave');
	t.add(this.helper2.move({ x: '-=900', ease: Power0.easeNone }, 4), 'leave');
	t.to(this.balloonStack, 4, { x: '-=900', ease: Power0.easeNone }, 'leave');

	t.add(this.troll.water(800, this));

	t.addCallback(function () {
		this.afterBalloons();
		this.gameGroup.bringToTop(this.gladeIntro);

		this.helper1.x = 580;
		this.helper1.y = 570;
		this.helper1.scale.set(0.15);
		this.gladeIntro.add(this.helper1);

		this.troll.x = this.world.width * 0.2;
		this.troll.y = this.world.height * 0.6;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);
	}, null, null, this);
	t.add(util.fade(this.gladeIntro, true, 2));

	t.addLabel('good');
	t.add(this.troll.move({ x: 370, y: 540 }, 2), 'good');
	t.addSound(this.troll.speech, this.troll, 'isGood', 'good');

	t.addSound(this.troll.speech, this.troll, 'continue');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');

	t.addCallback(this.nextRound, null, null, this); // Ending game.
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Pump object                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
var marksHeight = 200;
var offset = 18;

Pump.prototype = Object.create(Phaser.Group.prototype);
Pump.prototype.constructor = Pump;
function Pump (game, x, y, max) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;
	this.partHeight = 0;

	this.colour = 0x000099;
	this.colourVolume = 0x000077;
	this.colourClick = 0x0055ff;
	this.colourTooFull = 0x880000;

	this.pumpGroup = this.game.add.group(this);

	this.handle = this.pumpGroup.create(0, 0, 'partyBalloon', 'handle');

	var bmd = this.game.add.bitmapData(this.handle.width - offset * 2, 1);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.fill();
	var back = this.pumpGroup.create(offset, this.handle.height, bmd);
	back.alpha = 0.4;
	back.tint = this.colourClick;
	back.height = marksHeight;

	this.volume = this.pumpGroup.create(offset, this.handle.height + marksHeight, bmd);
	this.volume.alpha = 0.8;
	this.volume.anchor.set(0, 1);

	this.markGroup = this.game.add.group(this.pumpGroup);
	this.markGroup.x = offset;
	this.markGroup.y = this.handle.height;

	bmd = this.game.add.bitmapData(7, marksHeight);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.fill();
	this.leftSide = this.pumpGroup.create(offset, this.markGroup.y, bmd);
	this.leftSide.tint = this.colour;
	this.rightSide = this.pumpGroup.create(this.handle.width - offset, this.markGroup.y, bmd);
	this.rightSide.anchor.set(1, 0);
	this.rightSide.tint = this.colour;

	bmd = this.game.add.bitmapData(this.handle.width - offset * 2, 5);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.fill();
	var top = this.pumpGroup.create(offset, this.markGroup.y, bmd);
	top.tint = this.colour;
	var bottom = this.pumpGroup.create(offset, this.pumpGroup.height, bmd);
	bottom.anchor.set(0, 1);
	bottom.tint = this.colour;

	this.setupMarkers(max);

	bmd = this.game.add.bitmapData(this.handle.width, 100);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.fill();
	this.bottom = this.create(0, this.pumpGroup.height, bmd);
	this.bottom.tint = this.colour;

	this.tube = this.create(0, this.bottom.y + this.bottom.height, 'partyBalloon', 'pump_up');
	this.tube.anchor.set(1);

	this.reset();

	return this;
}

Pump.prototype.getMax = function () {
	return this.markGroup.length + 1;
};

Pump.prototype.getBalloonPosition = function () {
	return { x: this.tube.world.x - this.tube.width * 0.92, y: this.tube.world.y - this.tube.height + 5 };
};

Pump.prototype.setupMarkers = function (amount) {
	this.markGroup.removeAll();

	var bmd = this.game.add.bitmapData(this.rightSide.x - this.leftSide.x, 5);
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	bmd.ctx.fillStyle = '#000000';
	bmd.ctx.fill();

	this.partHeight = marksHeight / amount;
	for (var i = 1; i < amount; i++) {
		var mark = this.markGroup.create(0, marksHeight - this.partHeight * i, bmd);
		mark.anchor.set(0, 0.5);
	}
};

Pump.prototype.reset = function () {
	this.value = 0;
	this.volume.height = 0;
	this.volume.tint = this.colourVolume;
};

Pump.prototype.tinter = function (colour, duration) {
	return util.tweenTint(this.bottom, colour, duration || 0.2);
};

Pump.prototype.setVolume = function (amount) {
	var diff = amount - this.value;
	this.value = amount;
	var height = this.value * this.partHeight;

	var t = new TimelineMax();
	if (height > marksHeight) {
		t.to(this.volume, diff >= 0 ? 1 : 0.5, { height: marksHeight });
		t.add(util.tweenTint(this.volume, this.colourTooFull, 1));
	} else {
		t.to(this.volume, diff >= 0 ? 1 : 0.5, { height: height });
		if (this.volume.tint !== this.colourVolume) {
			t.add(util.tweenTint(this.volume, this.colourVolume, 1), 0);
		}
	}

	return t;
};

Pump.prototype.onlyMarkers = function () {
	for (var i = 0; i < this.length; i++) {
		this.children[i].visible = false;
	}
	this.pumpGroup.visible = true;
	this.handle.visible = false;
	this.markGroup.visible = true;
};
