var PartyGame = require('./PartyGame.js');
var Mouse = require('../../agent/Mouse.js');
var GLOBAL = require('../../global.js');
var util = require('../../utils.js');

// TODO: A function to make sure things aren't overlapping would help.
// TODO: Collect all static positions at top.

module.exports = PartyInvitationGame;

PartyInvitationGame.prototype = Object.create(PartyGame.prototype);
PartyInvitationGame.prototype.constructor = PartyInvitationGame;

function PartyInvitationGame () {
	PartyGame.call(this); // Call parent constructor.
}

PartyInvitationGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);
	this.load.atlasJSONHash('invitation', 'img/partygames/invitationGame/atlas.png', 'img/partygames/invitationGame/atlas.json');
};

PartyInvitationGame.prototype.create = function () {
	PartyGame.prototype.create.call(this);
	// The invitation game uses helper1, it should be Panda or Mouse as backup.
	if (this.birthday instanceof Mouse) {
		this.changeAgents();
	}

	this.troll.visible = true;
	this.troll.changeShape('stone');

	this.gameGroup.create(0, 0, 'invitation', 'background');

	this.guestThought = this.add.group(this.gameGroup);
	this.guestThought.x = 740;
	this.guestThought.y = 110;
	this.guestThought.visible = false;
	var bubble = this.guestThought.create(-10, 5, 'invitation', 'thought_bubble');
	bubble.anchor.set(0.5);
	bubble.scale.set(-1);
	bubble.angle = -30;
	this.thoughtGroup = this.add.group(this.guestThought); // This will be filled with the decor.

	this.cardStack = this.add.group(this.gameGroup);
	this.cardStack.x = -30;
	this.cardStack.y = 490;

	this.choices = [];
	for (var i = 0; i < 3; i++) {
		var choice = new Tray(this.game, 0, 800);
		choice.scale.set(0);
		choice.handle.events.onInputDown.add(this.pickDecor, this);
		this.gameGroup.add(choice);
		this.choices.push(choice);
	}

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
	this.emitter.setAlpha(1, 0, 3000);
	this.emitter.makeParticles(this.troll.id, 'star');

	if (this.helper1 instanceof Mouse) {
		this.arm = this.gameGroup.create(0, 0, 'invitation', 'mousearm');
	} else {
		this.arm = this.gameGroup.create(0, 0, 'invitation', 'pandaarm');
	}
	this.arm.x = 840;
	this.arm.y = 540;
	this.arm.anchor.y = 0.3;
	this.arm.angle = 45;
	this.arm.scale.set(1.4);

	this.evenMoreDecor = 0;

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
	var amountsArray = [];
	for (var i = 1; i < max; i++) {
		amountsArray.push(i);
	}
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
	// TODO: Does this have two identical values?
};

/**
 * @param {Number} variants - How many different sprites to use.
 * @returns {Array} An array with three sprites.
 */
PartyInvitationGame.prototype.getSprites = function (variants) {
	var possibleSprites = this.rnd.shuffle(['decor1', 'decor2', 'decor3', 'decor4', 'decor5']);

	var sprites = [];
	for (var i = 0; i < variants; i++) {
		sprites.push(possibleSprites[i]);
	}

	while (sprites.length < 3) {
		sprites.push(sprites[0]);
	}

	return sprites;
};

/**
 * @param {Number} chanceThree - The percentage (0-100) of three sprites.
 * @param {Number} chanceTwo - The percentage (0-100) of two sprites.
 * @returns {Array} How many variants of sprites to use.
 */
PartyInvitationGame.prototype.spritePercent = function (chanceThree, chanceTwo) {
	chanceTwo += chanceThree;
	var chance = this.game.rnd.between(1, 100);
	return chance <= chanceThree ? 3 : (chance <= chanceTwo ? 2 : 1);
};

