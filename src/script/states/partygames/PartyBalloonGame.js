var PartyGame = require('./PartyGame.js');
var GLOBAL = require('../../global.js');
var Hedgehog = require('../../characters/agents/Hedgehog.js');
var Panda = require('../../characters/agents/Panda.js');
var DiceRepresentation = require('../../objects/representations/DiceRepresentation.js');

module.exports = PartyBalloonGame;

PartyBalloonGame.prototype = Object.create(PartyGame.prototype);
PartyBalloonGame.prototype.constructor = PartyBalloonGame;

function PartyBalloonGame () {
	PartyGame.call(this); // Call parent constructor.
}

PartyBalloonGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('partyBalloon', 'img/partygames/balloonGame/atlas.png', 'img/partygames/balloonGame/atlas.json');
};

PartyBalloonGame.prototype.create = function () {
	PartyGame.prototype.create.call(this);
	// The balloon game uses helper1, it should be Mouse or Hedgehog as backup.
	if (this.birthday instanceof Hedgehog) {
		this.changeAgents();
	}
	this.afterInvitations();
	this.afterGarlands();

	this.gameGroup.create(0, 0, 'partyBalloon', 'background1');
	this.bgUnder = this.gameGroup.create(0, 650, 'partyBalloon', 'background2');

	this.thoughtBubble = this.gameGroup.create(340, 210, 'partyBalloon', 'thought_bubble');
	this.thoughtBubble.scale.set(- 1.2, 1.2);
	this.thoughtBubble.anchor.set(0.5);
	this.thoughtBubble.alpha = 0;
	this.thoughtBubble.angle = -15;

	var l = this.add.bitmapData(3, 150);
	l.ctx.beginPath();
	l.ctx.rect(0,0,l.width,l.height);
	l.ctx.fillStyle = '#bdbdbd';
	l.ctx.fill();
	this.line = this.add.sprite(this.thoughtBubble.x + 10, this.thoughtBubble.y - 10, l);
	this.line.anchor.set(0.5);
	this.line.alpha = 0;
	this.gameGroup.add(this.line);

	this.inputs = 0;
	this.inputsTint = 0;
	this.inputsBalloon = 0;

	this.poppedBallons = 0;
	this.poppedBalloonsLeft = 0;

	this.trollNr = 50;

	this.finishedRounds = 0;

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
	this.emitter.setAlpha(1, 0, 3000);
	this.emitter.makeParticles(this.troll.id, 'star');

	this.createStack();
	this.generateRound();
	this.createTube();
	this.createPump();

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Change difficulty functions                        */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Change level of difficulty, amount
PartyBalloonGame.prototype.getAmount = function (max) {
	return this.game.rnd.between(1, max);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.generateRound = function () {
	var amount;
	var rep;
	var h;

	if (this.difficulty <= 1) {
		amount = this.getAmount(4);
		rep = 'tube';
		h = 4;
	} else if (this.difficulty <= 2) {
		amount = this.getAmount(4);
		rep = 'tube';
		h = 4;
	} else if (this.difficulty <= 3) {
		amount = this.getAmount(4);
		rep = 'tubedice';
		h = 4;
	} else if (this.difficulty <= 4) {
		amount = this.getAmount(4);
		rep = 'tubedice';
		h = 4;
	} else if (this.difficulty <= 5) {
		amount = this.getAmount(4);
		rep = 'dice';
		h = 4;
	} else if (this.difficulty <= 6) {
		amount = this.getAmount(5);
		rep = 'dice';
		h = 5;
	} else if (this.difficulty <= 7) {
		amount = this.getAmount(6);
		rep = 'dicenumber';
		h = 6;
	} else if (this.difficulty <= 8) {
		amount = this.getAmount(7);
		rep = 'dicenumber';
		h = 7;
	} else if (this.difficulty <= 9) {
		amount = this.getAmount(8);
		rep = 'number';
		h = 8;
	} else if (this.difficulty <= 10) {
		amount = this.getAmount(9);
		rep = 'number';
		h = 9;
	}

	this.correctAmount = amount;

	this.rep = rep;

	this.h = h;
	this.partHeight = 200 / h;
	this.bScale = 1 / h;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Create round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.createColour = function () {
	var col = this.add.bitmapData(40, 1);

	col.ctx.beginPath();
	col.ctx.rect(0,0,col.width,col.height);
	col.ctx.fillStyle = '#0d00a2';
	col.ctx.fill();

	this.col = this.add.sprite(530, 558, col);
	this.col.anchor.set(0.5, 1);
	this.gameGroup.add(this.col);
	this.col.alpha = 0;

	this.colR = this.add.sprite(340, 270, col);
	this.colR.anchor.set(0.5, 1);
	this.colR.width = 30;
	this.gameGroup.add(this.colR);
	this.colR.alpha = 0;
};

PartyBalloonGame.prototype.createRepresentation = function () {
	this.thoughtGroup = this.add.group(this.gameGroup);
	this.thoughtGroup.x = 340;
	this.thoughtGroup.y = 270;

	var i, p, part, d, diceBg;

	var t = new TimelineMax();

	if (this.rep === 'tube') {
		for (i = 0; i < this.correctAmount; i++) {
			p = this.thoughtGroup.create(0, 0, 'partyBalloon', 'part');
			p.anchor.set(0.5, 1);
			p.height = 120 / this.h;
			p.width = 30;
		}

		for (i = 1; i < this.thoughtGroup.children.length; i++) {
			part = this.thoughtGroup.children[i];
			part.y = this.thoughtGroup.children[i - 1].y - (this.thoughtGroup.children[i].height - 3);
		}

		t.add(new TweenMax(this.colR, 0.1, {alpha:0.6}));
		t.to(this.colR, 1, {height: (this.thoughtGroup.children[0].height - 3) * this.correctAmount, ease: Power1.easeIn});

	} else if (this.rep === 'tubedice') {
		for (i = 0; i < this.correctAmount; i++) {
			p = this.thoughtGroup.create(-30, 0, 'partyBalloon', 'part');
			p.anchor.set(0.5, 1);
			p.height = 120 / this.h;
			p.width = 30;
		}

		for (i = 1; i < this.thoughtGroup.children.length; i++) {
			part = this.thoughtGroup.children[i];
			part.y = this.thoughtGroup.children[i - 1].y - (this.thoughtGroup.children[i].height - 3);
		}

		this.colR.x = 230;

		this.line.alpha = 1;
		this.gameGroup.bringToTop(this.line);

		d = this.add.bitmapData(60, 60);
		d.ctx.beginPath();
		d.ctx.rect(0,0,d.width,d.height);
		d.ctx.fillStyle = '#ff0000';
		d.ctx.fill();

		diceBg = this.add.sprite(65, -70, d);
		diceBg.anchor.set(0.5);
		this.thoughtGroup.add(diceBg);

		this.dice = new DiceRepresentation(this.game, this.correctAmount, 65, -70, 40, '#000000');
		this.thoughtGroup.add(this.dice);
		this.dice.anchor.set(0.5);

		t.add(new TweenMax(this.colR, 0.1, {alpha:0.6}));
		t.to(this.colR, 1, {height: (this.thoughtGroup.children[0].height - 3) * this.correctAmount, ease: Power1.easeIn});

	} else if (this.rep === 'dice') {
		d = this.add.bitmapData(60, 60);
		d.ctx.beginPath();
		d.ctx.rect(0,0,d.width,d.height);
		d.ctx.fillStyle = '#ff0000';
		d.ctx.fill();

		diceBg = this.add.sprite(10, -70, d);
		diceBg.anchor.set(0.5);
		this.thoughtGroup.add(diceBg);

		this.dice = new DiceRepresentation(this.game, this.correctAmount, 10, -70, 40, '#000000');
		this.thoughtGroup.add(this.dice);
		this.dice.anchor.set(0.5);

	} else if (this.rep === 'dicenumber') {
		this.nr = this.game.add.text(-30, -65, this.correctAmount, { font: '40pt ' + GLOBAL.FONT });
		this.nr.anchor.set(0.5);
		this.thoughtGroup.add(this.nr);

		this.line.alpha = 1;
		this.gameGroup.bringToTop(this.line);

		d = this.add.bitmapData(60, 60);
		d.ctx.beginPath();
		d.ctx.rect(0,0,d.width,d.height);
		d.ctx.fillStyle = '#ff0000';
		d.ctx.fill();

		diceBg = this.add.sprite(65, -70, d);
		diceBg.anchor.set(0.5);
		this.thoughtGroup.add(diceBg);

		this.dice = new DiceRepresentation(this.game, this.correctAmount, 65, -70, 40, '#000000');
		this.thoughtGroup.add(this.dice);
		this.dice.anchor.set(0.5);

	} else if (this.rep === 'number') {
		this.nr = this.game.add.text(0, -65, this.correctAmount, { font: '40pt ' + GLOBAL.FONT });
		this.nr.anchor.set(0.5);
		this.thoughtGroup.add(this.nr);
	}

	var mark = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
	t.addSound(this.helper1.speech, this.helper1, 'push' + mark[this.correctAmount - 1]);

	if (this.finishedRounds > 0 && this.trollNr > 40 ||( this.finishedRounds === 0 && this.poppedBallons > 0)) {
		t.addCallback(this.disable, null, [false], this);
	}

	this.pump.events.onInputDown.add(this.pressPump, this);
};

PartyBalloonGame.prototype.createPump = function () {
	var tubePos = 554 + (200 * this.bScale);

	this.handlePos = 557 - this.tubeGroup.height;

	if (!this.tubeUp || !this.pump || !this.handle) {
		this.tubeUp = this.gameGroup.create(377, tubePos, 'partyBalloon', 'pump_up');
		this.pump = this.gameGroup.create(530, 554, 'partyBalloon', 'pump');
		this.handle = this.gameGroup.create(530, this.handlePos, 'partyBalloon', 'handle');
	}

	this.handle.anchor.set(0.5, 1);
	this.handle.scale.set(1.2);

	this.tubeUp.scale.set(0.8);

	this.pump.anchor.set(0.5, 0);
	this.pump.scale.set(0.8);
	this.pump.height = 100;
	this.pump.width = 80;
	this.pump.inputEnabled = true;

	this.pump.events.onInputDown.add(this.pressPump, this);

	this.gameGroup.bringToTop(this.bgUnder);
	this.gameGroup.bringToTop(this.tubeUp);
};

PartyBalloonGame.prototype.createTube = function () {
	if (!this.tubeGroup) {
		this.tubeGroup = this.add.group(this.gameGroup);
		this.tubeGroup.x = 530;
		this.tubeGroup.y = 557;
	}

	var i;
	for (i = this.tubeGroup.length; i < this.h; i++) {
		var p = this.tubeGroup.create(0, 0, 'partyBalloon', 'part');
		p.scale.set(0.8);
		p.anchor.set(0.5, 1);
		p.height = this.partHeight;
	}

	for (i = 1; i < this.tubeGroup.children.length; i++) {
		var part = this.tubeGroup.children[i];
		part.y = this.tubeGroup.children[i - 1].y - (this.tubeGroup.children[i].height - 3);
	}
};

PartyBalloonGame.prototype.createBalloon = function () {
	var name = 'b' + this.game.rnd.integerInRange(1, 5);
	this.balloon = this.gameGroup.create(0, 0, 'partyBalloon', name);
	this.balloon.anchor.set(0.5, 1);
	this.balloon.x = this.tubeUp.x + 8;
	this.balloon.y = this.tubeUp.y + 5;
	this.balloon.scale.set(this.bScale);
	this.balloon.alpha = 0;
	this.gameGroup.bringToTop(this.balloon);
};

PartyBalloonGame.prototype.createStack = function () {
	this.stackGroup = this.add.group(this.gameGroup);
	this.stackGroup.x = 710;
	this.stackGroup.y = 470;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Round functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.addArrow = function () {
	if (!this.arrow) {
		this.arrow = this.gameGroup.create(660, 610, 'partyBalloon', 'arrow');
		this.arrow.scale.set(0.5);
		this.arrow.alpha = 0;
		this.arrow.anchor.set(0.5, 1);
		this.arrow.angle = 270;
	}

	this.arrow.scale.set(0.5);

	this.gameGroup.bringToTop(this.arrow);


	var t = new TimelineMax();
	t.addLabel('in');
	t.add(new TweenMax(this.arrow, 1, {alpha:1}));
	t.add(new TweenMax(this.arrow.scale, 0.6, {x: 0.6, y: 0.6, ease: Power0.easeNone}), 'in+=0.5');
	t.add(new TweenMax(this.arrow.scale, 0.6, {x: 0.5, y: 0.5, ease: Power0.easeNone}));
	t.add(new TweenMax(this.arrow.scale, 0.6, {x: 0.6, y: 0.6, ease: Power0.easeNone}));

	t.addCallback(this.disable, '+=0.2', [false], this);
	return t;
};

PartyBalloonGame.prototype.pressPump = function () {
	this.helper1.eyesFollowObject(this.tubeGroup);

	this.inputs = this.inputs + 1;
	this.inputsTint = this.inputsTint + 1;
	this.inputsBalloon = this.inputsBalloon + 1;

	if (this.pumping) {
		this.pumping.kill();
	}

	this.pumping = new TimelineMax();
	this.pumping.add(new TweenMax(this.col, 0.1, {alpha:0.6}));

	if (this.inputsBalloon <= this.correctAmount) {
		this.pumping.addLabel('pump');
		this.pumping.add(this.inflateBalloon(), 'pump');
		this.pumping.add(this.pumpDown(), 'pump');

		this.pumping.addLabel('colour');
		this.pumping.add(this.pumpUp());
		this.pumping.to(this.col, 1, {height: (this.tubeGroup.children[0].height - 3) * this.inputsTint, ease: Power1.easeIn}, 'colour');

		if (this.arrow) {
			this.pumping.add(new TweenMax(this.arrow, 1, {alpha:0}));
		}

		this.pumping.add(this.checkAnswer());

		if (this.finishedRounds === 0 && this.inputsBalloon !== this.correctAmount) {
			this.pumping.addCallback(this.addArrow, '+=1', null, this);
			this.pumping.addCallback(this.disable, null, [true], this);
		}

	} else if (this.inputsBalloon > this.correctAmount) {
		this.pumping.addLabel('pump');
		this.pumping.add(this.inflateBalloon(), 'pump');
		this.pumping.add(this.pumpDown(), 'pump');
		this.pumping.add(this.popBalloon());
	}
};

PartyBalloonGame.prototype.inflateBalloon = function () {
	this.gameGroup.bringToTop(this.balloon);

	var t = new TimelineMax();
	t.add(new TweenMax(this.balloon.scale, 1, {x: this.bScale + (this.bScale * this.inputsBalloon), y: this.bScale + (this.bScale * this.inputsBalloon), ease: Power1.easeIn}));
	return t;
};

PartyBalloonGame.prototype.pumpDown = function () {
	if (this.inputsTint > this.tubeGroup.length) {
		this.colHeight = this.tubeGroup.children[0].height * this.tubeGroup.length;
	} else {
		this.colHeight = this.tubeGroup.children[0].height * this.inputs;
	}

	var t = new TimelineMax();
	t.to(this.tubeGroup, 1, {y: 557 + this.colHeight, ease: Power1.easeIn}, 0);
	t.to(this.col, 1, {y: 558 + this.colHeight, ease: Power1.easeIn}, 0);
	t.to(this.handle, 1, {y: this.handlePos + this.colHeight, ease: Power1.easeIn}, 0);
	return t;
};

PartyBalloonGame.prototype.pumpUp = function () {
	var t = new TimelineMax();
	t.addCallback(this.disable, null, [true], this);

	t.to(this.tubeGroup, 1, {y: 557, ease: Power1.easeIn}, 0);
	t.to(this.col, 1, {y: 558, ease: Power1.easeIn}, 0);
	t.to(this.handle, 1, {y: this.handlePos, ease: Power1.easeIn}, 0);

	t.addCallback(function () {
		this.helper1.eyesStopFollow();
	}, null, null, this);

	t.addCallback(function () {
		this.inputs = 0;
		if (this.poppedBallons === 0) {
			this.disable(false);
		}
	}, '+=0.2', null, this);

	return t;
};

PartyBalloonGame.prototype.checkAnswer = function () {
	var t = new TimelineMax();

	if (this.inputsBalloon === this.correctAmount) {
		t.addCallback(function () {
			this.disable(true);
			this.pump.events.destroy();
		}, null, null, this);

		if (this.arrow) {
			t.add(new TweenMax(this.arrow, 1, {alpha:0}));
		}

		if (this.finishedRounds > 0) {
			this.balloon.inputEnabled = true;
			this.balloon.events.onInputDown.add(this.moveBalloon, this);
			this.disable(false);
		}

		t.addSound(this.helper1.speech, this.helper1, 'wasGood', 0);

		if (this.finishedRounds === 0) {
			if (this.agent instanceof Panda) {
				t.add(this.helper2.move({ x:800, ease: Power0.easeNone}, 2.5));
				t.addSound(this.helper2.speech, this.helper2, 'hi');
			} else {
				t.add(this.helper2.move({ x:790, ease: Power0.easeNone}, 2.5));
				t.addSound(this.helper2.speech, this.helper2, 'hi');
			}
		}

		t.addSound(this.helper1.speech, this.helper1, 'dragBalloon');

		t.addCallback(function () {
			this.balloon.inputEnabled = true;
			this.balloon.events.onInputDown.add(this.moveBalloon, this);
			this.disable(false);
		}, null, null, this);

	} else if (this.inputsBalloon < this.correctAmount) {
		t.addCallback(this.disable, null, [false], this);
		t.addSound(this.helper1.speech, this.helper1, 'moreAir');
	}

	return t;
};

PartyBalloonGame.prototype.popBalloon = function () {
	var explosion = this.gameGroup.create(this.balloon.x, this.balloon.y, 'partyBalloon', 'explosion');
	explosion.alpha = 0;
	explosion.scale.set(0.005);
	explosion.anchor.set(0.5);

	if (this.inputsTint > this.tubeGroup.length) {
		this.colHeight = (this.tubeGroup.children[0].height - 3) * this.tubeGroup.length;
	} else {
		this.colHeight = (this.tubeGroup.children[0].height - 3) * this.inputsTint;
	}

	var t = new TimelineMax();
	t.addCallback(this.disable, null, [true], this);
	t.addCallback(function () {
		this.poppedBallons = this.poppedBallons + 1;
		this.poppedBalloonsLeft = this.poppedBalloonsLeft + 1;
	}, null, null, this);

	t.addCallback(this.balloon.destroy, null, null, this.balloon);

	t.addLabel('colour');
	t.addSound(this.sfx, null, 'pop', 'colour');
	t.add(new TweenMax(explosion, 0.1, {alpha:1}), 'colour');
	t.to(explosion.scale, 0.05, {x: 1.5, y: 1.5, ease: Power1.easeIn}, 'colour');
	t.addCallback(explosion.destroy, null, null, explosion);

	t.add(this.pumpUp());
	t.to(this.col, 1, {height: this.colHeight, ease: Power1.easeIn}, 'colour');

	if (this.arrow) {
		t.add(new TweenMax(this.arrow, 1, {alpha:0}), 'colour');
	}

	t.addLabel('fade', '+=1');
	t.to(this.col, 1.5, {height: 1, ease: Power1.easeIn}, 'fade');
	t.add(new TweenMax(this.thoughtBubble, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.thoughtGroup, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.line, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.colR, 1.5, {alpha:0}), 'fade');

	t.add(new TweenMax(this.col, 0.5, {alpha:0}));

	t.addSound(this.helper1.speech, this.helper1, 'tooMuchAir', 'fade');
	t.addSound(this.helper1.speech, this.helper1, 'newBalloon', '+=0.6');

	t.add(this.destroyRound());
	t.addCallback(this.modePlayerDo, '+=1.5', null, this); // TODO: Not a very pretty solution, but works.

	return t;
};

PartyBalloonGame.prototype.moveBalloon = function (origin) {
	origin.events.onInputUp.add(this.dropBalloon, this);

	this.helper1.eyesFollowObject(this.balloon);
	this.helper2.eyesFollowObject(this.balloon);

	this.balloon.update = function () {
		this.x = this.game.input.activePointer.x;
		this.y = this.game.input.activePointer.y;
	};

	var t = new TimelineMax();
	if (this.finishedRounds === 0) {
		t.add(new TweenMax(this.helper2.leftArm, 0.5, { rotation: 0, ease: Power1.easeIn }));
	}
};

PartyBalloonGame.prototype.dropBalloon = function () {
	this.helper1.eyesStopFollow();
	this.helper2.eyesStopFollow();

	this.poppedBalloonsLeft = 0;

	this.balloon.update = function () {};

	var balloonScale = (0.8 / this.tubeGroup.length) * this.correctAmount;

	var t = new TimelineMax();
	t.addCallback(this.disable, null, [true], this);

	t.addLabel('drop');
	t.to(this.balloon, 0.5, {x: '+=' + (this.stackGroup.x - this.balloon.world.x), y: '+=' + (this.stackGroup.y - this.balloon.world.y - 80), ease: Power1.easeIn}, 'drop');
	t.add(new TweenMax(this.balloon.scale, 0.5, {x: balloonScale, y: balloonScale, ease: Power1.easeIn}), 'drop');

	t.addCallback(function () {
		this.finishedRounds = this.finishedRounds + 1;

		this.balloonGroup = this.add.group(this.stackGroup);
		this.balloonGroup.x = 0;
		this.balloonGroup.y = 0;
		this.balloonGroup.add(this.balloon);

		this.string = this.balloonGroup.create(0, 0, 'partyBalloon', 'string');
		this.string.anchor.set(0.5, 1);

		this.balloon.x = this.string.x;
		this.balloon.y = this.string.y - (this.string.height - 2);
		this.balloon.scale.set(balloonScale);
		this.balloon.events.destroy();

		if (this.stackGroup.length === 2) {
			this.balloonGroup.angle = 30;
		} else if (this.stackGroup.length === 3) {
			this.balloonGroup.angle = -30;
		} else if (this.stackGroup.length === 4) {
			this.balloonGroup.angle = 15;
		} else if (this.stackGroup.length === 5) {
			this.balloonGroup.angle = -15;
		}
	}, null, null, this);

	t.addSound(this.helper2.speech, this.helper2, 'thanks');

	t.addLabel('fade', '+=2');
	t.to(this.col, 1.5, {height: 1, ease: Power1.easeIn}, 'fade');
	t.add(new TweenMax(this.thoughtBubble, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.thoughtGroup, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.line, 1.5, {alpha:0}), 'fade');
	t.add(new TweenMax(this.colR, 1.5, {alpha:0}), 'fade');

	t.add(new TweenMax(this.col, 0.5, {alpha:0}));

	t.add(this.destroyRound());
	t.addCallback(this.nextRound, '+=1.5', null, this);
};

PartyBalloonGame.prototype.destroyRound = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.inputsTint = 0;
		this.inputsBalloon = 0;
		this.trollNr = 50;
		this.poppedBallons = 0;
	}, null, null, this);

	t.addCallback(this.col.destroy, null, null, this.col);
	t.addCallback(this.colR.destroy, null, null, this.colR);
	t.addCallback(this.thoughtGroup.destroy, null, null, this.thoughtGroup);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.trollStart = function () {
	var t = new TimelineMax();
	if (this.finishedRounds > 0 && this.trollNr <= 40) {
		this.disable(true);

		t.add(this.troll.appear('random', this.balloon.x, this.balloon.y));
		t.add(this.trollTypePercent());

		t.addSound(this.troll.speech, this, 'oops' + this.rnd.integerInRange(1, 2), '+=0.5');
		t.addSound(this.troll.speech, this, 'laugh', '+=0.5');
	}
};

PartyBalloonGame.prototype.trollTypePercent = function () {
	var t = new TimelineMax();
	var nr = this.game.rnd.between(1, 100);
	if (nr <= 60) {
		t.add(this.trollInflate());
	} else if (nr <= 90) {
		t.add(this.trollPop());
	} else if (nr > 85) {
		t.add(this.trollSwap());
	}
	return t;
};

PartyBalloonGame.prototype.trollInflate = function () {
	var t = new TimelineMax();

	if (this.correctAmount > 1) {
		t.addCallback(function () {
			var inputNr = this.game.rnd.between(1, this.correctAmount - 1);

			this.inputs = inputNr - 1;
			this.inputsTint = inputNr - 1;
			this.inputsBalloon = inputNr - 1;

			this.pressPump();
		}, null, null, this);
	} else {
		t.add(this.trollSwap());
	}

	return t;
};

PartyBalloonGame.prototype.trollPop = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.inputs = this.tubeGroup.length + 1;
		this.inputsTint = this.tubeGroup.length + 1;
		this.inputsBalloon = this.tubeGroup.length + 1;

		this.pressPump();
	}, null, null, this);
	return t;
};

