var PartyGame = require('./PartyGame.js');
var Troll = require('../../agent/Troll.js');
var Panda = require('../../agent/Panda.js');
var Mouse = require('../../agent/Mouse.js');
var GLOBAL = require('../../global.js');

module.exports = PartyInvitationGame;



PartyInvitationGame.prototype = Object.create(PartyGame.prototype);
PartyInvitationGame.prototype.constructor = PartyInvitationGame;

function PartyInvitationGame () {
	PartyGame.call(this); // Call parent constructor.
}



PartyInvitationGame.prototype.preload = function () {

	PartyGame.prototype.preload.call(this);

	this.load.atlasJSONHash('invitation', 'img/partygames/invitationGame/atlas.png', 'img/partygames/invitationGame/atlas.json');
	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
	this.load.atlasJSONHash('lizard', 'img/subgames/lizardjungle/atlas.png', 'img/subgames/lizardjungle/atlas.json');
};


PartyInvitationGame.prototype.create = function () {

    PartyGame.prototype.create.call(this);

	this.bg = this.gameGroup.create(0, 0, 'invitation', 'background');
	
	this.thoughtBubble = this.gameGroup.create(730, 115, 'invitation', 'thought_bubble');
	this.thoughtBubble.scale.set(-1, -1);
	this.thoughtBubble.anchor.set(0.5);
	this.thoughtBubble.alpha = 0;
	this.thoughtBubble.angle = -30;

	this.cardStack = this.add.group(this.gameGroup);
	this.cardStack.x = -30;
	this.cardStack.y = 490;

	this.t = new Troll (this.game);
	this.gameGroup.add(this.t);
	this.t.visible = false;
	this.t.scale.set(0.22);

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
    this.emitter.setAlpha(1, 0, 3000);
    this.emitter.makeParticles(Troll.prototype.id, 'star');

    this.finishedCards = -1;

    this.evenMoreDecor = 0;
    

};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Change difficulty functions                        */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



//Change level of difficulty, amounts
PartyInvitationGame.prototype.getAmounts = function (max) {

	var amountsArray = [];

	for (var i = 1; i < max; i++) {

		amountsArray.push(i);
	}

	Phaser.Utils.shuffle(amountsArray);

	var amounts = amountsArray.splice(0, 3);

	return amounts;
};


//Change level of difficulty, amounts
PartyInvitationGame.prototype.getAmountsMany = function () {

	var many = this.game.rnd.between(10, 20);
	var few = this.game.rnd.between(2, 3);

	var manyCorrect = [many, few, few];
	var fewCorrect = [few, many, many];

	var correct = [manyCorrect, fewCorrect];

	var amountsMany = this.game.rnd.pick(correct);

	return amountsMany;
};


//Change level of difficulty, sprites
PartyInvitationGame.prototype.getSprites = function (differentNr) {

	var possibleSprites = ['decor1', 'decor2', 'decor3', 'decor4', 'decor5'];

	Phaser.Utils.shuffle(possibleSprites);

	var sprites = [];

	for (var i = 0; i < differentNr; i++) {

		sprites.push(possibleSprites[i]);
	}

	while (sprites.length < 3) {

		sprites.push(sprites[0]);
	}

	return sprites;
};



