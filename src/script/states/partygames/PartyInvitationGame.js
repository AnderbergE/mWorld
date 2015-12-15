var PartyGame = require('./PartyGame.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');
var Cover = require('../../objects/Cover.js');
var Mouse = require('../../characters/agents/Mouse.js');

module.exports = PartyInvitationGame;

PartyInvitationGame.prototype = Object.create(PartyGame.prototype);
PartyInvitationGame.prototype.constructor = PartyInvitationGame;
function PartyInvitationGame () {
	PartyGame.call(this); // Call parent constructor.
}

// Right now only two rounds are used, and it is a 50% chance to get more than one.
// If you raise the max rounds, the percentage will be to the power of rounds (that is extra 1: 0.5, extra 2: 0.5^2, extra 3: 0.5^3...).
var maxCardRounds = 2;
var morePercentage = 0.5;
var difficultySpritePercentages = [[10, 90], [20, 80], [30, 70], [40, 60], [40, 50], [40, 40], [30, 30], [20, 20], [10, 10], [10, 0]];
var trollChance = 40;
var trollChanceAnother = 25;

PartyInvitationGame.prototype.pos = {
	helper1: { x: 580, y: 520 },
	helper2: { x: 370, y: 540 },
	troll: { x: 480, y: 650 },
	stack: { x: -30, y: 490, scale: 0.7 },
	arm: { x: 840, y: 540, scale: 1.4, angle: 45 },
	choices: [300, 500, 700], // NOTE: This is actually shuffled in code, do not rely on these positions.
	choiceY: 685
};

// Tell the PartyGame to create guests with these scales (see createGuests).
PartyInvitationGame.prototype.guestScales = [0.5, 0.4, 0.7, 0.2, 0.2];

PartyInvitationGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('invitation', 'img/partygames/invitationGame/atlas.png', 'img/partygames/invitationGame/atlas.json');
};

