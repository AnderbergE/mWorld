var PartyGame = require('./PartyGame.js');
var GLOBAL = require('../../global.js');
var util = require('../../utils.js');
var Panda = require('../../characters/agents/Panda.js');

module.exports = PartyGarlandGame;

PartyGarlandGame.prototype = Object.create(PartyGame.prototype);
PartyGarlandGame.prototype.constructor = PartyGarlandGame;

function PartyGarlandGame () {
	PartyGame.call(this); // Call parent constructor.
}

var added = 0; // The amount of flags that have been added to the tree flags.
var trollChance = 40;

PartyGarlandGame.prototype.pos = {
	helper1: { x: 370, y: 540 },
	helper2: { x: 580, y: 520 },
	lines: { x: [220, 370, 520], y: [560, 640, 720] },
	piles: { x: [270, 570, 870], y: [600, 600, 600] },
	tree: { x: 250, y1: 230, y2: 210, width: 45 },
	flags: { x: 318, y: 300 },
	start: 0, // Set in create function.
	atTree: 0 // Set in create function.
};

PartyGarlandGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('garland', 'img/partygames/garlandGame/atlas.png', 'img/partygames/garlandGame/atlas.json');
};

PartyGarlandGame.prototype.create = function () {
	// The garland game uses helper1, it should be Hedgehog or Panda as backup.
	if (this.birthdayType === Panda) {
		this.switchAgents();
	}

	PartyGame.prototype.create.call(this);

	this.pos.atTree = this.helper1 instanceof Panda ? 400 : 420;
	this.pos.start = this.world.width;
	added = 0;

	// Setup graphics.
	this.bg = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'garland', 'background', this.gameGroup);

	var line = this.add.bitmapData(70, 2);
	line.ctx.beginPath();
	line.ctx.rect(0, 0, 70, 2);
	line.ctx.fillStyle = 0x000000;
	line.ctx.fill();
	this.line = this.add.sprite(0, 0, line);
	this.line.width = 0;
	this.gameGroup.add(this.line);

	this.treeGroup = this.add.group(this.gameGroup);
	this.treeGroup.x = -this.world.width;
	this.helpGroup = new FlagPile(this.game, this.pos.flags.x, this.pos.flags.y, 'garland');
	this.helpGroup.alpha = 0.2;
	this.helpGroup.handle.destroy();
	this.treeGroup.add(this.helpGroup);
	this.treeFlags = new FlagPile(this.game, this.pos.flags.x, this.pos.flags.y, 'garland');
	this.treeFlags.alpha = 1;
	this.treeFlags.handle.events.onInputDown.add(this.pickFromTree, this);
	this.treeFlags.handle.events.onInputUp.add(this.dropFromTree, this);
	this.treeFlags.handle.inputEnabled = false;
	this.treeGroup.add(this.treeFlags);
	this.leftTree = this.treeGroup.create(this.pos.tree.x, this.pos.tree.y1, 'garland', 'tree1');
	this.leftTree.anchor.set(0.5);
	this.rightTree = this.treeGroup.create(this.pos.tree.x, this.pos.tree.y2, 'garland', 'tree2');
	this.rightTree.anchor.set(0.5);

	this.choices = [];
	for (var i = 0; i < 3; i++) {
		var choice = new FlagPile(this.game);
		choice.handle.events.onInputDown.add(this.pickFlags, this);
		choice.handle.events.onInputUp.add(this.dropFlags, this);
		this.choices.push(choice);
		this.gameGroup.add(choice);
	}


	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Change level of difficulty, amounts
PartyGarlandGame.prototype.getAmounts = function (max, correct) {
	var amountsArray = util.growingArray(1, max);
	this.rnd.shuffle(amountsArray);

	// NOTE: Correct should not be less than 3, that will make the trees look weird.
	correct = correct || this.game.rnd.between(3, max);
	amountsArray.splice(amountsArray.indexOf(correct), 1);
	amountsArray.unshift(correct);
	return amountsArray.splice(0, 3);
};