PartyBalloonGame.prototype.trollSwap = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		if (this.balloon.frameName !== 'b2') {
			this.balloon.frameName = 'b2';
		} else if (this.balloon.frameName === 'b2') {
			this.balloon.frameName = 'b5';
		}
	}, null, null, this);
	t.addCallback(this.disable, '+=1', [false], this);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyBalloonGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.add(this.helper2.wave(2, -1));
	t.addSound(this.helper2.speech, this.helper2, 'hi', 0);
	t.addSound(this.helper2.speech, this.helper2, 'niceComeBack', '+=0.3');
	t.addSound(this.helper2.speech, this.helper2, 'helpUsAgain', '+=0.3');
	t.addSound(this.helper1.speech, this.helper1, 'haveToBalloons', '+=0.8');
	t.addSound(this.helper1.speech, this.helper1, 'makeBalloons', '+=0.2');
	t.add(new TweenMax(this.gladeIntro, 2, { alpha: 0 }), '+=3');

	t.addCallback(function () {
		this.helper1.scale.set(0.2);
		this.helper1.x = -300;
		this.helper1.y = 500;
		this.gameGroup.add(this.helper1);

		this.helper2.scale.set(0.18);
		this.helper2.x = 1300;
		this.helper2.y = 480;
		this.gameGroup.add(this.helper2);

		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);

	t.add(this.helper1.move({ x:200, ease: Power0.easeNone}, 2.5));
	t.addSound(this.helper1.speech, this.helper1, 'herePump', '+=0.5');
	t.addCallback(this.nextRound, '+=1', null, this);
};