PartyInvitationGame.prototype.generateRound = function () {
	var amounts;
	var sprites;
	var pileType;
	var xPos = this.rnd.shuffle([300, 500, 700]);

	if (this.difficulty <= 1) {
		amounts = this.getAmountsMany();
		sprites = this.getSprites(this.spritePercent(90, 10));
		pileType = 'piles';
	} else if (this.difficulty <= 2) {
		amounts = this.getAmountsMany();
		sprites = this.getSprites(this.spritePercent(80, 20));
		pileType = 'piles';
	} else if (this.difficulty <= 3) {
		amounts = this.getAmountsMany();
		sprites = this.getSprites(this.spritePercent(70, 30));
		pileType = 'piles';
	} else if (this.difficulty <= 4) {
		amounts = this.getAmountsMany();
		sprites = this.getSprites(this.spritePercent(60, 40));
		pileType = 'piles';
	} else if (this.difficulty <= 5) {
		amounts = this.getAmounts(4);
		sprites = this.getSprites(this.spritePercent(50, 40));
		pileType = 'singles';
	} else if (this.difficulty <= 6) {
		amounts = this.getAmounts(5);
		sprites = this.getSprites(this.spritePercent(40, 40));
		pileType = 'singles';
	} else if (this.difficulty <= 7) {
		amounts = this.getAmounts(6);
		sprites = this.getSprites(this.spritePercent(30, 30));
		pileType = 'manyNumber';
	} else if (this.difficulty <= 8) {
		amounts = this.getAmounts(7);
		sprites = this.getSprites(this.spritePercent(20, 20));
		pileType = 'manyNumber';
	} else if (this.difficulty <= 9) {
		amounts = this.getAmounts(8);
		sprites = this.getSprites(this.spritePercent(10, 10));
		pileType = 'singleNumber';
	} else if (this.difficulty <= 10) {
		amounts = this.getAmounts(9);
		sprites = this.getSprites(this.spritePercent(0, 10));
		pileType = 'singleNumber';
	}

	this.correctAmount = amounts[0];
	this.correctSprite = sprites[0];

	for (var i = 0; i < this.choices.length; i++) {
		this.choices[i].setup(pileType, amounts[i], sprites[i], xPos[i]);
	}
};

/** Set up correct decor in thought bubble. */
PartyInvitationGame.prototype.setGoalDecor = function () {
	this.thoughtGroup.removeAll();

	for (var i = 0; i < this.correctAmount; i++) {
		this.thoughtGroup.create(0, 0, 'invitation', this.correctSprite).anchor.set(0.5);
	}

	// Randomize position of the decor and make sure they do not overlap.
	for (var a = 0; a < this.correctAmount; a++) {
		var decor = this.thoughtGroup.children[a];

		var angle = this.game.rnd.angle();
		decor.x = Math.cos(angle)*Math.random()*50;
		decor.y = Math.sin(angle)*Math.random()*50;

		if (this.correctAmount < 10) {
			for (var b = 0; b < a; b++) {
				if (decor.position.distance(this.thoughtGroup.children[b].position) < 30) {
					a--;
					break;
				}
			}
		}
	}
};

/** Set up new card for next round */
PartyInvitationGame.prototype.createCard = function () {
	this.playCard = new Card(this.game, this.game.width / 2, 395);
	this.playCard.scale.set(0);
	this.gameGroup.add(this.playCard);
	this.playCard.handle.events.onInputDown.add(this.pickDecor, this);
};

/** Set up new guest for next round */
PartyInvitationGame.prototype.setGuest = function () {
	this.guest = this.guests[this.cardStack.children.length];
	if (this.guest.name === 'lizard') {
		this.guest.x = this.game.width / 2 - 60;
		this.guest.y = 55;
	} else {
		this.guest.x = this.game.width / 2;
		this.guest.y = 75;
	}
	this.gameGroup.add(this.guest);
};

PartyInvitationGame.prototype.slideChoices = function (into) {
	var t = new TimelineMax();
	for (var i = 0; i < this.choices.length; i++) {
		var choice = this.choices[i];
		t.add(TweenMax.to(choice, 0.5, { y: into ? 685 : 800 }), 0);
		t.add(TweenMax.to(choice.scale, 0.5, { x: into ? 1 : 0, y: into ? 1 : 0 }), 0);
	}
	return t;
};