PartyGarlandGame.prototype.generateRound = function () {
	// NOTE: Difficulty can go up to ten.
	var max = this.difficulty < 4 ? 4 : (this.difficulty | 0);
	var amounts;
	if (!added) {
		// New round detected.
		amounts = this.getAmounts(max);
		this.correctAmount = amounts[0];
		this.helpGroup.setAmount(this.correctAmount, [0xffffff]);
		this.treeFlags.setAmount(0);
		this.rightTree.x = this.helpGroup.x + this.helpGroup.width + this.pos.tree.width;
	} else {
		// There are already flags on the trees, correction round.
		amounts = this.getAmounts(max, this.correctAmount - added);
	}

	var pileType;
	var posX = this.pos.piles.x;
	var posY = this.pos.piles.y;
	if (this.difficulty < 3) {
		pileType = 'garland';
		posX = this.pos.lines.x;
		posY = this.pos.lines.y;
	} else if (this.difficulty < 5) {
		pileType = 'piles';
	} else if (this.difficulty < 8) {
		pileType = 'manyNumber';
	} else {
		pileType = 'singleNumber';
	}
	this.rnd.shuffle(posX);
	this.rnd.shuffle(posY);

	for (var i = 0; i < this.choices.length; i++) {
		this.choices[i].setup(posX[i], posY[i], pileType, amounts[i]);
	}
};

PartyGarlandGame.prototype.newRound = function (silent) {
	var time = 8;

	var t = new TimelineMax();
	t.to(this.bg.tilePosition, time, { x: -this.world.width, ease: Power1.easeInOut }, 0);
	t.to(this.treeGroup, time / 2, { x: -this.world.width * 1.2, ease: Power1.easeIn }, 0); // Right tree sticks out when 10 pieces if only using width.
	t.add(this.helper1.move({ x: this.pos.atTree }, time * 1.15), 0);
	if (!silent) {
		t.addSound(this.helper1.speech, this.helper1, 'moreGarlands', time / 8);
	}
	t.add(this.helper1.jump(3), time / 3);

	t.addCallback(this.generateRound, time / 2, null, this);
	t.fromTo(this.treeGroup, time / 2, { x: this.pos.start }, { x: 0, ease: Power1.easeOut, immediateRender: false }, time / 1.5);
	t.addCallback(this.helper1.eyesFollowObject, time / 1.5, [this.leftTree], this.helper1);
	t.addCallback(this.helper1.eyesStopFollow, null, null, this.helper1);
	t.addSound(this.helper1.speech, this.helper1, 'hereGood');
	t.addCallback(this.helper1.eyesFollowPointer, null, null, this.helper1);
	t.add(this.fadeChoices());
	return t;
};