PartyBalloonGame.prototype.modePlayerDo = function () {
	var t = new TimelineMax();

	if (this.finishedRounds < 5) {
		this.trollNr = this.game.rnd.between(1, 100);

		this.generateRound();
		this.createTube();
		this.createPump();
		this.createColour();
		this.createBalloon();

		this.gameGroup.bringToTop(this.tubeGroup);
		this.gameGroup.bringToTop(this.pump);
		this.gameGroup.bringToTop(this.bgUnder);
		this.gameGroup.bringToTop(this.tubeUp);
		this.gameGroup.bringToTop(this.balloon);

		if (this.finishedRounds > 0 && this.poppedBalloonsLeft === 0) {
			t.addSound(this.helper1.speech, this.helper1, 'anotherBalloon');
		}

		t.addSound(this.helper1.speech, this.helper1, 'helpMePump', '+=0.5');

		t.addLabel('fadeIn', '+=1');
		t.add(new TweenMax(this.thoughtBubble, 2, {alpha:1}), 'fadeIn');
		t.add(new TweenMax(this.balloon, 2, {alpha:1}), 'fadeIn');
		t.addCallback(this.createRepresentation, null, null, this);

		if (this.finishedRounds === 0) {
			t.addCallback(this.addArrow, '+=1', null, this);
		}

		t.addCallback(this.trollStart, '+=3', null, this);

	} else if (this.finishedRounds === 5) {
		t.addCallback(this.modeOutro, null, null, this);
	}
};