PartyInvitationGame.prototype.newRound = function (silent) {
	this.setGuest();
	this.createCard();
	this.generateRound();
	this.setGoalDecor();

	var t = new TimelineMax();
	if (!silent) {
		if (this.difficulty <= 4 && this.correctAmount > 5) { // TODO: Look at correct choice instead.
			t.addSound(this.helper1.speech, this.helper1, 'manyOfThese', '+=0.5');
		} else if (this.difficulty <= 4 && this.correctAmount < 5) {
			t.addSound(this.helper1.speech, this.helper1, 'someOfThese', '+=0.5');
		} else {
			t.addSound(this.helper1.speech, this.helper1, 'thisManyOfThese', '+=0.5');
		}
	}

	t.add(util.popin(this.playCard, true, 0.5), 0);
	t.add(util.fade(this.guest, true, 0.2), 0.5);
	t.add(util.fade(this.guestThought, true, 0.5), 0.7);


	t.add(this.slideChoices(true));
	return t;
};

PartyInvitationGame.prototype.anotherRound = function () {
	var t = new TimelineMax();

	t.addLabel('startFade');
	t.add(this.slideChoices(false), 'startFade');
	t.add(util.fade(this.guestThought, false, 0.5), 'startFade');

	// Setup another round.
	t.addCallback(this.generateRound, null, null, this);
	t.addCallback(this.setGoalDecor, null, null, this);
	t.add(util.fade(this.guestThought, true, 0.5));
	t.addCallback(this.slideChoices, null, [true], this);

	if (this.game.rnd.between(1, 100) <= 70) {
		// TODO: This is a bit sloppy, but otherwise the choices won't have updated.
		t.addCallback(function () {
			this.trollStart().addCallback(this.disable, null, [false], this);
		}, null, null, this);
	} else {
		t.addCallback(this.disable, null, [false], this);
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
		if (choice instanceof Card) {
			choice.decorGroup.x = 0;
			choice.decorGroup.y = 0;
		} else {
			this.playCard.transferFrom(choice);
			this.checkDecor();
		}

	} else {
		if (choice instanceof Tray) {
			choice.decorGroup.x = 0;
			choice.decorGroup.y = 0;
		} else {
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
	var moreDecorNr = this.game.rnd.between(1, 100);
	var evenMoreDecorNr = this.game.rnd.between(1, 100);
	var finishedCards = this.cardStack.children.length - 1;

	// TODO: Reduce code.

	var t = new TimelineMax();
	if (this.playCard.decorGroup.length) { // TODO: Is this check necessary?
		if (this.playCard.decorGroup.children.length === this.correctAmount && this.playCard.decorGroup.children[0].frameName === this.correctSprite) { // Correct :)
			t.addCallback(this.disable, null, [true], this);

			if (finishedCards > 0 && moreDecorNr <= 60 && !this.playCard.moreDecorGroup.length) {
				t.addCallback(this.guest.setMood, null, ['neutral'], this.guest);
				t.addSound(this.helper1.speech, this.helper1, 'rightButMore', 0);

				while (this.playCard.decorGroup.children.length) {
					this.playCard.moreDecorGroup.add(this.playCard.decorGroup.children[0]);
				}
				t.add(this.anotherRound());

			} else if (finishedCards > 0 && evenMoreDecorNr <= 60 && this.playCard.moreDecorGroup.children < 25 && this.evenMoreDecor < 2) {
				this.evenMoreDecor = this.evenMoreDecor + 1;

				t.addCallback(this.guest.setMood, null, ['neutral'], this.guest);
				t.addSound(this.helper1.speech, this.helper1, 'rightButMore');

				while (this.playCard.decorGroup.children.length) {
					this.playCard.moreDecorGroup.add(this.playCard.decorGroup.children[0]);
				}
				t.add(this.anotherRound());

			} else {
				this.playCard.handle.events.destroy();

				t.addCallback(this.guest.setMood, null, ['happy'], this.guest);
				t.addSound(this.helper1.speech, this.helper1, 'looksNice');
				t.addSound(this.helper1.speech, this.helper1, 'dragCard', '+=0.2');
				t.addCallback(this.dragCard, null, null, this);
			}

		} else if (this.playCard.decorGroup.children.length > this.correctAmount) { // Incorrect, too many.
			t.addCallback(this.guest.setMood, null, ['sad'], this.guest);
			t.addSound(this.helper1.speech, this.helper1, 'tryLess');
			t.addSound(this.helper1.speech, this.helper1, 'dragStickersBack', '+=0.5'); // TODO: This speech needs to be cut of correctly if moving while it is active.

		} else if (this.playCard.decorGroup.children.length < this.correctAmount) { // Incorrect, too few.
			t.addCallback(this.guest.setMood, null, ['sad'], this.guest);
			t.addSound(this.helper1.speech, this.helper1, 'tryMore');
			t.addSound(this.helper1.speech, this.helper1, 'dragStickersBack', '+=0.5'); // TODO: This speech needs to be cut of correctly if moving while it is active.
		}
	}
};

/** Drag finished card to stack. */
PartyInvitationGame.prototype.dragCard = function () {
	this.disable(false);
	this.playCard.parent.bringToTop(this.playCard);

	this.playCard.handle.events.onInputDown.add(function () {
		this.playCard.update = function () {
			this.x = this.game.input.activePointer.x;
			this.y = this.game.input.activePointer.y;
		};
	}, this);

	this.playCard.handle.events.onInputUp.add(function () {
		this.addCardToStack();
	}, this);
};

/** Add the finished card to stack. */
PartyInvitationGame.prototype.addCardToStack = function () {
	this.playCard.update = function () {};
	this.disable(true);

	var t = new TimelineMax();
	t.to(this.playCard.scale, 1, { x: 0.7, y: 0.7, ease: Power0.easeInOut, delay: 0.1 });
	t.to(this.playCard, 1, { x: this.cardStack.x + (this.cardStack.length * 5), y: this.cardStack.y + (this.cardStack.length * 5), ease: Power0.easeInOut });

	t.addCallback(function () {
		this.playCard.x = this.cardStack.length * 5;
		this.playCard.y = this.cardStack.length * 5;
		this.cardStack.add(this.playCard);
	}, null, null, this);

	t.add(this.destroyRound());
	t.addCallback(this.nextRound, null, null, this);
};

PartyInvitationGame.prototype.destroyRound = function ()  {
	this.playCard.handle.events.destroy();
	this.evenMoreDecor = 0;

	// TODO: Is destroy necessary?
	var t = new TimelineMax();
	t.add(this.slideChoices(false));
	t.add(util.fade(this.guest, false, 0.5), 0);
	t.addCallback(this.guest.destroy, null, null, this.guest);
	t.add(util.fade(this.guestThought, false, 0.5), 0);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
PartyInvitationGame.prototype.trollStart = function () {
	// Randomize troll appearance.
	var t = new TimelineMax();
	if (this.game.rnd.between(1, 100) <= 40) {
		this.trollTarget = this.choices[this.rnd.integerInRange(1, 2)];
		t.add(this.troll.appear('random', this.trollTarget.x, 685)); // TODO: This should be in a pos
		t.add(this.trollTypePicker());
	}
	return t;
};

PartyInvitationGame.prototype.trollTypePicker = function () {
	return this.game.rnd.between(1, 100) <= 50 ? this.trollChangeSprite() : this.trollChangePlace();
};

PartyInvitationGame.prototype.trollChangePlace = function () {
	var otherPile;
	do {
		otherPile = this.game.rnd.pick(this.choices);
	} while (this.trollTarget === otherPile);

	var t = new TimelineMax();
	t.addLabel('changePlace');
	t.to(this.trollTarget, 1, { x: otherPile.x, ease: Power2.easeOut });
	t.to(otherPile, 1, { x: this.trollTarget.x, ease: Power2.easeOut }, 'changePlace');
	t.addSound(this.helper1.speech, this.helper1, 'ohNo');
	t.addSound(this.helper1.speech, this.helper1, (Math.random() < 0.5 ? 'aBitWeird' : 'helpMeCorrect'));
	return t;
};

PartyInvitationGame.prototype.trollChangeSprite = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		var i;
		if (this.trollTarget.decorGroup.children[0].frameName !== 'decor5') {
			for (i = 0; i < this.trollTarget.decorGroup.length; i++) {
				this.trollTarget.decorGroup.children[i].frameName = 'decor5';
			}
		} else {
			for (i = 0; i < this.trollTarget.decorGroup.length; i++) {
				this.trollTarget.decorGroup.children[i].frameName = 'decor3';
			}
		}
	}, null, null, this);
	t.addSound(this.helper1.speech, this.helper1, 'ohNo');
	t.addSound(this.helper1.speech, this.helper1, (Math.random() < 0.5 ? 'aBitWeird' : 'helpMeCorrect'));
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

	t.addLabel('a2', '+=1');
	t.addSound(this.helper1.speech, this.helper1, 'soonBirthday', 'a2');
	t.addSound(this.helper1.speech, this.helper1, 'wereHavingParty', '+=0.5');

	t.add(this.troll.transform('stoneToTroll'), '+=1');
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

	t.addLabel('gone');
	t.addLabel('gone2', '+=0.5');
	t.addSound(this.sfx, null, 'pop', 'gone');
	t.add(new TweenMax(this.mailbox, 0.1, { alpha: 0 }), 'gone');
	t.add(new TweenMax(this.bear, 0.1, { alpha: 1 }), 'gone');
	t.to(this.troll.leftArm, 0.3, { rotation: -1.1, ease: Power4.easeIn });
	t.addSound(this.troll.speech, this.troll, 'oops1', 'gone2');

	t.addCallback(function () {
		this.helper1.eyesStopFollow();
		this.helper2.eyesStopFollow();
	}, null, null, this);
	t.addSound(this.troll.speech, this.troll, 'iNeedHelp', '+=0.5');

	t.addSound(this.helper1.speech, this.helper1, 'gottaInvite', '+=1');
	t.addLabel('maker');
	// t.add(this.helper2.move({ x: '+=' + 170, y: '+=' + 20, ease: Power0.easeNone }, 2), 'maker');
	t.addSound(this.helper1.speech, this.helper1, 'makeCards', 'maker');

	t.add(new TweenMax(this.gladeIntro, 2, { alpha: 0 }), '+=3');

	t.addSound(this.helper1.speech, this.helper1, 'allGuestsGet');
	t.add(this.newRound());

	t.addCallback(function () {
		this.troll.visible = false;
		this.troll.scale.set(0.22);
		this.gameGroup.add(this.troll);

		var rightPile = this.choices[0];
		var positionX = this.choices[0].x;
		var positionY = this.choices[0].y;
		this.gameGroup.bringToTop(rightPile);
		this.gameGroup.bringToTop(this.arm);

		var t = new TimelineMax();
		t.skippable();
		t.to(this.arm, 3, { x: positionX, y: positionY, ease: Power1.easeIn });
		t.addSound(this.helper1.speech, this.helper1, 'imTrying');
		t.addCallback(function () { rightPile.follow(this.arm); }, null, null, this);
		t.to(this.arm, 2, { x: this.playCard.x, y: this.playCard.y, ease: Power1.easeIn });
		t.addCallback(function () { this.playCard.transferFrom(rightPile); }, null, null, this);
		t.addCallback(function () { rightPile.follow(); }, null, null, this);
		t.addCallback(function () { this.guest.setMood('happy'); }, null, null, this);
		t.addSound(this.helper1.speech, this.helper1, 'looksNice');
		t.addSound(this.helper1.speech, this.helper1, 'imPutting', '+=0.5');

		t.addLabel('drag');
		t.to([this.arm, this.playCard], 2, { x: this.cardStack.x, y: this.cardStack.y, ease: Power1.easeIn });
		t.to(this.playCard.scale, 1, { x: 0.7, y: 0.7, ease: Power0.easeInOut }, 'drag');
		t.addCallback(function () {
			this.cardStack.add(this.playCard);
			this.playCard.x = 0;
			this.playCard.y = 0;
		}, null, null, this);
		t.to(this.arm, 2, { x: 860, y: 560, ease: Power1.easeIn });

		t.addCallback(this.destroyRound, null, null, this);
		t.addCallback(this.nextRound, '+=2', null, this);
		this._counter.value++; // Because this part is in the intro, manually increase counter.
	}, null, null, this);
};