PartyGarlandGame.prototype.fadeChoices = function (into) {
	var t = new TimelineMax();
	for (var i = 0; i < this.choices.length; i++) {
		t.add(util.fade(this.choices[i], into, 0.5), 0);
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
var polkaTints = [0xff0000, 0xffffff];
PartyGarlandGame.prototype.trolling = function (chance) {
	var t = new TimelineMax();

	if (this.game.rnd.between(1, 100) <= chance) {
		this.trollTarget = this.game.rnd.pick(this.choices);

		var emitX = this.trollTarget.x;
		if (this.trollTarget.type === 'garland') {
			emitX = this.trollTarget.x + (this.trollTarget.width / 2);
		}

		t.add(this.troll.appear(emitX, this.trollTarget.y));

		var nr = Math.random();
		var i;
		if (nr <= 0.5 && this.trollTarget.type === 'garland' && this.trollTarget.pileGroup.length > 1) {
			// Insert a line in a garland
			var splitIndex = Math.floor(this.trollTarget.pileGroup.length / 2);
			var splitFlag = this.trollTarget.pileGroup.children[splitIndex];
			this.line.x = splitFlag.world.x;
			this.line.y = splitFlag.world.y - splitFlag.height / 2;
			this.line.width = 0;

			t.addLabel('move');
			t.add(new TweenMax(this.line, 0.5, { width: splitFlag.width, ease: Power4.easeIn }), 'move');
			for (i = splitIndex; i < this.trollTarget.pileGroup.length; i++) {
				t.to(this.trollTarget.pileGroup.children[i], 0.5, { x: '+=' + splitFlag.width, ease: Power4.easeIn }, 'move');
			}
		} else if (nr <= 0.7 && this.trollTarget.pileGroup.length > 1) {
			// Change garlands to "polka" colours
			t.addCallback(function () {
				for (var i = 0; i < this.trollTarget.pileGroup.length; i++) {
					this.trollTarget.pileGroup.children[i].tint = polkaTints[i % polkaTints.length];
				}
			}, null, null, this);

		} else {
			var otherPile;
			do {
				otherPile = this.game.rnd.pick(this.choices);
			} while (otherPile === this.trollTarget);

			if (this.trollTarget.pileGroup.length < otherPile.pileGroup.length) {
				var temp = this.trollTarget;
				this.trollTarget = otherPile;
				otherPile = temp;
			}

			var diff = this.trollTarget.pileGroup.length - otherPile.pileGroup.length;
			var xPos = otherPile.x - this.trollTarget.x;
			var yPos = otherPile.y - this.trollTarget.y;

			var now = t.totalDuration();
			for (i = 0; i < diff; i++) {
				var flag = this.trollTarget.pileGroup.children[this.trollTarget.pileGroup.length - 1 - i];
				t.to(flag, 1, { x: xPos, y: yPos }, now + 0.5 * i);
				t.add(otherPile.transfer(flag), now + 1 + 0.5 * i);
				t.addCallback(this.trollTarget.updateDigit, null, null, this.trollTarget);
			}
		}
	}

	t.addCallback(this.disable, null, [false], this);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Round functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
//Pick one of the piles
PartyGarlandGame.prototype.pickFlags = function (origin) {
	var choice = origin.parent;
	choice.follow(this.game.input.activePointer);
	this.gameGroup.bringToTop(choice);
};

//Drop the pile on the card
PartyGarlandGame.prototype.dropFlags = function (origin) {
	var choice = origin.parent;
	choice.follow();

	if (this.game.input.activePointer.y < 450) {
		this.disable(true);
		this.line.width = 0; // This is a trolling line.

		var flags = this.treeFlags;
		this.helper1.eyesFollowObject(flags);

		var t = new TimelineMax();

		t.to(choice.pileGroup, 1, { x: this.helper1.x - this.helper1.width / 2 - choice.x, y: flags.y - choice.y });
		t.to(choice.pileGroup.scale, 1, { x: 0 }, 0);

		if (added === 0) {
			t.to(this.helper1.leftArm, 0.5, { rotation: -0.5 + this.game.math.angleBetweenPoints(this.helper1.leftArm, this.treeFlags), ease: Power1.easeIn }, 0);
		}
		t.addSound(this.helper1.speech, this.helper1, 'thanks');

		added += choice.pileGroup.length;

		// Flags are added with an animation.
		for (var i = 0; i < choice.pileGroup.length; i++) {
			var flag = choice.pileGroup.children[i];
			var lab = 'adding' + choice.pileGroup.length;
			t.addLabel(lab);
			t.add(this.helper1.move({ x: '+=' + flag.width }, 0.5), lab);
			t.add(flags.transfer(flag), lab);
		}

		t.addCallback(function () {
			choice.pileGroup.x = 0;
			choice.pileGroup.y = 0;
			choice.pileGroup.scale.set(1);
			this.checkFlags();
		}, null, null, this);

	} else {
		choice.pileGroup.x = 0;
		choice.pileGroup.y = 0;
	}
};

//Check if flag amount is correct
PartyGarlandGame.prototype.checkFlags = function () {
	this.disable(true);

	var t = new TimelineMax();

	this.helper1.eyesStopFollow();

	var i = 0;
	var currentFlags = this.treeFlags.pileGroup.length;
	if (currentFlags === this.correctAmount) { // Correct :)
		// Resetting input handlers.
		for (; i < this.choices.length; i++) {
			this.choices[i].handle.inputEnabled = true;
		}
		this.treeFlags.handle.inputEnabled = false;


		t.add(this.fadeChoices(false), 0);
		t.add(util.fade(this.rightTree, true, 0.5), 0);

		t.to(this.helper1.leftArm, 0.5, { rotation: this.helper1.coords.anim.arm.origin, ease: Power1.easeIn }, 0);
		t.add(this.helper1.move({ x: '+=100', ease: Power1.easeIn }, 1));
		t.addSound(this.helper1.speech, this.helper1, 'looksNice');

		t.addCallback(this.nextRound, null, null, this);
		return;

	} else if (currentFlags > this.correctAmount) { // Incorrect too high.
		// Now the player should draw from flags to bottom instead.
		for (; i < this.choices.length; i++) {
			this.choices[i].handle.inputEnabled = false;
		}
		this.treeFlags.handle.inputEnabled = true;

		t.add(util.fade(this.rightTree, true, 0.5, 0.5));
		t.addSound(this.helper1.speech, this.helper1, 'putFlagsBack');

	} else { // Incorrect too low.
		t.add(this.fadeChoices(false));
		t.addSound(this.helper1.speech, this.helper1, 'helpMeFlags');

		t.addCallback(this.generateRound, null, null, this);
		t.add(this.fadeChoices(true));
	}

	t.addCallback(this.helper1.eyesFollowPointer, null, null, this.helper1);
	t.addCallback(this.disable, null, [false], this);
};

PartyGarlandGame.prototype.pickFromTree = function () {
	if (this.treeFlags.pileGroup.length) {
		var flag = this.treeFlags.pileGroup.removeChildAt(this.treeFlags.pileGroup.length - 1);
		flag.x = flag.world.x;
		flag.y = flag.world.y;
		this.gameGroup.add(flag);
		flag.update = function () {
			this.x = this.game.input.activePointer.x - this.width / 2;
			this.y = this.game.input.activePointer.y;
		};
		this.treeFlags.lastFlag = flag;

		this.helper1.move({ x: '-=' + flag.width }, 0.5);
	}
};

PartyGarlandGame.prototype.dropFromTree = function () {
	var flag = this.treeFlags.lastFlag;
	flag.update = function () {};

	var closest;
	var minDist = Number.POSITIVE_INFINITY;
	for (var i = 0; i < this.choices.length; i++) {
		var choice = this.choices[i];
		var dist = this.math.distance(flag.x, flag.y, choice.x, choice.y);
		if (dist < minDist) {
			closest = choice;
			minDist = dist;
		}
	}
	closest.transfer(flag);

	if (this.treeFlags.pileGroup.length === this.correctAmount) {
		this.checkFlags();
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyGarlandGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.skippable();
	t.add(this.helper2.wave(1, -1));
	t.addSound(this.helper2.speech, this.helper2, 'hi', 0);
	t.addSound(this.helper2.speech, this.helper2, 'niceComeBack', '+=0.2');
	t.addSound(this.helper2.speech, this.helper2, 'helpUsAgain', '+=0.3');

	t.addSound(this.helper1.speech, this.helper1, 'haveToGarlands', '+=0.5');

	t.addLabel('upper');
	t.add(this.helper1.move({ x: this.world.width / 2, y: this.world.height / 2 }, 2), 'upper');
	t.addSound(this.helper1.speech, this.helper1, 'letsPutUp', 'upper');
	t.to(this.gladeIntro, 2.5, { x: -900, y: -700, ease: Power2.easeInOut }, 'upper');
	t.to(this.gladeIntro.scale, 2.5, { x: 3, y: 3, ease: Power2.easeInOut }, 'upper');

	t.add(util.fade(this.gladeIntro, false, 2));

	t.addCallback(function () {
		this.gladeIntro.x = 0;
		this.gladeIntro.y = 0;
		this.gladeIntro.scale.set(1);

		this.helper1.x = -300;
		this.helper1.y = 326;
		this.helper1.scale.set(0.2);
		this.gameGroup.addAt(this.helper1, this.gameGroup.getIndex(this.treeGroup));

		this.helper2.visible = false;

		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);
	}, null, null, this);
	t.add(this.helper1.move({ x: 290, ease: Power0.easeNone}, 2.8));
	t.addSound(this.helper1.speech, this.helper1, 'goodPlace');
	t.addSound(this.helper1.speech, this.helper1, 'followMe', '+=0.2');
	t.addCallback(this.nextRound, null, null, this);
};

PartyGarlandGame.prototype.modePlayerDo = function (intro) {
	added = 0;

	var t = new TimelineMax();
	t.add(this.newRound(intro));

	if (intro) {
		t.addSound(this.helper1.speech, this.helper1, 'whichGarland');
		t.addCallback(this.disable, null, [false], this);

		var arrow = this.gameGroup.create(0, 0, 'objects', 'arrow');
		arrow.tint = 0xf0f000;
		arrow.anchor.set(0, 0.5);
		arrow.alpha = 0;
		t.addCallback(function () {
			var choice = this.choices[0];
			arrow.x = choice.x;
			arrow.y = choice.y;
			arrow.rotation = this.math.angleBetweenPoints(this.treeFlags, arrow);
		}, null, null, this);
		t.add(util.fade(arrow, true, 0.5));
		t.to(arrow, 3, { x: this.treeFlags.x, y: this.treeFlags.y });
		t.add(util.fade(arrow, false, 0.2), '-=0.2');
		t.addCallback(arrow.destroy, null, null, arrow);
	} else {
		// NOTE: Controls are enabled in the trolling function.
		t.addCallback(this.trolling, null, [trollChance], this);
	}
};

PartyGarlandGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.helper1.speech, this.helper1, 'looksGood', '+=1');
	t.addSound(this.helper1.speech, this.helper1, 'finished', '+=0.5');

	t.add(this.helper1.move({ x: this.world.width + this.helper1.width }, 3));
	t.add(this.troll.water(400, this));

	t.addCallback(function () {
		this.afterGarlands();
		this.gameGroup.bringToTop(this.gladeIntro);

		this.helper1.x = this.pos.helper1.x;
		this.helper1.y = this.pos.helper1.y;
		this.helper1.scale.set(0.15);
		this.helper1.setHappy();
		this.gladeIntro.add(this.helper1);

		this.troll.x = this.pos.helper2.x;
		this.troll.y = this.pos.helper2.y;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);
	}, null, null, this);
	t.add(util.fade(this.gladeIntro, true, 2));

	t.addLabel('cheers');
	t.addSound(this.troll.speech, this.troll, 'isGood', 'cheers');
	t.add(this.troll.fistPump(3), 'cheers');
	t.add(this.helper1.fistPump(3), 'cheers');
	t.addSound(this.troll.speech, this.troll, 'continue', '+=0.5');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');

	t.addCallback(this.nextRound, null, null, this); // Ending game.
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Pile object                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
var allTints = [0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x00ffff, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff];

FlagPile.prototype = Object.create(Phaser.Group.prototype);
FlagPile.prototype.constructor = FlagPile;
function FlagPile (game, x, y, pileType, amount) {
	Phaser.Group.call(this, game, null); // Parent constructor.

	this.rope = this.create(0, 0, 'garland', 'rope');
	this.rope.anchor.set(0.5);
	this.rope.scale.set(0.5);

	this.handle = this.create(-25, 0);
	this.handle.anchor.set(0, 0.5);
	this.handle.alpha = 0;
	this.handle.inputEnabled = true;

	this.pileGroup = this.game.add.group(this);
	this.digit = this.game.add.text(0, this.rope.height / 2 + 35, 0, { font: '35pt ' + GLOBAL.FONT });
	this.digit.anchor.set(0.5);
	this.add(this.digit);

	this.setup(x, y, pileType, amount);
}

FlagPile.prototype.setup = function (x, y, pileType, amount) {
	this.x = x;
	this.y = y;
	this.alpha = 0;

	this.type = pileType;
	this.rope.visible = this.type !== 'garland';
	this.digit.visible = this.type === 'manyNumber' || this.type === 'singleNumber';

	this.pileGroup.x = 0;
	this.pileGroup.y = 0;
	this.pileGroup.removeAll();
	this.pileGroup.scale.set(1);
	this.setAmount(amount);
};

FlagPile.prototype.setAmount = function (amount, tints) {
	while (this.pileGroup.length > amount) {
		this.pileGroup.removeChildAt(this.pileGroup.length - 1);
	}

	for (var i = this.pileGroup.length; i < amount; i++) {
		var flag = this.pileGroup.create(0, 0, 'garland', 'flag');
		flag.anchor.set(0, 0.5);
		flag.scale.set(0.3);
		flag.tint = tints ? tints[i % tints.length] : this.game.rnd.pick(allTints);
		this.setPosition(flag);
	}

	this.updateHandle();
};

FlagPile.prototype.setPosition = function (flag) {
	flag.x = 0;
	flag.y = 0;

	if (this.type === 'garland') {
		flag.x = (flag.z - 1) * flag.width;
	} else if (this.type === 'piles' || this.type === 'manyNumber') {
		var done = false;
		while (!done) {
			var angle = this.game.rnd.angle();
			var radius = (this.rope.width - 50) / 2;
			flag.x = Math.cos(angle) * Math.random() * radius;
			flag.y = Math.sin(angle) * Math.random() * radius;

			done = true;
			for (var j = flag.z; j < this.pileGroup.length; j++) {
				if (flag.position.distance(this.pileGroup.children[j].position) < 40) {
					done = false;
					break;
				}
			}
		}
	}

	this.updateDigit();
};

FlagPile.prototype.updateDigit = function () {
	if (this.digit.visible) {
		this.digit.text = this.pileGroup.children.length;
	}
};

FlagPile.prototype.updateHandle = function () {
	if (this.rope.visible) {
		this.handle.x = -this.rope.width / 2;
		this.handle.width = this.rope.width;
		this.handle.height = this.rope.height;
	} else {
		this.handle.x = -25;
		this.handle.width = this.pileGroup.width + 50;
		this.handle.height = this.pileGroup.height + 20;
	}
};


FlagPile.prototype.transfer = function (flag) {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.pileGroup.add(flag);
		this.setPosition(flag);
		this.updateHandle();
	}, null, null, this);
	return t.fromTo(flag, 0.5, { width: 0 }, { width: flag.width, immediateRender: false });
};

FlagPile.prototype.follow = function (what) {
	if (!what) {
		this.pileGroup.update = function () {};
	} else {
		this.pileGroup.update = function () {
			this.x = what.x - this.parent.x - this.width / 2;
			this.y = what.y - this.parent.y;
		};
	}
};