PartyBalloonGame.prototype.modeOutro = function () {
	var t = new TimelineMax();

	t.addSound(this.helper1.speech, this.helper1, 'manyNiceBalloons');

	t.addLabel('fade');
	t.add(new TweenMax(this.tubeUp, 1, {alpha:0}), 'fade');
	t.add(new TweenMax(this.handle, 1, {alpha:0}), 'fade');
	t.add(new TweenMax(this.pump, 1, {alpha:0}), 'fade');
	t.add(new TweenMax(this.tubeGroup, 1, {alpha:0}), 'fade');

	t.addLabel('walk');
	t.add(this.helper2.move({ x:'-=270', y:520, ease: Power0.easeNone}, 3), 'walk');
	t.to(this.stackGroup, 3, {x:430, y:510, ease: Power0.easeNone}, 'walk');
	t.add(new TweenMax(this.helper2.scale, 3, {x: 0.2, y: 0.2, ease: Power1.easeIn}), 'walk');
	t.add(new TweenMax(this.stackGroup.scale, 3, {x: 1.02, y: 1.02, ease: Power1.easeIn}), 'walk');

	t.addSound(this.helper1.speech, this.helper1, 'goPutThemUp', '+=0.5');

	t.addLabel('leave');
	t.add(this.helper1.move({ x:-500, ease: Power0.easeNone}, 3), 'leave');
	t.add(this.helper2.move({ x:'-=900', ease: Power0.easeNone}, 4), 'leave');
	t.to(this.stackGroup, 4, {x:'-=900', ease: Power0.easeNone}, 'leave');

	t.add(this.troll.water(800, this));

	t.add(this.afterBalloons());

	t.addCallback(function () {
		this.helper1.x = 370;
		this.helper1.y = 540;
		this.helper1.scale.set(0.15);
		this.gladeIntro.add(this.helper1);

		this.troll.x = 580;
		this.troll.y = 570;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);
	}, null, null, this);

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:1}));

	t.addSound(this.troll.speech, this.troll, 'isGood', '+=0.3');
	t.addSound(this.troll.speech, this.troll, 'continue', '+=0.5');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');
	t.addCallback(this.endGame, '+=3', null, this);
};