PartyInvitationGame.prototype.modePlayerDo = function (intro) {
	var t = new TimelineMax();
	t.add(this.newRound());

	if (intro) {
		t.addSound(this.helper1.speech, this.helper1, 'helpMeStickers');
	} else {
		t.add(this.trollStart());
	}
	t.addCallback(this.disable, null, [false], this);
};

PartyInvitationGame.prototype.modeOutro = function () {
	var t = new TimelineMax();
	t.addSound(this.helper1.speech, this.helper1, 'madeNiceCards');

	t.addLabel('startFade');
	t.add(new TweenMax(this.guestThought, 2, { alpha: 0 }), 'startFade');
	t.to(this.arm, 2, { x: this.cardStack.x, y: this.cardStack.y, ease: Power1.easeIn }, 'startFade');

	t.to([this.arm, this.cardStack], 2, { x: '+=' + 1100, y: '+=' + 500, ease: Power1.easeIn });
	t.add(this.troll.water(400, this));

	t.addLabel('glade', '+=2');
	this.cards = this.gameGroup.create(610, 570, 'invitation', 'card');
	this.cards.scale.set(0.08);
	this.gladeIntro.add(this.cards);

	t.addCallback(function () {
		this.helper1.x = 370;
		this.helper1.y = 540;
		this.helper1.scale.set(0.15);
		this.gladeIntro.add(this.helper1);

		this.troll.x = 580;
		this.troll.y = 570;
		this.troll.scale.set(0.12);
		this.gladeIntro.add(this.troll);

		this.gladeIntro.bringToTop(this.cards);

		this.helper2.visible = false;
		this.mailbox.alpha = 1;
		this.bear.alpha = 0;
	}, 'glade', null, this);

	t.add(new TweenMax(this.gladeIntro, 2, { alpha:1 }), 'glade');
	t.addSound(this.troll.speech, this.troll, 'isGood', '+=0.3');

	t.addLabel('walk');
	t.add(this.troll.move({ x: '+=' + 170, y: '-=' + 120, ease: Power0.easeNone }, 2), 'walk');
	t.to(this.cards, 2, { x: '+=' + 170, y: '-=' + 120, ease: Power0.easeNone }, 'walk');
	t.addCallback(this.troll.eyesFollowObject, null, [this.mailbox], this.troll);
	t.addLabel('post');
	t.to(this.troll.rightArm, 0.8,  { rotation: -0.3, ease: Power1.easeIn }, 'post');
	t.to(this.cards, 0.8, { x: '+=' + 36, y: '-=' + 50, ease: Power0.easeNone }, 'post');
	t.addLabel('scale');
	t.to(this.cards, 0.5, { width: 0.6, height: 0, ease: Power0.easeNone }, 'scale');
	t.to(this.cards, 0.2, { x: '+=' + 10, ease: Power0.easeNone}, 'scale');
	t.addCallback(function () { this.mailbox.frameName = 'mailbox_open'; }, 'post', null, this);
	t.addLabel('close', '+=1');
	t.to(this.troll.rightArm, 1, { rotation: 1.1, ease: Power1.easeIn}, 'close');
	t.addCallback(function () { this.mailbox.frameName = 'mailbox'; }, 'close', null, this);
	t.addCallback(this.troll.eyesStopFollow, null, null, this.troll);

	t.add(this.troll.move({ x: '-=' + 170, y: '+=' + 120, ease: Power0.easeNone }, 2));
	t.addSound(this.troll.speech, this.troll, 'continue', '-=1');
	t.addSound(this.helper1.speech, this.helper1, 'thanksForHelp', '+=0.5');

	t.addCallback(this.nextRound, '+=3', null, this); // Ending game.
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                         Create container object                           */
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

	this.moreDecorGroup = this.game.add.group(this);
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
/*                            Create tray object                             */
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
/*                            Create card object                             */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
Card.prototype = Object.create(Container.prototype);
Card.prototype.constructor = Card;
function Card (game, x, y) {
	Container.call(this, game, x, y, 'invitation', 'card'); // Parent constructor.
}

Card.prototype.transferFrom = function (container) {
	Container.prototype.transferFrom.call(this, container);

	for (var i = 0; i < this.decorGroup.children.length; i++) {
		var decor = this.decorGroup.children[i];
		decor.x = this.game.rnd.between(-150, 150);
		decor.y = this.game.rnd.between(-100, 100);

		// TODO: Could probably improve this.
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