PartyInvitationGame.prototype.create = function () {
	// The invitation game uses helper1, it should be Panda or Mouse as backup.
	if (this.birthdayType === Mouse) {
		this.switchAgents();
	}

	PartyGame.prototype.create.call(this);

	this.troll.visible = true;
	this.troll.changeShape('stone');

	this.mailbox = this.gladeIntro.create(800, 360, 'glade', 'mailbox');


	this.gameGroup.create(0, 0, 'invitation', 'background');

	this.guestThought = this.add.group(this.gameGroup);
	this.guestThought.x = 740;
	this.guestThought.y = 110;
	this.guestThought.visible = false;
	var bubble = this.guestThought.create(-10, 5, 'objects', 'thought_bubble');
	bubble.anchor.set(0.5);
	bubble.scale.set(-1);
	bubble.angle = -30;
	this.thoughtGroup = this.add.group(this.guestThought); // This will be filled with the decor.

	this.stackHighlight = new Cover(this.game, 0x0000aa, 0);
	this.stackHighlight.x = this.pos.stack.x;
	this.stackHighlight.y = this.pos.stack.y;
	this.stackHighlight.anchor.set(0.5);
	this.stackHighlight.scale.set(0.45);
	this.stackHighlight.flash = TweenMax.to(this.stackHighlight, 0.8, { alpha: 0.3, ease: Power1.easeInOut, repeat: -1, yoyo: true, paused: true });
	this.gameGroup.add(this.stackHighlight);

	this.cardStack = this.add.group(this.gameGroup);
	this.cardStack.x = this.pos.stack.x;
	this.cardStack.y = this.pos.stack.y;

	this.choices = [];
	for (var i = 0; i < 3; i++) {
		var choice = new Tray(this.game, 0, this.world.height);
		choice.scale.set(0);
		choice.handle.events.onInputDown.add(this.pickDecor, this);
		this.gameGroup.add(choice);
		this.choices.push(choice);
	}

	this.arm = this.gameGroup.create(this.pos.arm.x, this.pos.arm.y, 'invitation', this.helper1 instanceof Mouse ? 'mousearm' : 'pandaarm');
	this.arm.anchor.y = 0.3;
	this.arm.angle = this.pos.arm.angle;
	this.arm.scale.set(this.pos.arm.scale);

	this.gladeIntro.parent.bringToTop(this.gladeIntro);
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/**
 * @param {Number} max - The max value of a number in the array.
 * @returns {Array} An array with 3 specific amounts.
 */
PartyInvitationGame.prototype.getAmounts = function (max) {
	var amountsArray = util.growingArray(1, max);
	this.rnd.shuffle(amountsArray);
	return amountsArray.splice(0, 3);
};

/**
 * @returns {Array} An array with 3 unspecific amounts (two many, one few, or vice versa).
 */
PartyInvitationGame.prototype.getAmountsMany = function () {
	var many = this.game.rnd.between(10, 20);
	var few = this.game.rnd.between(2, 3);

	return this.game.rnd.pick([[many, few, few], [few, many, many]]);
};

/**
 * Get the decor sprites to use. One sprite variant will be used if none of the percentages are fulfilled.
 * @param {Number} chanceTwo - The percentage (0-100) of two sprites.
 * @param {Number} chanceThree - The percentage (0-100) of three sprites.
 * @returns {Array} An array with three sprites.
 */
PartyInvitationGame.prototype.getSprites = function (chanceTwo, chanceThree) {
	chanceTwo += chanceThree;
	var chance = this.game.rnd.between(1, 100);
	var variants = chance <= chanceThree ? 3 : (chance <= chanceTwo ? 2 : 1);

	var sprites = this.rnd.shuffle(['decor1', 'decor2', 'decor3', 'decor4', 'decor5']);
	sprites.splice(variants);
	while (sprites.length < 3) {
		sprites.push(sprites[0]);
	}
	return sprites;
};

PartyInvitationGame.prototype.generateRound = function () {
	var pileType;
	if (this.difficulty < 4) {
		pileType = 'piles';
	} else if (this.difficulty < 6) {
		pileType = 'singles';
	} else if (this.difficulty < 8) {
		pileType = 'manyNumber';
	} else  {
		pileType = 'singleNumber';
	}

	var amounts;
	if (this.difficulty < 4) {
		amounts = this.getAmountsMany();
	} else {
		// NOTE: Difficulty can go up to ten.
		amounts = this.getAmounts(this.difficulty | 0); // "|" is a fast way to round down.
	}

	var sprites = this.getSprites.apply(this, difficultySpritePercentages[this.difficulty | 0]);

	var xPos = this.rnd.shuffle(this.pos.choices);

	for (var i = 0; i < this.choices.length; i++) {
		this.choices[i].setup(pileType, amounts[i], sprites[i], xPos[i]);
	}

	this.correctAmount = amounts[0];
	this.correctSprite = sprites[0];

	this.thoughtGroup.removeAll();
	for (i = 0; i < this.correctAmount; i++) {
		this.thoughtGroup.create(0, 0, 'invitation', this.correctSprite).anchor.set(0.5);
	}

	// Randomize position of the decor and make sure they do not overlap.
	for (i = 0; i < this.correctAmount; i++) {
		var decor = this.thoughtGroup.children[i];

		var angle = this.game.rnd.angle();
		decor.x = Math.cos(angle)*Math.random()*50;
		decor.y = Math.sin(angle)*Math.random()*50;

		if (this.correctAmount < 10) {
			for (var j = 0; j < i; j++) {
				if (decor.position.distance(this.thoughtGroup.children[j].position) < 30) {
					i--;
					break;
				}
			}
		}
	}
};

/** Set up new card for next round */
PartyInvitationGame.prototype.newCard = function () {
	this.playCard = new Card(this.game, this.game.width / 2, 395);
	this.playCard.scale.set(0);
	this.gameGroup.add(this.playCard);
	this.playCard.handle.events.onInputDown.add(this.pickDecor, this);
};

/** Set up new guest for next round */
PartyInvitationGame.prototype.newGuest = function () {
	this.guest = this.guests[this.cardStack.children.length];
	if (this.guest.name === LANG.TEXT.lizardName) {
		this.guest.x = this.game.width / 2 - 100;
		this.guest.y = 55;
	} else {
		this.guest.x = this.game.width / 2;
		this.guest.y = 75;
	}
	this.gameGroup.add(this.guest);
};

PartyInvitationGame.prototype.newRound = function (add) {
	this.generateRound();

	var t = new TimelineMax();

	if (!add) {
		this.moreDecor = 0;
		this.newCard();
		this.newGuest();

		var correct = this.choices[0];
		t.addSound(this.helper1.speech, this.helper1, correct.type === 'piles' ? (correct.decorGroup.length > 5 ? 'manyOfThese' : 'someOfThese') : 'thisManyOfThese', 0.3);
	}
	this.moreDecor++;

	t.add(util.fade(this.guest, true, 0.2), 0);
	t.add(util.fade(this.guestThought, true, 0.5), 0.5);
	t.add(util.popin(this.playCard, true, 0.5), 1);
	t.addCallback(this.slideChoices, 1.5, [true], this);
	return t;
};

PartyInvitationGame.prototype.slideChoices = function (into) {
	var t = new TimelineMax();
	for (var i = 0; i < this.choices.length; i++) {
		var choice = this.choices[i];
		t.add(TweenMax.to(choice, 0.5, { y: into ? this.pos.choiceY : this.world.height }), 0);
		t.add(TweenMax.to(choice.scale, 0.5, { x: into ? 1 : 0, y: into ? 1 : 0 }), 0);
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyInvitationGame.prototype.trolling = function (chance) {
	// Always return a timeline from this function.
	var t = new TimelineMax();

	// Randomize troll appearance.
	if (this.game.rnd.between(1, 100) <= chance) {
		var target = this.choices[this.rnd.integerInRange(1, 2)];
		t.add(this.troll.appear(target.x, this.pos.choiceY));

		if (Math.random() <= 0.5) {
			// Change places of two piles.
			var otherPile;
			do {
				otherPile = this.game.rnd.pick(this.choices);
			} while (target === otherPile);

			t.addLabel('changePlace');
			t.to(target, 1, { x: otherPile.x, ease: Power2.easeOut });
			t.to(otherPile, 1, { x: target.x, ease: Power2.easeOut }, 'changePlace');
		} else {
			// Change decor on one of the piles (not the correct one).
			t.addCallback(function () {
				var newName = target.decorGroup.children[0].frameName === 'decor5' ? 'decor3' : 'decor5';
				for (var i = 0; i < target.decorGroup.length; i++) {
					target.decorGroup.children[i].frameName = newName;
				}
			}, null, null, this);
		}

		t.addSound(this.helper1.speech, this.helper1, 'ohNo');
		t.addSound(this.helper1.speech, this.helper1, (Math.random() < 0.5 ? 'aBitWeird' : 'helpMeCorrect'));
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Picked pile and feedback functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/** Run this function when picking up one of the piles. */
PartyInvitationGame.prototype.pickDecor = function (origin) {
	if (!this.playCard.decorGroup.length || this.game.input.activePointer.y < 550) {
		var choice = origin.parent;
		origin.events.onInputUp.add(this.dropDecor, this);
		this.gameGroup.bringToTop(choice);
		choice.follow(this.game.input.activePointer);
	}
};

/** Run this function when dropping one of the piles. */
PartyInvitationGame.prototype.dropDecor = function (origin) {
	origin.events.onInputUp.remove(this.dropDecor, this);

	var choice = origin.parent;
	choice.follow();

	if (this.game.input.activePointer.y < 550) {
		if (choice instanceof Tray) {
			this.playCard.transferFrom(choice);
			this.checkDecor();
		}
	} else {
		if (choice instanceof Card) {
			for (var i = 0; i < this.choices.length; i++) {
				if (!this.choices[i].decorGroup.length) {
					this.choices[i].transferFrom(choice);
					break;
				}
			}
		}
	}
};

/** Check if dropped decor is correct */
PartyInvitationGame.prototype.checkDecor = function () {
	if (this.checking) {
		this.checking.kill();
	}

	this.checking = new TimelineMax();
	if (this.playCard.decorGroup.children.length === this.correctAmount) { // Correct :)
		this.checking.addCallback(this.disable, null, [true], this);

		this.checking.add(util.fade(this.guestThought, false, 0.5), 0);
		this.checking.add(this.slideChoices(false), 0);

		var more = Math.random();
		if (this.moreDecor < maxCardRounds && more > Math.pow(morePercentage, this.moreDecor)) {
			// The card will get another round.
			this.playCard.stashDecor();

			this.checking.addSound(this.helper1.speech, this.helper1, 'rightButMore', 0);
			this.checking.addCallback(function () {
				this.guest.setNeutral();
				var t = this.newRound(true);
				t.add(this.trolling(trollChanceAnother));
				t.addCallback(this.disable, null, [false], this);
			}, null, null, this);

		} else {
			// We are done with this card!
			this.setupDragCard();

			this.checking.addCallback(this.guest.setHappy, null, null, this.guest);
			this.checking.addSound(this.helper1.speech, this.helper1, 'looksNice');
			this.checking.addCallback(this.disable, null, [false], this);
			this.checking.addSound(this.helper1.speech, this.helper1, 'dragCard');
		}

	} else if (this.playCard.decorGroup.children.length > this.correctAmount) { // Incorrect, too many.
		this.checking.addCallback(this.guest.setSad, null, null, this.guest);
		this.checking.addSound(this.helper1.speech, this.helper1, 'tryLess');
		this.checking.addSound(this.helper1.speech, this.helper1, 'dragStickersBack', '+=0.5');

	} else { // Incorrect, too few.
		this.checking.addCallback(this.guest.setSad, null, null, this.guest);
		this.checking.addSound(this.helper1.speech, this.helper1, 'tryMore');
		this.checking.addSound(this.helper1.speech, this.helper1, 'dragStickersBack', '+=0.5');
	}
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                  Card functions after decor is done                       */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/** Setup the dragging of the card to the stack. */
PartyInvitationGame.prototype.setupDragCard = function () {
	this.playCard.parent.bringToTop(this.playCard);
	this.playCard.handle.events.destroy();
	this.playCard.handle.events.onInputDown.add(function () {
		this.playCard.update = function () {
			this.x = this.game.input.activePointer.x;
			this.y = this.game.input.activePointer.y;
		};
	}, this);
	this.playCard.handle.events.onInputUp.add(function () {
		this.playCard.update = function () {}; // Overwriting the follow.
		this.addCardToStack().addCallback(this.nextRound, null, null, this);
	}, this);

	this.stackHighlight.flash.play();
};

/** Add the finished card to stack. */
PartyInvitationGame.prototype.addCardToStack = function () {
	this.disable(true);
	this.stackHighlight.flash.pause(0);
	this.playCard.handle.events.destroy();

	var t = new TimelineMax();
	var offset = this.cardStack.length * 5;
	t.to(this.playCard, 1, { x: this.cardStack.x + offset, y: this.cardStack.y + offset, ease: Power0.easeInOut }, 0);
	t.to(this.playCard.scale, 1, { x: this.pos.stack.scale, y: this.pos.stack.scale, ease: Power0.easeInOut }, 0);
	t.addCallback(function () {
		this.cardStack.add(this.playCard);
		this.playCard.x = offset;
		this.playCard.y = offset;
	}, null, null, this);

	t.add(util.fade(this.guest, false, 0.5), 0);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyInvitationGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.skippable();

	t.add(this.helper2.wave(1, -1));
	t.addSound(this.helper2.speech, this.helper2, 'hi', 0);
	t.addSound(this.helper2.speech, this.helper2, 'niceYoureHere', '+=0.5');
	if (this.birthdayType === Mouse) { // Special case for the speech to be correct.
		t.addSound(this.helper2.speech, this.helper2, 'soonBirthday', '+=1');
	} else {
		t.addSound(this.helper1.speech, this.helper1, 'soonBirthday', '+=1');
	}
	t.addSound(this.helper1.speech, this.helper1, 'wereHavingParty', '+=0.5');

	t.add(this.troll.transform('troll'), '+=1');
	t.addSound(this.sfx, null, 'pop', '-=1');

	t.addCallback(function () {
		this.helper1.eyesFollowObject(this.troll);
		this.helper2.eyesFollowObject(this.troll);
	}, null, null, this);

	t.addSound(this.troll.speech, this.troll, 'laugh');
	t.addSound(this.troll.speech, this.troll, 'iCanDo', '+=0.6');

	t.addCallback(function () {
		this.helper1.eyesFollowObject(this.troll.emitter);
		this.helper2.eyesFollowObject(this.troll.emitter);
	}, null, null, this);

	t.add(this.troll.swish(this.mailbox.x + 30, this.mailbox.y + 30));

	var bear = this.gladeIntro.create(this.mailbox.x, this.mailbox.y + 60, 'glade', 'decor5');
	bear.alpha = 0;
	bear.scale.set(1.5);

	t.addLabel('gone', '-=0.5');
	t.addLabel('gone2');
	t.addSound(this.sfx, null, 'pop', 'gone');
	t.add(new TweenMax(this.mailbox, 0.1, { alpha: 0 }), 'gone');
	t.add(new TweenMax(bear, 0.1, { alpha: 1 }), 'gone');
	t.to(this.troll.leftArm, 0.3, { rotation: -1.1, ease: Power4.easeIn });
	t.addSound(this.troll.speech, this.troll, 'oops1', 'gone2');

	t.addCallback(function () {
		this.helper1.eyesStopFollow();
		this.helper2.eyesStopFollow();
	}, null, null, this);
	t.addSound(this.troll.speech, this.troll, 'iNeedHelp', '+=0.5');

	t.addSound(this.helper1.speech, this.helper1, 'gottaInvite', '+=1');
	t.addLabel('maker');
	t.add(this.helper1.move({ x: '+=' + 170, y: '+=' + 20 }, 2), 'maker');
	t.addSound(this.helper1.speech, this.helper1, 'makeCards', 'maker');
	t.to(this.gladeIntro, 3.5, { x: -2700, y: -1800, ease: Power2.easeInOut }, 'maker');
	t.to(this.gladeIntro.scale, 3.5, { x: 4, y: 4, ease: Power2.easeInOut }, 'maker');

	t.add(util.fade(this.gladeIntro, false, 2));

	t.addCallback(function () {
		bear.destroy();

		this._counter.value++; // We run one card and because this part is in the intro, manually increase counter.

		this.gladeIntro.x = 0;
		this.gladeIntro.y = 0;
		this.gladeIntro.scale.set(1);

		this.troll.visible = false;
		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);

		var t = new TimelineMax();
		t.skippable();
		t.addSound(this.helper1.speech, this.helper1, 'allGuestsGet');
		t.add(this.newRound(), '+=1');

		var correctPile = this.choices[0];
		this.gameGroup.bringToTop(correctPile);
		this.gameGroup.bringToTop(this.arm);

		t.to(this.arm, 3, { x: correctPile.x, y: this.pos.choiceY, ease: Power1.easeIn }); // Cannot go to choice y, since it is too low.
		t.addSound(this.helper1.speech, this.helper1, 'imTrying');
		t.addCallback(function () { correctPile.follow(this.arm); }, null, null, this);
		t.to(this.arm, 2, { x: this.playCard.x, y: this.playCard.y, ease: Power1.easeIn });
		t.addCallback(function () {
			this.playCard.transferFrom(correctPile);
			correctPile.follow();
			this.guest.setHappy();
		}, null, null, this);
		t.addSound(this.helper1.speech, this.helper1, 'looksNice');

		t.add(util.fade(this.guestThought, false, 0.5));
		t.add(this.slideChoices(false));

		t.addSound(this.helper1.speech, this.helper1, 'imPutting');
		t.addLabel('drag');
		t.add(this.addCardToStack());
		t.to(this.arm, 1, { x: this.cardStack.x, y: this.cardStack.y, ease: Power0.easeIn }, 'drag');
		t.to(this.arm, 2, { x: this.pos.arm.x, y: this.pos.arm.y, ease: Power1.easeIn });

		t.addCallback(function () {
			// Don't know why this is necessary, but otherwise the card will not go to the correct positions when skipping the instructions.
			this.playCard.x = 0;
			this.playCard.y = 0;
		}, null, null, this);

		t.addCallback(this.nextRound, null, null, this);
	}, null, null, this);
};

PartyInvitationGame.prototype.modePlayerDo = function (intro) {
	var t = new TimelineMax();
	t.add(this.newRound());

	if (intro) {
		t.addSound(this.helper1.speech, this.helper1, 'helpMeStickers', '+=0.5');
	} else {
		t.add(this.trolling(trollChance));
	}
	t.addCallback(this.disable, null, [false], this);
};

PartyInvitationGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.helper1.speech, this.helper1, 'madeNiceCards');
	t.to(this.arm, 2, { x: this.cardStack.x, y: this.cardStack.y, ease: Power1.easeIn });
	t.to([this.arm, this.cardStack], 1, { x: this.world.width, y: this.world.height + this.cardStack.height, ease: Power1.easeIn });
	t.add(this.troll.water(400, this));

	t.addCallback(function () {
		this.gameGroup.bringToTop(this.gladeIntro);

		this.helper1.x = this.pos.helper2.x;
		this.helper1.y = this.pos.helper2.y;
		this.helper1.scale.set(0.15);
		this.gladeIntro.add(this.helper1);

		this.troll.x = this.pos.helper1.x;
		this.troll.y = this.pos.helper1.y;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);

		this.troll.rightArm.add(this.cardStack);
		this.cardStack.x = this.troll.rightArm.width / 2;
		this.cardStack.y = 0;
		this.cardStack.scale.set(1);

		this.helper2.visible = false;
		this.mailbox.alpha = 1;
	}, null, null, this);
	t.add(util.fade(this.gladeIntro, true, 2));

	t.addSound(this.troll.speech, this.troll, 'isGood', '+=0.3');
	t.addCallback(this.troll.eyesFollowObject, null, [this.mailbox], this.troll);
	t.add(this.troll.move({ x: this.mailbox.x - 50, y: this.mailbox.y + 90, ease: Power0.easeNone }, 2));
	t.to(this.troll.rightArm, 0.8,  { rotation: -0.3, ease: Power1.easeIn });
	t.addCallback(function () { this.mailbox.frameName = 'mailbox_open'; }, null, null, this);
	t.to(this.cardStack.scale, 0.5, { x: 0, y: 0, ease: Power0.easeNone });
	t.to(this.troll.rightArm, 1, { rotation: 1.1, ease: Power1.easeIn});
	t.addCallback(function () {
		this.mailbox.frameName = 'mailbox';
		this.troll.eyesStopFollow();
	}, null, null, this);

	t.add(this.troll.move({ x: this.pos.helper1.x, y: this.pos.helper1.y, ease: Power0.easeNone }, 2));
	t.addSound(this.troll.speech, this.troll, 'continue', '-=1');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');

	t.addCallback(this.nextRound, null, null, this); // Ending game.
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Container object                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Container.prototype = Object.create(Phaser.Group.prototype);
Container.prototype.constructor = Container;
function Container (game, x, y, handle, handleDecor) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	this.handle = this.create(0, 0, handle, handleDecor);
	this.handle.inputEnabled = true;
	this.handle.anchor.set(0.5);

	this.decorGroup = this.game.add.group(this);
}

Container.prototype.transferFrom = function (container) {
	while (container.decorGroup.children.length) {
		this.decorGroup.add(container.decorGroup.children[0]);
	}
};

Container.prototype.follow = function (what) {
	this.decorGroup.x = 0;
	this.decorGroup.y = 0;

	if (!what) {
		this.decorGroup.update = function () {};
	} else {
		this.decorGroup.update = function () {
			this.x = what.x - this.parent.x;
			this.y = what.y - this.parent.y;
		};
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Tray object                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Tray.prototype = Object.create(Container.prototype);
Tray.prototype.constructor = Tray;
function Tray (game, x, y) {
	Container.call(this, game, x, y, 'invitation', 'tray'); // Parent constructor.
}

Tray.prototype.setup = function (type, amount, decor, xPos) {
	this.type = type;
	this.x = xPos;

	this.decorGroup.removeAll();
	for (var i = 0; i < amount; i++) {
		this.decorGroup.create(0, 0, 'invitation', decor).anchor.set(0.5);
	}
	this.decorPositions();
};

Tray.prototype.transferFrom = function (container) {
	Container.prototype.transferFrom.call(this, container);

	this.decorPositions();
};

Tray.prototype.decorPositions = function () {
	var i, j, decor, angle, radius;
	if (this.type === 'piles' || this.type === 'singles' || this.type === 'manyNumber') {
		for (i = 0; i < this.decorGroup.children.length; i++) {
			decor = this.decorGroup.children[i];
			angle = this.game.rnd.angle();
			radius = (this.handle.width - 60) / 2;
			decor.x = Math.cos(angle) * Math.random() * radius;
			decor.y = Math.sin(angle) * Math.random() * radius;

			if (this.decorGroup.children.length < 10) {
				for (j = 0; j < i; j++) {
					if (decor.position.distance(this.decorGroup.children[j].position) < 20) {
						i--;
						break;
					}
				}
			}
		}
	} else if (this.type === 'singleNumber') {
		for (i = 0; i < this.decorGroup.children.length; i++) {
			decor = this.decorGroup.children[i];
			decor.x = 0;
			decor.y = 0;
		}
	}

	if (this.nr) {
		this.nr.destroy();
	}
	if (this.type === 'manyNumber' || this.type === 'singleNumber') {
		this.nr = this.game.add.text(0, -87, this.decorGroup.children.length, { font: '30pt ' + GLOBAL.FONT });
		this.nr.anchor.set(0.5);
		this.add(this.nr);
		this.nr.sendToBack();
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Card object                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Card.prototype = Object.create(Container.prototype);
Card.prototype.constructor = Card;
function Card (game, x, y) {
	Container.call(this, game, x, y, 'invitation', 'card'); // Parent constructor.

	this.moreDecorGroup = this.game.add.group(this);
}

Card.prototype.transferFrom = function (container) {
	Container.prototype.transferFrom.call(this, container);

	for (var i = 0; i < this.decorGroup.children.length; i++) {
		var decor = this.decorGroup.children[i];
		decor.x = this.game.rnd.between(-150, 150);
		decor.y = this.game.rnd.between(-100, 100);

		var j;
		if (this.decorGroup.children.length < 10) {
			for (j = 0; j < i; j++) {
				if (decor.position.distance(this.decorGroup.children[j].position) < 40) {
					i--;
					break;
				}
			}
		}

		if (this.moreDecorGroup.length && (this.decorGroup.children.length + this.moreDecorGroup.children.length) < 20) {
			for (j = 0; j < i; j++) {
				if (decor.position.distance(this.decorGroup.children[j].position) < 30) {
					i--;
					break;
				}
			}
		}
	}
};

Card.prototype.stashDecor = function () {
	this.decorGroup.moveAll(this.moreDecorGroup);
};