PartyInvitationGame.prototype.spritePercent = function (p3, p2) {

	var getRandom = this.game.rnd.between(1, 100);

	var spritePercent;

	if (getRandom <= p3) {

		spritePercent = 3;
	}

	else if (getRandom <= p2 + p3) {

		spritePercent = 2;
	}

	else {

		spritePercent = 1;
	}

	return spritePercent;
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyInvitationGame.prototype.generateRound = function () {

	var amounts;
	var sprites;
	var spritePercent;
	var pileType;

	if (this.difficulty <= 1) {
		
		spritePercent = this.spritePercent(90, 10);
		amounts = this.getAmountsMany();
		sprites = this.getSprites(spritePercent);
		pileType = 'piles';
	}

	else if (this.difficulty <= 2) {
		
		spritePercent = this.spritePercent(80, 20);
		amounts = this.getAmountsMany();
		sprites = this.getSprites(spritePercent);
		pileType = 'piles';
	}

	else if (this.difficulty <= 3) {
		
		spritePercent = this.spritePercent(70, 30);
		amounts = this.getAmountsMany();
		sprites = this.getSprites(spritePercent);
		pileType = 'piles';
	}

	else if (this.difficulty <= 4) {
		
		spritePercent = this.spritePercent(60, 40);
		amounts = this.getAmountsMany();
		sprites = this.getSprites(spritePercent);
		pileType = 'piles';
	}

	else if (this.difficulty <= 5) {

		spritePercent = this.spritePercent(50, 40);
		amounts = this.getAmounts(4);
		sprites = this.getSprites(spritePercent);
		pileType = 'singles';
	}

	else if (this.difficulty <= 6) {
		
		spritePercent = this.spritePercent(40, 40);
		amounts = this.getAmounts(5);
		sprites = this.getSprites(spritePercent);
		pileType = 'singles';
	}

	else if (this.difficulty <= 7) {
		
		spritePercent = this.spritePercent(30, 30);
		amounts = this.getAmounts(6);
		sprites = this.getSprites(spritePercent);
		pileType = 'manyNumber';
	}

	else if (this.difficulty <= 8) {
		
		spritePercent = this.spritePercent(20, 20);
		amounts = this.getAmounts(7);
		sprites = this.getSprites(spritePercent);
		pileType = 'manyNumber';
	}

	else if (this.difficulty <= 9) {
		
		spritePercent = this.spritePercent(10, 10);
		amounts = this.getAmounts(8);
		sprites = this.getSprites(spritePercent);
		pileType = 'singleNumber';
	}

	else if (this.difficulty <= 10) {
		
		spritePercent = this.spritePercent(0, 10);
		amounts = this.getAmounts(9);
		sprites = this.getSprites(spritePercent);
		pileType = 'singleNumber';
	}


	this.correctAmount = amounts[0];
	this.correctSprite = sprites[0];

	this.createChoices(amounts, sprites, pileType);
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create card and piles                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
   


//Set up piles
PartyInvitationGame.prototype.createChoices = function  (amounts, sprites, pileType) {

	var positionX = [300, 500, 700];

	Phaser.Utils.shuffle(positionX);

	this.choices = [];

	for (var i = 0; i < 3; i++) {

		this.choices.push(new Tray(this.game, positionX[i], 685, amounts[i], sprites[i], pileType));
		this.gameGroup.add(this.choices[i]);
		this.choices[i].handle.events.onInputDown.add(this.pickDecor, this);
	}
};



//Set up correct decor in thought bubble
PartyInvitationGame.prototype.correctDecor = function () {

	this.thoughtGroup = this.add.group(this.gameGroup);
	this.thoughtGroup.x = 740;
	this.thoughtGroup.y = 110;

	for (var i = 0; i < this.correctAmount; i++) {
		
		this.thoughtGroup.create(0, 0, 'invitation', this.correctSprite);
	}

	for (var a = 0; a < this.correctAmount; a++) {
		
		var angle = this.game.rnd.angle();

		var decor = this.thoughtGroup.children[a];
		decor.anchor.set(0.5);
		decor.x = Math.cos(angle)*Math.random()*50;
		decor.y = Math.sin(angle)*Math.random()*50;


		if (this.correctAmount < 10) {
			
			for (var b = 0; b < a; b++) {

				var pos = decor.position.distance(this.thoughtGroup.children[b].position);

				if (pos < 30) {

					a--;
					break;
				}
			}
		}
	}
};



//Set up new card for next round
PartyInvitationGame.prototype.createCard = function () {
	
	this.playCard = new Card(this.game, this.game.width / 2, 395);
	this.gameGroup.add(this.playCard);
	this.playCard.handle.events.onInputDown.add(this.pickDecor, this);

	this.cards = this.gameGroup.create(610, 570, 'invitation', 'card');
	this.cards.scale.set(0.08);
	this.cards.visible = false;
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                               Guest functions                             */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



//Set up new guest for next round
PartyInvitationGame.prototype.createGuest = function () {

	if (this.finishedCards === -1) {

		this.guest = this.guests[0];
	}

	else if (this.finishedCards === 0) {

		this.guest = this.guests[1];
	}

	else if (this.finishedCards === 1) {

		this.guest = this.guests[2];
	}

	else if (this.finishedCards === 2) {

		this.guest = this.guests[3];
	}

	else if (this.finishedCards === 3) {

		this.guest = this.guests[4];
	}

	this.gameGroup.add(this.guest);

	this.guest.visible = true;

	this.guest.x = this.game.width / 2;
	this.guest.y = 75;

	if (this.guest.name === 'lizard') {

		this.guest.x = (this.game.width / 2) - 60;
		this.guest.y = 55;
	}
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                               Instructions                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



//Animated intro instruction
PartyInvitationGame.prototype.introShow = function () {

	var rightPile = this.choices[0];
	var positionX = this.choices[0].x;
	var positionY = this.choices[0].y;
	
	var t = new TimelineMax();

	t.addCallback(function () {
		
		this.gameGroup.bringToTop(this.arm);
	}, null, null, this);

	t.to(this.arm, 3, {x:positionX, y:positionY, ease: Power1.easeIn});
	t.addSound(this.a.speech, this.a, 'imTrying');
	
	t.addLabel('toCard');
	t.to(this.arm, 2, {x:this.playCard.x, y:this.playCard.y, ease: Power1.easeIn}, 'toCard');

	t.addCallback(function () {
		
		rightPile.follow(this.arm);
	}, 'toCard', null, this);

	t.addCallback(function () {
		
		this.playCard.transferFrom(rightPile);
	}, null, null, this);

	t.addCallback(function () {
		
		this.guest.setMood('happy');
	}, null, null, this);
	
	t.addSound(this.a.speech, this.a, 'looksNice');
	t.addSound(this.a.speech, this.a, 'imPutting', '+=0.5');

	t.addLabel('drag');
	t.addCallback(function () {
		
		this.gameGroup.bringToTop(this.playCard);
		this.gameGroup.bringToTop(this.arm);
	}, null, null, this);
	t.to([this.arm, this.playCard], 2, {x:this.cardStack.x, y:this.cardStack.y, ease: Power1.easeIn});
	t.to(this.playCard.scale, 1, {x: 0.7, y: 0.7, ease: Power0.easeInOut}, 'drag');
	t.addCallback(function () {
		
		this.cardStack.add(this.playCard);
		this.playCard.x = 0;
		this.playCard.y = 0;
	}, null, null, this);
	t.to(this.arm, 2, {x:860, y:560, ease: Power1.easeIn});
	t.addCallback(function () {
		
		this.destroyRound();
	}, null, null, this);
	t.addCallback(this.nextRound, '+=2', null, this);

	return t;
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Round functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyInvitationGame.prototype.numberOf = function () {

	var t = new TimelineMax();

	t.addCallback(function () {
		
		if (this.difficulty <= 4 && this.correctAmount > 5) {

	 		t.addSound(this.a.speech, this.a, 'manyOfThese', '+=0.5');
	 	}

	 	else if (this.difficulty <= 4 && this.correctAmount < 5) {

	 		t.addSound(this.a.speech, this.a, 'someOfThese', '+=0.5');
	 	}

	 	else {

	 		t.addSound(this.a.speech, this.a, 'thisManyOfThese', '+=0.5');
	 	}
	}, null, null, this);

	return t;
};




//Pick one of the piles
PartyInvitationGame.prototype.pickDecor = function (origin) {

	if (!this.playCard.decorGroup.length || this.game.input.activePointer.y < 550) {

		var choice = origin.parent;

		origin.events.onInputUp.add(this.dropDecor, this);

		this.gameGroup.bringToTop(choice);
		
		choice.follow(this.game.input.activePointer);
	}
		
};



//Drop the pile on the card
PartyInvitationGame.prototype.dropDecor = function (origin) {

	var choice = origin.parent;

	origin.events.onInputUp.remove(this.dropDecor, this);

	choice.follow();

	if (this.game.input.activePointer.y < 550) {

		if (choice instanceof Card) {
			
			choice.decorGroup.x = 0;
			choice.decorGroup.y = 0;
		}

		else {

			this.playCard.transferFrom(choice);
			this.checkDecor();
		}
	}

	else {

		if (choice instanceof Tray) {
			
			choice.decorGroup.x = 0;
			choice.decorGroup.y = 0;
		}

		else {

			for (var i = 0; i < this.choices.length; i++) {

				if (!this.choices[i].decorGroup.length) {

					this.choices[i].transferFrom(choice);

					break;
				}
			}
		}
	}
};



//Check if dropped decor is correct
PartyInvitationGame.prototype.checkDecor = function () {
	
	//TODO: Make separate else ifs for if statements.

	this.moreDecorNr = this.game.rnd.between(1, 100);
	this.evenMoreDecorNr = this.game.rnd.between(1, 100);

	this.finishedCards = this.cardStack.children.length - 1;

	var t = new TimelineMax();

	if (this.playCard.decorGroup.length) {

		if (this.playCard.decorGroup.children.length === this.correctAmount && this.playCard.decorGroup.children[0].frameName === this.correctSprite) {

			t.addCallback(function () {

				this.disable(true);
			}, null, null, this);

			if (this.finishedCards > 0 && this.moreDecorNr <= 60 && !this.playCard.moreDecorGroup.length) {
			
				t.addCallback(function () {

		 			this.guest.setMood('neutral');
				}, null, null, this);
		 		t.addSound(this.a.speech, this.a, 'rightButMore', 0);

				while (this.playCard.decorGroup.children.length) {

					this.playCard.moreDecorGroup.add(this.playCard.decorGroup.children[0]);
				}

				t.add(this.moreDecor());
	 		}

	 		else if (this.finishedCards > 0 && this.evenMoreDecorNr <= 60 && this.playCard.moreDecorGroup.children < 25 && this.evenMoreDecor < 2) {
			
				this.evenMoreDecor = this.evenMoreDecor + 1;

				t.addCallback(function () {

		 			this.guest.setMood('neutral');
				}, null, null, this);
		 		t.addSound(this.a.speech, this.a, 'rightButMore', 0);

				while (this.playCard.decorGroup.children.length) {

					this.playCard.moreDecorGroup.add(this.playCard.decorGroup.children[0]);
				}

				t.add(this.moreDecor());
	 		}

			else {

				this.playCard.handle.events.destroy();
			
				t.addCallback(function () {

		 			this.guest.setMood('happy');
				}, null, null, this);
		 		t.addSound(this.a.speech, this.a, 'looksNice');
		 		t.addSound(this.a.speech, this.a, 'dragCard', '+=0.2');
		 		t.addCallback(this.dragCard, null, null, this);
	 		}
		}


		else if (this.playCard.decorGroup.children.length > this.correctAmount) {

			t.addCallback(function () {

		 			this.guest.setMood('sad');
				}, null, null, this);
	 		t.addSound(this.a.speech, this.a, 'fewer', 0);
	 		t.addSound(this.a.speech, this.a, 'dragStickersBack', '+=0.5');
		}

		else if (this.playCard.decorGroup.children.length < this.correctAmount) {

			t.addCallback(function () {

		 			this.guest.setMood('sad');
				}, null, null, this);
	 		t.addSound(this.a.speech, this.a, 'tryMore', 0);
	 		t.addSound(this.a.speech, this.a, 'dragStickersBack', '+=0.5');
		}
	}
};



PartyInvitationGame.prototype.moreDecor = function () {

	var t = new TimelineMax();

	var trollAgain = this.game.rnd.between(1, 100);

 	t.addLabel('startFade');

	for (var i = 0; i < 3; i++) {

		t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
		t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
	}

	t.add(new TweenMax(this.thoughtGroup, 2, {alpha:0}), 'startFade');
	t.addCallback(this.thoughtGroup.destroy, null, null, this.thoughtGroup);

	t.addCallback(this.generateRound, null, null, this);
	t.addCallback(this.correctDecor, null, null, this);
	t.addCallback(function () {

			this.disable(false);
		}, null, null, this);

	if (trollAgain <= 70) {

	 	t.addCallback(this.trollStart, null, null, this);
	 }

 	return t;
	
};



//Drag finished card to stack
PartyInvitationGame.prototype.dragCard = function () {

	this.disable(false);

	this.gameGroup.bringToTop(this.playCard);

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



//Add the finished card to stack
PartyInvitationGame.prototype.addCardToStack = function () {

	this.playCard.update = function () {};

	var t = new TimelineMax();

	t.addCallback(function () {

			this.disable(true);
		}, null, null, this);
	t.addLabel('scale');
	t.to(this.playCard.scale, 1, {x: 0.7, y: 0.7, ease: Power0.easeInOut, delay: 0.1});
	t.to(this.playCard, 1, {x: this.cardStack.x + (this.cardStack.length * 5), y: this.cardStack.y + (this.cardStack.length * 5), ease: Power0.easeInOut}, 'scale');
	t.addCallback(function () {
		
		this.playCard.x = this.cardStack.length * 5;
		this.playCard.y = this.cardStack.length * 5;

		this.cardStack.add(this.playCard);
	}, null, null, this);
	
	t.add(this.destroyRound());
 	t.addCallback(this.nextRound, '+=2', null, this);
};



//Destroy last round
PartyInvitationGame.prototype.destroyRound = function ()  {

	this.playCard.handle.events.destroy();

	this.evenMoreDecor = 0;

	var t = new TimelineMax();

 	t.addLabel('startFade');

	for (var i = 0; i < 3; i++) {

		t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
		t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
	}

	t.add(new TweenMax(this.thoughtGroup, 2, {alpha:0}), 'startFade');
	t.addCallback(this.thoughtGroup.destroy, null, null, this.thoughtGroup);

	t.add(new TweenMax(this.guest, 2, {alpha:0}), 'startFade');
	t.addCallback(this.guest.destroy, null, null, this.guest);

	t.add(new TweenMax(this.thoughtBubble, 2, {alpha:0}), 'startFade');

	return t;
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyInvitationGame.prototype.trollStart = function () {

	var t = new TimelineMax();

	var trollNr = this.game.rnd.between(1, 100);

	if (this.finishedCards > 0 && trollNr <= 40) {

		this.disable(true);
		
		this.trollTarget = this.game.rnd.pick(this.choices);

		while (this.trollTarget.decorGroup.length === this.correctAmount) {

			this.trollTarget = this.game.rnd.pick(this.choices);
		}

		t.add(this.t.appear('random', this.trollTarget.x, this.trollTarget.y));
		t.add(this.trollTypePercent());
	}

};



PartyInvitationGame.prototype.trollTypePercent = function () {

	var t = new TimelineMax();

	var nr = this.game.rnd.between(1, 100);

	if (nr <= 50) {

		t.add(this.trollChangeSprite());
	}

	else if (nr > 50) {

		t.add(this.trollChangePlace());
	}

	return t;
};



PartyInvitationGame.prototype.trollChangePlace = function () {

	var otherPile = this.game.rnd.pick(this.choices);

	while (this.trollTarget === otherPile) {

		otherPile = this.game.rnd.pick(this.choices);
	}

	var t = new TimelineMax();

	t.addLabel('changePlace');
	t.to(this.trollTarget, 1, {x:otherPile.x, y:otherPile.y, ease: Power2.easeOut});
	t.to(otherPile, 1, {x:this.trollTarget.x, y:this.trollTarget.y, ease: Power2.easeOut}, 'changePlace');

	t.addSound(this.a.speech, this.a, 'ohNo');

	t.addCallback(function () {

		this.disable(false);
	}, '+=1', null, this);

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
		}

		else if (this.trollTarget.decorGroup.children[0].frameName === 'decor5') {

			for (i = 0; i < this.trollTarget.decorGroup.length; i++) {

				this.trollTarget.decorGroup.children[i].frameName = 'decor3';
			}
		}
		
	}, null, null, this);

	t.addSound(this.a.speech, this.a, 'ohNo');

	t.addCallback(function () {

		this.disable(false);
	}, '+=1', null, this);

	return t;
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyInvitationGame.prototype.modeIntro = function () {

	var t = new TimelineMax();

	t.add(this.partyIntro());

	t.add(this.invitationIntro());

	if (this.agent instanceof Panda) {

		this.a = new Mouse (this.game);
		this.arm = this.gameGroup.create(0, 0, 'invitation', 'mousearm');
	}

	else {

		this.a = new Panda (this.game);
		this.arm = this.gameGroup.create(0, 0, 'invitation', 'pandaarm');
	}

	this.arm.x = 840;
	this.arm.y = 540;
	this.arm.anchor.y = 0.3;
	this.arm.angle = 45;
	this.arm.scale.set(1.4);
 	
 	t.addCallback(this.createGuest, '+=2', null, this);
 	t.add(new TweenMax(this.thoughtBubble, 2, {alpha:1}), '+=1');

 	t.addSound(this.a.speech, this.a, 'allGuestsGet', '+=0.8');

	t.addCallback(this.createCard, null, null, this);
 	t.addCallback(this.generateRound, null, null, this);
	t.addCallback(this.correctDecor, null, null, this);
	t.addCallback(function () {
		
		this.gameGroup.bringToTop(this.arm);
	}, null, null, this);
		
	t.add(this.numberOf());

 	t.addCallback(this.introShow, '+=5', null, this);
};



PartyInvitationGame.prototype.modePlayerDo = function () {

	this.disable(false);

	this.finishedCards = this.cardStack.children.length - 1;

	var t = new TimelineMax();

	if (this.finishedCards < 4) {

		t.addCallback(this.createGuest, '+=1', null, this);

		t.addCallback(this.createCard, '+=1', null, this);
		t.addCallback(this.generateRound, null, null, this);
		t.add(new TweenMax(this.thoughtBubble, 2, {alpha:1}));
		t.addCallback(this.correctDecor, null, null, this);
		t.addCallback(function () {
		
			this.gameGroup.bringToTop(this.arm);
		}, null, null, this);

		t.add(this.numberOf());
	 	
	 	if (this.finishedCards === 0) {
	
			t.addSound(this.a.speech, this.a, 'helpMeStickers', '+=5');
		}

		t.addCallback(this.trollStart, '+=4', null, this);
	}

	else if (this.finishedCards === 4) {

		t.addCallback(function () {

			this.disable(true);
		}, null, null, this);

		t.addCallback(this.modeOutro, '+=1', null, this);
	}
};



PartyInvitationGame.prototype.modeOutro = function () {

	var t = new TimelineMax();
	
	t.addSound(this.a.speech, this.a, 'madeNiceCards');
	
	t.addLabel('startFade');
	t.add(new TweenMax(this.thoughtBubble, 2, {alpha:0}), 'startFade');

	t.to(this.arm, 2, {x:this.cardStack.x, y:this.cardStack.y, ease: Power1.easeIn}, 'startFade');
	t.to([this.arm, this.cardStack], 2, {x: '+=' + 1100, y: '+=' + 500, ease: Power1.easeIn});

	t.add(this.t.water(400, this));

	t.addLabel('glade', '+=2');
	t.addCallback(function () {

		this.gladeIntro.add(this.a);
		this.gladeIntro.add(this.t);
		this.gladeIntro.add(this.cards);
		
		this.a.x = 370;
		this.a.y = 540;
	    this.a.scale.set(0.15);

	    this.t.x = 580;
		this.t.y = 570;
	    this.t.scale.set(0.12);

	   
	}, 'glade', null, this);

	t.addCallback(function () {

		this.a1.visible = false;
		this.a2.visible = false;
		this.t2.visible = false;
		this.mailbox.alpha = 1;
		this.bear.alpha = 0;
		this.cards.visible = true;
	}, null, null, this);

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:1}), 'glade');

	t.addSound(this.t.speech, this.t, 'isGood', '+=0.3');

	t.addLabel('walk');

	t.add(this.t.move({ x: '+=' + 170, y: '-=' + 120, ease: Power0.easeNone}, 2), 'walk');
	t.to(this.cards, 2, { x: '+=' + 170, y: '-=' + 120, ease: Power0.easeNone}, 'walk');

	t.addCallback(function () {
	
		this.t.eyesFollowObject(this.mailbox);
	}, null, null, this);

	t.addLabel('post');
	t.to(this.t.rightArm, 0.8, {rotation: -0.3, ease: Power1.easeIn}, 'post');

	t.to(this.cards, 0.8, {x: '+=' + 36, y: '-=' + 50, ease: Power0.easeNone}, 'post');

	t.addLabel('scale');
	t.to(this.cards, 0.5, {width: 0.6, height: 0, ease: Power0.easeNone}, 'scale');
	t.to(this.cards, 0.2, {x: '+=' + 10, ease: Power0.easeNone}, 'scale');

	t.addCallback(function () {

		this.mailbox.frameName = 'mailbox_open';
	}, 'post', null, this);

	t.addLabel('close', '+=1');
	t.to(this.t.rightArm, 1, {rotation: 1.1, ease: Power1.easeIn}, 'close');
	t.addCallback(function () {

		this.mailbox.frameName = 'mailbox';
	}, 'close', null, this);

	t.addCallback(function () {
	
		this.t.eyesStopFollow();
	}, null, null, this);

	t.add(this.t.move({ x: '-=' + 170, y: '+=' + 120, ease: Power0.easeNone}, 2));

	t.addSound(this.t.speech, this.t, 'continueWhenBack', '-=1');


	t.addSound(this.a.speech, this.a, 'thanksForHelp', '+=0.5');

	t.addCallback(this.endGame, '+=3', null, this);

};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                         Create container object                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



Container.prototype = Object.create(Phaser.Group.prototype);
Container.prototype.constructor = Container;
function Container (game, x, y, handle, handleDecor, amount, decor) {

	Phaser.Group.call(this, game, null); // Parent constructor.
	
	this.alpha = 0;
	this.x = x;
	this.y = y;
	this.handle = this.create(0, 0, handle, handleDecor);
	this.handle.inputEnabled = true;
	this.handle.anchor.set(0.5);

	this.moreDecorGroup = this.game.add.group(this);
	this.decorGroup = this.game.add.group(this);
	
	this.decorGroup.name = decor;

	for (var i = 0; i < amount; i++) {
		
		var sprite = this.decorGroup.create(0, 0, 'invitation', decor);
		sprite.anchor.set(0.5);
	}

	var t = new TimelineMax();
	t.add(new TweenMax(this, 2, {alpha:1}));
	
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
	}

	else {

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
function Tray (game, x, y, amount, decor, type) {

	Container.call(this, game, x, y, 'invitation', 'tray', amount, decor); // Parent constructor.
	
	this.type = type;

	this.decorPositions();
}



Tray.prototype.transferFrom = function (container) {

	Container.prototype.transferFrom.call(this, container);

	this.decorPositions();
};



Tray.prototype.decorPositions = function () {

	var decor;
	var radius;
	var angle;
	var i;
	var j;
	var pos;


	if (this.type === 'piles') {

		for (i = 0; i < this.decorGroup.children.length; i++) {
				
			angle = this.game.rnd.angle();

			decor = this.decorGroup.children[i];
			radius = (this.handle.width - 60) / 2;

			decor.x = Math.cos(angle)*Math.random()*radius;
			decor.y = Math.sin(angle)*Math.random()*radius;

			if (this.decorGroup.children.length < 10) {

				for (j = 0; j < i; j++) {

					pos = decor.position.distance(this.decorGroup.children[j].position);

					if (pos < 30) {

						i--;
						break;
					}
				}
			}
		}
	}


	else if (this.type === 'singles') {

		for (i = 0; i < this.decorGroup.children.length; i++) {
				
			angle = this.game.rnd.angle();

			decor = this.decorGroup.children[i];
			radius = (this.handle.width - 60) / 2;

			decor.x = Math.cos(angle)*Math.random()*radius;
			decor.y = Math.sin(angle)*Math.random()*radius;

			for (j = 0; j < i; j++) {

				pos = decor.position.distance(this.decorGroup.children[j].position);

				if (pos < 30) {

					i--;
					break;
				}
			}
		}
	}

	
	else if (this.type === 'manyNumber') {

		for (i = 0; i < this.decorGroup.children.length; i++) {
				
			angle = this.game.rnd.angle();

			decor = this.decorGroup.children[i];
			radius = (this.handle.width - 60) / 2;

			decor.x = Math.cos(angle)*Math.random()*radius;
			decor.y = Math.sin(angle)*Math.random()*radius;

			for (j = 0; j < i; j++) {

				pos = decor.position.distance(this.decorGroup.children[j].position);

				if (pos < 30) {

					i--;
					break;
				}
			}
		}
		
		this.nr = new NumberText (this.game, 0, -87, this.decorGroup.children.length, 30);
		this.add(this.nr);
		this.sendToBack(this.nr);
	}


	else if (this.type === 'singleNumber') {

		for (i = 0; i < this.decorGroup.children.length; i++) {

			decor = this.decorGroup.children[i];

			decor.x = 0;
			decor.y = 0;
		}
		
		this.nr = new NumberText (this.game, 0, -87, this.decorGroup.children.length, 30);
		this.add(this.nr);
		this.sendToBack(this.nr);
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

		var j;
		var pos;

		decor.x = this.game.rnd.between(-150, 150);
		decor.y = this.game.rnd.between(-100, 100);

		if (this.decorGroup.children.length < 10) {
			
			for (j = 0; j < i; j++) {

				pos = decor.position.distance(this.decorGroup.children[j].position);

				if (pos < 40) {

					i--;
					break;
				}
			}
		}

		if (this.moreDecorGroup.length && (this.decorGroup.children.length + this.moreDecorGroup.children.length) < 20) {
			
			for (j = 0; j < i; j++) {

				pos = decor.position.distance(this.decorGroup.children[j].position);

				if (pos < 30) {

					i--;
					break;
				}
			}
		}
	}
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create other objects                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



NumberText.prototype = Object.create(Phaser.Text.prototype);
NumberText.prototype.constructor = NumberText;

function NumberText (game, x, y, text, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x, y, text, {font: size + 'pt ' + GLOBAL.FONT, fill: color}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}



















