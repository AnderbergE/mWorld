var PartyGame = require('./PartyGame.js');
var Panda = require('../../agent/Panda.js');
var GLOBAL = require('../../global.js');

module.exports = PartyGarlandGame;

PartyGarlandGame.prototype = Object.create(PartyGame.prototype);
PartyGarlandGame.prototype.constructor = PartyGarlandGame;

function PartyGarlandGame () {
	PartyGame.call(this); // Call parent constructor.
}

PartyGarlandGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('garland', 'img/partygames/garlandGame/atlas.png', 'img/partygames/garlandGame/atlas.json');
};

PartyGarlandGame.prototype.create = function () {
	PartyGame.prototype.create.call(this);
	// The garland game uses helper1, it should be Hedgehog or Panda as backup.
	if (this.birthday instanceof Panda) {
		this.changeAgents();
	}
	this.afterInvitations();

	this.firstBg = this.gameGroup.create(0, 0, 'garland', 'background');

	this.difference = 0;
	this.finishedRounds = 0;
	this.flagsBack = 0;

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
	this.emitter.setAlpha(1, 0, 3000);
	this.emitter.makeParticles(this.troll.id, 'star');

	var line = this.add.bitmapData(70,2);
	line.ctx.beginPath();
	line.ctx.rect(0,0,70,2);
	line.ctx.fillStyle = 0x000000;
	line.ctx.fill();
	this.line = this.add.sprite(0, 0, line);
	this.line.alpha = 0;
	this.gameGroup.add(this.line);

	if (this.helper1 instanceof Panda) {
		this.agentX = 330;
		this.agentX2 = -8;
	} else {
		this.agentX = 350;
		this.agentX2 = 14;
	}

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Change difficulty functions                        */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Change level of difficulty, amounts
PartyGarlandGame.prototype.getAmounts = function (max) {
	var amountsArray = [];
	for (var i = 1; i <= 9; i++) {
		amountsArray.push(i);
	}
	this.rnd.shuffle(amountsArray);

	var correct = this.game.rnd.between(3, max);
	amountsArray.splice(amountsArray.indexOf(correct), 1);
	amountsArray.unshift(correct);
	return amountsArray.splice(0, 3);
};

//Change level of difficulty, added amounts
PartyGarlandGame.prototype.getAddedAmounts = function (max) {
	var amountsArray = [];
	for (var i = 1; i < 9; i++) {
		amountsArray.push(i);
	}
	this.rnd.shuffle(amountsArray);

	// TODO: This looks like a very strange solution.
	var correct = max;
	amountsArray.splice(amountsArray.indexOf(correct), 1);
	amountsArray.unshift(correct);
	return amountsArray.splice(0, 3);
};

//Change level of difficulty, positionsX
PartyGarlandGame.prototype.getPosX = function (level) {
	return this.rnd.shuffle(level <= 3 ? [220, 370, 520] : [270, 570, 870]);
};

//Change level of difficulty, positionsY
PartyGarlandGame.prototype.getPosY = function (level) {
	return this.rnd.shuffle(level <= 3 ? [560, 640, 720] : [600, 600, 600]);
};

PartyGarlandGame.prototype.getTints = function () {
	return this.rnd.shuffle([0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x00ffff, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff]);
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.generateRound = function () {
	var amounts;
	var pileType;
	var posX = this.getPosX(Math.ceil(this.difficulty));
	var posY = this.getPosY(Math.ceil(this.difficulty));
	var tints = this.getTints();

	if (this.difficulty <= 1) {
		amounts = this.getAmounts(4);
		pileType = 'garland';
	} else if (this.difficulty <= 2) {
		amounts = this.getAmounts(4);
		pileType = 'garland';
	} else if (this.difficulty <= 3) {
		amounts = this.getAmounts(4);
		pileType = 'garland';
	} else if (this.difficulty <= 4) {
		amounts = this.getAmounts(4);
		pileType = 'piles';
	} else if (this.difficulty <= 5) {
		amounts = this.getAmounts(4);
		pileType = 'piles';
	} else if (this.difficulty <= 6) {
		amounts = this.getAmounts(5);
		pileType = 'manyNumber';
	} else if (this.difficulty <= 7) {
		amounts = this.getAmounts(6);
		pileType = 'manyNumber';
	} else if (this.difficulty <= 8) {
		amounts = this.getAmounts(7);
		pileType = 'manyNumber';
	} else if (this.difficulty <= 9) {
		amounts = this.getAmounts(8);
		pileType = 'singleNumber';
	} else {
		amounts = this.getAmounts(9);
		pileType = 'singleNumber';
	}

	if (this.difference > 0) {
		amounts = this.getAddedAmounts(this.difference);
	}

	this.correctAmount = amounts[0];
	this.createChoices(amounts, pileType, posX, posY, tints);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Create round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.createChoices = function (amounts, pileType, posX, posY, tints) {
	this.choices = [];

	for (var i = 0; i < 3; i++) {
		this.choices.push(new FlagPile(this.game, posX[i], posY[i], amounts[i], pileType, tints));
		this.gameGroup.add(this.choices[i]);
		this.choices[i].handle.events.onInputDown.add(this.pickFlags, this);
		this.choices[i].alpha = 0;
	}
};

PartyGarlandGame.prototype.createHelpGroup = function () {
	this.helpGroup = this.add.group(this.gameGroup);
	this.helpGroup.x = 315;
	this.helpGroup.y = 300;
	this.helpGroup.add(new FlagPile(this.game, -25, 0, this.correctAmount, 'garland'));
	this.helpGroup.alpha = 0;
};

PartyGarlandGame.prototype.createBg = function () {
	this.bg = this.gameGroup.create(0, 0, 'garland', 'background');
	this.bg.visible = false;
};

PartyGarlandGame.prototype.createGarlandGroup = function () {
	this.garlandGroup = this.add.group(this.gameGroup);
	this.garlandGroup.x = 315;
	this.garlandGroup.y = 300;

	this.addedFlagsGroup = this.add.group(this.gameGroup);
	this.addedFlagsGroup.x = 315;
	this.addedFlagsGroup.y = 300;
};

PartyGarlandGame.prototype.createTrees = function () {
	this.treePosition = this.garlandGroup.x + (50 * this.correctAmount) - 8;

	this.tree = this.gameGroup.create(200, 230, 'garland', 'tree1');
	this.tree.anchor.set(0.5);
	this.tree.visible = false;

	this.tree2 = this.gameGroup.create(this.treePosition, 210, 'garland', 'tree2');
	this.tree2.anchor.set(0.5);
	this.tree2.visible = false;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Round functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.addArrow = function () {
	this.arrow = this.gameGroup.create(0, 0, 'garland', 'arrow');
	this.arrow.scale.set(0.5);
	this.arrow.alpha = 0;
	this.arrow.anchor.set(0.5, 1);

	this.arrow.x = this.choices[0].x;
	if (this.difficulty <= 3) {
		this.arrow.y = this.choices[0].y - 40;
	} else {
		this.arrow.y = this.choices[0].y - 110;
	}

	var pointAngle;
	if (this.arrow.x < 270) {
		pointAngle = 0.5;
	} else if (this.arrow.x < 400) {
		pointAngle = 0;
	} else if (this.arrow.x < 600) {
		pointAngle = -0.4;
	} else {
		pointAngle = -1;
	}

	var t = new TimelineMax();
	t.add(new TweenMax(this.arrow, 1, {alpha:1}, '+=1'));
	t.add(new TweenMax(this.arrow, 0.5, {rotation: '+=' + pointAngle, ease: Power1.easeIn}, '-=0.8'));
	t.add(new TweenMax(this.arrow.scale, 0.6, {x: 0.6, y: 0.6, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false}));
	return t;
};

//Pick one of the piles
PartyGarlandGame.prototype.pickFlags = function (origin) {
	if (!this.garlandGroup.length || this.difference > 0) {
		origin.events.onInputUp.add(this.dropFlags, this);

		var choice = origin.parent;
		choice.follow(this.game.input.activePointer);
		this.gameGroup.bringToTop(choice);

		var t = new TimelineMax();
		if (choice === this.trollTarget) {
			t.add(new TweenMax(this.line, 0.5, {alpha:0}));
		}

		if (this.finishedRounds === 0) {
			t.add(new TweenMax(this.arrow, 1, {alpha:0}));
			t.addCallback(this.arrow.destroy, null, null, this.arrow);
		}

		t.addCallback(this.helper1.eyesFollowPointer, null, null, this.helper1);
	}
};

//Drop the pile on the card
PartyGarlandGame.prototype.dropFlags = function (origin) {
	var choice = origin.parent;
	choice.follow();

	origin.events.onInputUp.remove(this.dropFlags, this);

	this.helper1.eyesStopFollow();

	if (this.game.input.activePointer.y < 400) {
		var garland;
		var toX;
		var toY;
		var i;

		var t = new TimelineMax();
		t.addCallback(this.disable, null, [true], this);

		if (this.addedFlagsGroup.length) {
			this.gameGroup.bringToTop(this.addedFlagsGroup);
		}

		this.gameGroup.bringToTop(this.tree);

		this.childWidth = choice.pileGroup.children[0].width;

		t.addLabel('collect');

		if (this.difference === 0) {
			var rotationAngle = this.game.math.angleBetweenPoints(this.helper1.leftArm, this.garlandGroup);
			t.add(new TweenMax(this.helper1.leftArm, 0.5, { rotation: -0.5 + rotationAngle, ease: Power1.easeIn }, 'collect'));
		}

		for (i = 0; i < choice.pileGroup.children.length; i++) {
			garland = choice.pileGroup.children[i];
			toX = (this.garlandGroup.x - 10 + this.addedFlagsGroup.width - this.childWidth) - garland.world.x;
			toY = this.garlandGroup.y - garland.world.y;

			t.to(garland, 0.5, {x: '+=' + toX, y: '+=' + toY, width: 0, ease: Power1.easeIn}, 'collect');
		}

		t.addCallback(function () {
			choice.pileGroup.x = 0;
			choice.pileGroup.y = 0;

			while (choice.pileGroup.children.length) {
				garland = choice.pileGroup.children[0];
				garland.x = -25 + this.addedFlagsGroup.width;
				garland.y = 0;
				this.garlandGroup.add(garland);
			}

			choice.pileTypes();

			t.addSound(this.helper1.speech, this.helper1, 'thanks');
			t.addLabel('fade');

			var startX = this.garlandGroup.children[0].x - this.childWidth;
			var stopX;
			var i = this.garlandGroup.children.length;
			while (i--) {
				stopX = startX + this.childWidth;

				t.addLabel('start' + i);
				t.add(this.helper1.move({ x: this.garlandGroup.x + stopX + this.childWidth * 2 + this.agentX2, ease: Power1.easeIn}, 1.2), 'start' + i);
				t.add(new TweenMax.fromTo(this.garlandGroup.children[i], 1, { x: startX, width: 0}, {x: stopX, width: this.childWidth, ease: Power1.easeIn}), 'start' + i);

				startX = stopX;
			}

			if (this.garlandGroup.children.length > this.correctAmount) {
				t.add(new TweenMax(this.tree2, 0.5, {alpha:0.7}, 'fade'));
			}

			t.addCallback(this.checkFlags, null, null, this);

		}, null, null, this);

	} else {
		choice.pileGroup.x = 0;
		choice.pileGroup.y = 0;
	}
};

//Check if flag amount is correct
PartyGarlandGame.prototype.checkFlags = function () {
	if (!this.inputHandle) {
		this.inputHandle = this.gameGroup.create(this.garlandGroup.x - 50, this.garlandGroup.y, '', '');
		this.inputHandle.anchor.set(0, 0.5);
		this.inputHandle.inputEnabled = true;
	}

	this.inputHandle.width = this.garlandGroup.width + this.addedFlagsGroup.width + 55;
	this.inputHandle.height = this.garlandGroup.height + 25;

	var i;
	if (this.garlandGroup.length) {
		var t = new TimelineMax();

		if (this.garlandGroup.children.length === this.correctAmount) {
			this.finishedRounds = this.finishedRounds + 1;
			this.difference = 0;
			this.inputHandle.events.destroy();

			t.addCallback(this.disable, null, [true], this);
			t.add(new TweenMax(this.tree2, 0.5, { alpha: 1 }));

			t.addCallback(this.helpGroup.destroy, null, null, this.helpGroup);

			t.add(new TweenMax(this.helper1.leftArm, 0.5, { rotation: -0.8, ease: Power1.easeIn }));
			t.add(this.helper1.move({ x: this.helper1.x + 100, ease: Power1.easeIn}, 1), '-=0.2');
			t.addSound(this.helper1.speech, this.helper1, 'looksNice', '-=0.4');

			t.add(this.destroyChoices());

			if (this.finishedRounds < 5) {
				t.addSound(this.helper1.speech, this.helper1, 'moreGarlands', '+=1');
			}

			t.addCallback(this.nextRound, null, null, this);

		} else if (this.garlandGroup.children.length > this.correctAmount) {
			for (i = 0; i < 3; i++) {
				this.choices[i].handle.events.destroy();
			}
			this.inputHandle.events.onInputDown.add(this.tooMany, this);

			this.gameGroup.bringToTop(this.inputHandle);

			if (this.flagsBack < 1) {
				t.addSound(this.helper1.speech, this.helper1, 'putFlagsBack', '+=0.5');
			}

			t.addCallback(this.disable, '+=0.5', [false], this);

		} else if (this.garlandGroup.children.length < this.correctAmount) {
			this.difference = this.correctAmount - this.garlandGroup.children.length;

			while (this.garlandGroup.children.length) {
				this.addedFlagsGroup.add(this.garlandGroup.children[0]);
			}

			this.gameGroup.bringToTop(this.inputHandle);

			t.addSound(this.helper1.speech, this.helper1, 'helpMeFlags');

			t.addLabel('startFade');

			for (i = 0; i < this.choices.length; i++) {
				t.add(new TweenMax(this.choices[i], 2, { alpha: 0 }), 'startFade');
				t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
			}

			t.addCallback(this.generateRound, '+=2', null, this);

			t.addLabel('fadeIn');
			t.addCallback(function () {
				for (var i = 0; i < this.choices.length; i++) {
					t.add(new TweenMax(this.choices[i], 1, {alpha:1}), 'fadeIn');
				}
			}, null, null, this);

			if (this.finishedRounds === 0) {
				t.addCallback(this.addArrow, null, null, this);
				t.addCallback(this.disable, '+=2.3', [false], this);
			} else {
				t.addCallback(this.disable, null, [false], this);
			}
		}
	}
};

PartyGarlandGame.prototype.tooMany = function (origin) {
	origin.events.onInputUp.add(this.putFlagsBack, this);

	if (this.garlandGroup.length) {
		var oneFlag = this.garlandGroup.children[0];
		oneFlag.update = function () {
			this.x = this.game.input.activePointer.x - this.parent.x;
			this.y = this.game.input.activePointer.y - this.parent.y;
		};

		var t = new TimelineMax();
		t.addCallback(this.helper1.eyesFollowPointer, null, null, this.helper1);

		t.add(this.helper1.move({ x: this.helper1.x - oneFlag.width, ease: Power1.easeIn}, 0.8));
	}
};

PartyGarlandGame.prototype.putFlagsBack = function (origin) {
	origin.events.onInputUp.remove(this.putFlagsBack, this);

	this.helper1.eyesStopFollow();

	this.flagsBack = this.flagsBack + 1;

	var oneFlag = this.garlandGroup.children[0];
	oneFlag.update = function () {};
	oneFlag.x = 0;
	oneFlag.y = 0;

	var pile = this.game.rnd.pick(this.choices);
	pile.pileGroup.add(oneFlag);
	pile.pileTypes();

	this.checkFlags();
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Switch round functions                          */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.destroyChoices = function () {
	var t = new TimelineMax();
	t.addLabel('startFade');

	for (var i = 0; i < this.choices.length; i++) {
		t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
		t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
	}

	t.add(new TweenMax(this.line, 0.5, {alpha:0}), 'startFade');
	return t;
};

PartyGarlandGame.prototype.slideOut = function () {
	var t = new TimelineMax();
	t.addLabel('slideOut');
	t.add(this.helper1.move({ x: this.agentX, ease: Power0.easeNone}, 8), 'slideOut');
	t.addSound(this.helper1.speech, this.helper1, 'hereGood');

	if (this.finishedRounds === 0) {
		t.fromTo(this.firstBg, 4, {x:0, y:0}, {x:-1024, y:0, ease: Power0.easeNone}, 'slideOut');
	} else {
		t.fromTo(this.bg, 4, {x:0}, {x:-1024, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.tree, 4, {x:200}, {x:-1320, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.tree2, 3, {x:this.treePosition}, {x:-1200 + this.treePosition, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.garlandGroup, 4.3, {x:this.garlandGroup.x}, {x:-1390, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.addedFlagsGroup, 4.3, {x:this.addedFlagsGroup.x}, {x:-1390, ease: Power0.easeNone}, 'slideOut');
	}

	return t;
};

PartyGarlandGame.prototype.agentJump = function () {
	var t = new TimelineMax();
	t.addLabel('jump');
	t.to(this.helper1, 0.3, {y:'-=15', ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false});
	t.to(this.helper1.rightLeg, 0.3, {angle: -40, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.helper1.leftLeg, 0.3, {angle: 40, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.helper1.rightArm, 0.3, {rotation: 0.6, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.helper1.leftArm, 0.3, {rotation: -0.6, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	return t;
};

PartyGarlandGame.prototype.destroyRound = function () {
	this.flagsBack = 0;

	var t = new TimelineMax();
	t.addCallback(this.bg.destroy, null, null, this.bg);
	t.addCallback(this.tree.destroy, null, null, this.tree);
	t.addCallback(this.tree2.destroy, null, null, this.tree2);
	t.addCallback(this.garlandGroup.destroy, null, null, this.garlandGroup);
	t.addCallback(this.addedFlagsGroup.destroy, null, null, this.addedFlagsGroup);
	return t;
};

PartyGarlandGame.prototype.newRound = function () {
	this.createBg();
	this.generateRound();
	this.createHelpGroup();
	this.createGarlandGroup();
	this.createTrees();

	for (var i = 0; i < this.choices.length; i++) {
		this.gameGroup.bringToTop(this.choices[i]);
	}

	this.gameGroup.sendToBack(this.bg);
	this.bg.visible = true;
	this.helper1.visible = true;
	this.tree.visible = true;
	this.tree2.visible = true;

	var t = new TimelineMax();
	t.addLabel('slideIn');
	t.fromTo(this.bg, 4, { x: 1020 }, { x: 0, ease: Power0.easeNone }, 'slideIn');
	t.fromTo(this.tree, 4, { x: 1320 }, { x: 200, ease: Power0.easeNone }, 'slideIn');
	t.fromTo(this.tree2, 4, { x: 1200 + this.treePosition }, { x: this.treePosition, ease: Power0.easeNone }, 'slideIn');
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.trollStart = function () {
	if (this.finishedRounds > 0 && this.game.rnd.between(1, 100) <= 60) {
		this.disable(true);

		this.trollTarget = this.game.rnd.pick(this.choices);

		var emitX = this.trollTarget.x;
		if (this.difficulty <= 3) {
			emitX = this.trollTarget.x + (this.trollTarget.width / 2);
		}

		var t = new TimelineMax();
		t.add(this.troll.appear('random', emitX, this.trollTarget.y));
		t.add(this.trollTypePercent());
	}
};

PartyGarlandGame.prototype.trollTypePercent = function () {
	var t = new TimelineMax();

	var nr = this.game.rnd.between(1, 100);
	if (nr <= 20) {
		t.add(this.trollPolka());
	} else if (nr <= 60) {
		t.add(this.trollSplit());
	} else {
		t.add(this.trollSwapFlags());
	}

	return t;
};

PartyGarlandGame.prototype.trollSplit = function () {
	var t = new TimelineMax();

	if (this.trollTarget.pileGroup.length > 1) {
		if (this.difficulty <= 3) {
			t.addCallback(function () {
				var splitIndex = Math.round(this.trollTarget.pileGroup.length / 2);
				var stop = this.trollTarget.pileGroup.length;

				t.addLabel('move');
				for (var i = splitIndex; i < stop; i++) {
					t.to(this.trollTarget.pileGroup.children[i], 0.5, {x: '+=' + 50, ease: Power4.easeIn}, 'move');
				}

				this.line.x = this.trollTarget.pileGroup.children[splitIndex - 1].world.x + 20;
				this.line.y = this.trollTarget.pileGroup.children[splitIndex - 1].world.y - 30;

				t.add(new TweenMax(this.line, 0.5, {alpha:1}), 'move+=0.8');
			}, null, null, this);

			t.addCallback(this.disable, '+=1', [false], this);
		} else {
			t.addCallback(this.trollPolka, null, null, this);
		}
	} else {
		t.addCallback(this.trollSwapFlags, null, null, this);
	}

	return t;
};

PartyGarlandGame.prototype.trollPolka = function () {
	var t = new TimelineMax();

	if (this.trollTarget.pileGroup.length > 1) {
		t.addCallback(function () {
			for (var i = 0; i < this.trollTarget.pileGroup.length - 1; i+=2) {
				this.trollTarget.pileGroup.children[i].tint = 0xff0000;
				this.trollTarget.pileGroup.children[i + 1].tint = 0xffffff;
			}
		}, null, null, this);

		t.addCallback(this.disable, '+=1', [false], this);
	} else {
		t.addCallback(this.trollSwapFlags, null, null, this);
	}

	return t;
};

PartyGarlandGame.prototype.trollSwapFlags = function () {
	var otherPile = this.game.rnd.pick(this.choices);
	var i;
	var diff;

	if (this.trollTarget.pileGroup.length === this.correctAmount) {
		while (otherPile.pileGroup.length === this.correctAmount) {
			otherPile = this.game.rnd.pick(this.choices);
		}
	} else {
		otherPile = this.choices[0];
	}

	var t = new TimelineMax();
	if (this.trollTarget.pileGroup.children.length > otherPile.pileGroup.children.length) {
		diff = this.trollTarget.pileGroup.children.length - otherPile.pileGroup.children.length;

		for (i = 0; i < diff; i++) {
			t.add(new TweenMax(this.trollTarget.pileGroup.children[i], 0.4, {alpha:0}));
		}

		i = diff;
		t.addCallback(function () {
			while (i) {
				otherPile.pileGroup.add(this.trollTarget.pileGroup.children[0]);
				i--;
			}
		}, null, null, this);

		t.addCallback(function () {
			if (otherPile.nr && this.trollTarget.nr) {
				otherPile.nr.destroy();
				this.trollTarget.nr.destroy();
			}
			otherPile.pileTypes();
			otherPile.handle.width = otherPile.width + 25;
			this.trollTarget.pileTypes();
			this.trollTarget.handle.width = this.trollTarget.width + 25;

			for (i = 0; i < otherPile.pileGroup.length; i++) {
				t.add(new TweenMax(otherPile.pileGroup.children[i], 0.4, {alpha:1}));
			}

			t.addCallback(this.disable, '+=0.5', [false], this);
		}, null, null, this);

	} else if (this.trollTarget.pileGroup.children.length < otherPile.pileGroup.children.length) {
		diff = otherPile.pileGroup.children.length - this.trollTarget.pileGroup.children.length;

		for (i = 0; i < diff; i++) {
			t.add(new TweenMax(otherPile.pileGroup.children[i], 0.4, {alpha:0}));
		}

		i = diff;
		t.addCallback(function () {
			while (i) {
				this.trollTarget.pileGroup.add(otherPile.pileGroup.children[0]);
				i--;
			}
		}, null, null, this);

		t.addCallback(function () {
			if (this.trollTarget.nr && otherPile.nr) {
				this.trollTarget.nr.destroy();
				otherPile.nr.destroy();
			}
			this.trollTarget.pileTypes();
			this.trollTarget.handle.width = this.trollTarget.width + 25;
			otherPile.pileTypes();
			otherPile.handle.width = otherPile.width + 25;

			for (i = 0; i < this.trollTarget.pileGroup.length; i++) {
				t.add(new TweenMax(this.trollTarget.pileGroup.children[i], 0.4, {alpha:1}));
			}

			t.addCallback(this.disable, '+=0.5', [false], this);
		}, null, null, this);
	}

	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.modeIntro = function () {
	this.createBg();
	this.generateRound();
	this.createHelpGroup();
	this.createGarlandGroup();
	this.createTrees();

	var t = new TimelineMax();
	t.add(this.helper2.wave(1, -1));
	t.addSound(this.helper2.speech, this.helper2, 'hi', 0);
	t.addSound(this.helper2.speech, this.helper2, 'niceComeBack', '+=0.5');
	t.addSound(this.helper2.speech, this.helper2, 'helpUsAgain', '+=0.5');
	t.addSound(this.helper1.speech, this.helper1, 'haveToGarlands', '+=1');
	t.addSound(this.helper1.speech, this.helper1, 'letsPutUp', '+=0.3');
	t.add(new TweenMax(this.gladeIntro, 2, { alpha: 0 }), '+=3');

	t.addCallback(function () {
		this.helper1.x = -300;
		this.helper1.y = 326;
		this.helper1.scale.set(0.2);
		this.gameGroup.add(this.helper1);

		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);
	t.add(this.helper1.move({ x: 290, ease: Power0.easeNone}, 2.8));
	t.addSound(this.helper1.speech, this.helper1, 'goodPlace', '+=0.3');
	t.addSound(this.helper1.speech, this.helper1, 'followMe', '+=1');
	t.addCallback(this.nextRound, null, null, this);
};

PartyGarlandGame.prototype.modePlayerDo = function () {
	var t = new TimelineMax();
	if (this.finishedRounds < 5) {
		var bg = this.gameGroup.create(1022, 0, 'garland', 'background');
		this.gameGroup.sendToBack(bg);

		// TODO: This is not a good solution.
		t.add(this.slideOut(), 0);
		t.to(bg, 4, { x: 0, y: 0, ease: Power0.easeNone }, 0);
		t.add(this.destroyRound());
		t.to(bg, 4, { x: -1024, y: 0, ease: Power0.easeNone }, 4);
		t.add(this.newRound(), 4);
		t.add(this.agentJump(), 4.8);

		t.addLabel('fadeIn', '+=2');
		t.addCallback(function () {
			for (var i = 0; i < this.choices.length; i++) {
				t.add(new TweenMax(this.choices[i], 2, {alpha:1}), 'fadeIn');
			}
		}, null, null, this);
		t.add(new TweenMax(this.helpGroup, 2, {alpha:0.3}), 'fadeIn+=0.8');

		t.addSound(this.helper1.speech, this.helper1, 'whichGarland', 'fadeIn+=0.8');

		if (this.finishedRounds < 3) {
			t.addSound(this.helper1.speech, this.helper1, 'helpMeFlags', '+=1.5');
		}

		if (this.finishedRounds === 0) {
			t.addCallback(this.addArrow, null, null, this);
			t.addCallback(this.disable, '+=2.3', [false], this);
		} else {
			t.addCallback(this.disable, '+=0.5', [false], this);
		}

		t.addCallback(this.trollStart, null, null, this);

	} else if (this.finishedRounds === 5) {
		t.addCallback(this.modeOutro, '+=1', null, this);
	}
};

PartyGarlandGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.helper1.speech, this.helper1, 'looksGood');
	t.addSound(this.helper1.speech, this.helper1, 'finished', '+=0.5');

	t.add(this.helper1.move({ x:1200, ease: Power0.easeNone}, 3.5));
	t.add(this.troll.water(400, this));
	t.add(this.afterGarlands());

	t.addLabel('glade', '+=2');
	t.addCallback(function () {
		this.gladeIntro.parent.bringToTop(this.gladeIntro); // TODO: Make sprites better and this is unnecessary.

		this.helper1.x = 370;
		this.helper1.y = 540;
		this.helper1.scale.set(0.15);
		this.gladeIntro.add(this.helper1);

		this.troll.x = 580;
		this.troll.y = 570;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);
	}, 'glade', null, this);

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:1}));
	t.addSound(this.troll.speech, this.troll, 'isGood', '+=0.3');
	t.addSound(this.troll.speech, this.troll, 'continue', '+=0.5');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');
	t.addCallback(this.endGame, '+=3', null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Create pile objects                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
FlagPile.prototype = Object.create(Phaser.Group.prototype);
FlagPile.prototype.constructor = FlagPile;
function FlagPile (game, x, y, amount, pileType, tints) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	this.rope = this.create(0, 0, 'garland', 'rope');
	this.rope.scale.set(0.5);
	this.rope.anchor.set(0.5);
	this.rope.visible = false;

	this.pileGroup = this.game.add.group(this);

	this.handle = this.create(-50, 0, '', '');
	this.handle.inputEnabled = true;
	this.handle.anchor.set(0, 0.5);

	var i;
	if (!tints) {
		tints = [];
		for (i = 0; i < amount; i++) {
			tints.push(0xffffff);
		}
	}

	for (i = 0; i < amount; i++) {
		var flag = this.pileGroup.create(0, 0, 'garland', 'flag');
		flag.anchor.set(0.5);
		flag.scale.set(0.3);
		flag.tint = tints[i];
	}

	this.type = pileType;
	this.pileTypes();

	this.handle.width = this.width + 25;
	this.handle.height = this.height + 20;
}

FlagPile.prototype.follow = function (what) {
	if (!what) {
		this.pileGroup.update = function () {};
	} else {
		this.pileGroup.update = function () {
			this.x = what.x - this.parent.x;
			this.y = what.y - this.parent.y;
		};
	}
};

FlagPile.prototype.pileTypes = function () {
	var flags, angle, radius, i, j;

	if (this.type === 'piles') {
		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {
			angle = this.game.rnd.angle();
			radius = (this.rope.width - 50) / 2;

			flags = this.pileGroup.children[i];
			flags.x = Math.cos(angle)*Math.random()*radius;
			flags.y = Math.sin(angle)*Math.random()*radius;

			for (j = 0; j < i; j++) {
				if (flags.position.distance(this.pileGroup.children[j].position) < 40) {
					i--;
					break;
				}
			}
		}

	} else if (this.type === 'garland') {
		for (i = 1; i < this.pileGroup.children.length; i++) {
			flags = this.pileGroup.children[i];
			flags.x = this.pileGroup.children[i - 1].x + this.pileGroup.children[i].width;
			flags.y = this.pileGroup.children[i].y;
		}

	} else if (this.type === 'manyNumber') {
		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {
			angle = this.game.rnd.angle();
			radius = (this.rope.width - 50) / 2;

			flags = this.pileGroup.children[i];
			flags.x = Math.cos(angle)*Math.random()*radius;
			flags.y = Math.sin(angle)*Math.random()*radius;

			for (j = 0; j < i; j++) {
				if (flags.position.distance(this.pileGroup.children[j].position) < 40) {
					i--;
					break;
				}
			}
		}

		if (this.nr) {
			this.nr.destroy();
		}

		this.nr = this.game.add.text(0, 140, this.pileGroup.children.length, { font: '35pt ' + GLOBAL.FONT });
		this.nr.anchor.set(0.5);
		this.add(this.nr);

	} else if (this.type === 'singleNumber') {
		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {
			flags = this.pileGroup.children[i];
			flags.x = 0;
			flags.y = 0;
		}

		if (this.nr) {
			this.nr.destroy();
		}

		this.nr = this.game.add.text(0, 140, this.pileGroup.children.length, { font: '35pt ' + GLOBAL.FONT });
		this.nr.anchor.set(0.5);
		this.add(this.nr);
	}
};
