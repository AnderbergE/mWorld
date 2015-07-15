var PartyGame = require('./PartyGame.js');
var LANG = require('../../language.js');
var Mouse = require('../../agent/Mouse.js');
var Panda = require('../../agent/Panda.js');
var GLOBAL = require('../../global.js');

module.exports = InvitationGame;


InvitationGame.prototype = Object.create(PartyGame.prototype);
InvitationGame.prototype.constructor = InvitationGame;

function InvitationGame () {
	PartyGame.call(this); // Call parent constructor.
}




InvitationGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);

	this.load.audio('entryMusic', ['audio/music.m4a', 'audio/music.ogg', 'audio/music.mp3']);
	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash(Mouse.prototype.id, 'img/agent/mouse/atlas.png', 'img/agent/mouse/atlas.json');
	this.load.atlasJSONHash(Panda.prototype.id, 'img/agent/panda/atlas.png', 'img/agent/panda/atlas.json');
	this.load.audio(Panda.prototype.id + 'Speech', LANG.SPEECH.panda.speech);
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
	this.load.atlasJSONHash('lizard', 'img/subgames/lizardjungle/atlas.png', 'img/subgames/lizardjungle/atlas.json');
	this.load.atlasJSONHash('objects', 'img/objects/objects.png', 'img/objects/objects.json');
};


InvitationGame.prototype.create = function () {

	this.bg = this.gameGroup.create(0, 0, 'bee', 'bg');
	
	this.thoughtBubble = this.gameGroup.create(860, 200, 'objects', 'thought_bubble');
	this.thoughtBubble.scale.set(1.3);
	this.thoughtBubble.anchor.set(0.5);

	this.cardStackCard = this.gameGroup.create(100, 100, 'balloon', 'map');
	this.cardStack = this.add.group(this.gameGroup);
	this.cardStack.x = 100;
	this.cardStack.y = 100;

	this.arm = this.gameGroup.create(0, 0, 'panda', 'arm');
	this.arm.x = 860;
	this.arm.y = 560;
	this.arm.angle = 45;

	this.guests = ['bee', 'lizard', 'beetle', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird', 'bird'];
	Phaser.Utils.shuffle(this.guests);

	this.tints = [0xff8888, 0x77ee77, 0x8888ff, 0xfaced0, 0xfedcba, 0x11abba, 0xabcdef, 0x333333, 0xed88ba];
	Phaser.Utils.shuffle(this.tints);

	// this.thought = this.gameGroup.create(150, 500, 'balloon', 'metalloop');
	// this.thought.inputEnabled = true;
	// this.thought.events.onInputDown.add(this.particleBurst, this);


	//PartyGame.prototype.create.call(this);

};



   




//Set up new guest for next round
InvitationGame.prototype.createGuest = function () {

	this.guest = new Guest(this.game, this.game.width / 2, 60, this.guests[0], this.tints[0]);
	this.gameGroup.add(this.guest);
	this.guestNeutral();

	if (this.guests[0] === 'bird') {
		this.tints.splice(0, 1);
	}

	this.guests.splice(0, 1);
};

InvitationGame.prototype.particleBurst = function () {

	this.emitter = this.add.emitter(0, 0, 200);

    this.emitter.x = this.guest.x;
    this.emitter.y = this.guest.y;
    
    this.emitter.makeParticles('balloon', 'treasure7');
    
    this.emitter.gravity = 0;

    this.emitter.setAlpha(1, 0, 5000);
    this.emitter.start(false, 3000, 10, 100);
};



InvitationGame.prototype.guestNeutral = function () {

	if (this.guest.mouthNeutral) {

		this.guest.mouthNeutral.visible = true;
		this.guest.mouthSad.visible = false;
		this.guest.mouthHappy.visible = false;
	}

	else if (this.guest.mouthSad && this.guest.mouthHappy) {

		this.guest.mouthSad.visible = false;
		this.guest.mouthHappy.visible = true;
	}
};


InvitationGame.prototype.guestHappy = function () {

	if (this.guest.mouthSad && this.guest.mouthHappy) {

		this.guest.mouthSad.visible = false;
		this.guest.mouthHappy.visible = true;

		if (this.guest.mouthNeutral) {

			this.guest.mouthNeutral.visible = false;
		}
	}

	if (this.guest.wings) {

		this.guest.flap = TweenMax.to(this.guest.wings, 0.1, {
				frame: this.guest.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false
			});
	}

	if (this.guest.beetle) {

		this.guest.hop = TweenMax.to(this.guest.beetle, 0.2, {
				y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false
			});
	}

	if (this.guest.rightLeg && this.guest.leftLeg) {

		this.guest.jump = new TimelineMax(); 
		this.guest.jump.addLabel('jump');
		this.guest.jump.to(this.guest, 0.3, {y:'-=15', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false});
		this.guest.jump.to(this.guest.rightLeg, 0.3, {angle: -40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false}, 'jump');
		this.guest.jump.to(this.guest.leftLeg, 0.3, {angle: 40, ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: false}, 'jump');
	}
};


InvitationGame.prototype.guestSad = function () {

	if (this.guest.mouthSad && this.guest.mouthHappy) {

		this.guest.mouthHappy.visible = false;
		this.guest.mouthSad.visible = true;
	}
};



//Set up new card for next round
InvitationGame.prototype.createCard = function () {
	
	this.playCard = new Card(this.game, this.game.width / 2, this.game.height / 3);
	this.gameGroup.add(this.playCard);
	this.playCard.handle.events.onInputDown.add(this.pickDecor, this);
};



//Set up piles
InvitationGame.prototype.createChoices = function  () {

	var amount = [this.maxNumber(), this.maxNumber(), this.maxNumber()];
	var spriteMix = [this.spriteVariation(), this.spriteVariation(), this.spriteVariation()];
	var positionX = [300, 500, 700];

	var amountEasy = [3, 6, 25];
	Phaser.Utils.shuffle(amountEasy);

	var piles = [0, 1, 2];

	Phaser.Utils.shuffle(piles);

	function checkRandom () {

		for (var i = 0; i < amount.length; i++) {
			for (var j = i + 1; j < amount.length; j++) {
				if (amount[i] === amount[j] && spriteMix[i] === spriteMix[j]) {
					return i;
				}
			}
		}

		return -1;
	}
	
	var c = 1;
	
	while (c >= 0) {
		c = checkRandom ();
		if (c >= 0) {
			amount[c] = this.maxNumber();
		}
	}


	this.correctPile = this.game.rnd.pick(piles);
	

	this.choices = [];


	if (this.difficulty <= 2) {

		for (var e = 0; e < amount.length; e++) {

			this.choices.push(new Tray(this.game, positionX[e], 600, amountEasy[e], spriteMix[e]));
			this.gameGroup.add(this.choices[e]);
			this.choices[e].handle.events.onInputDown.add(this.pickDecor, this);
		}

		this.showCorrectDecor(amountEasy[this.correctPile], spriteMix[this.correctPile]);
	}

	else if (this.difficulty <= 10) {

		for (var i = 0; i < amount.length; i++) {

			this.choices.push(new Tray(this.game, positionX[i], 600, amount[i], spriteMix[i]));
			this.gameGroup.add(this.choices[i]);
			this.choices[i].handle.events.onInputDown.add(this.pickDecor, this);
		}

		this.showCorrectDecor(amount[this.correctPile], spriteMix[this.correctPile]);
	}

	
};


//Set up correct decor in thought bubble
InvitationGame.prototype.showCorrectDecor = function (randomNr, name) {

	this.thoughtGroup = this.add.group(this.gameGroup);
	this.thoughtGroup.x = 840;
	this.thoughtGroup.y = 180;
	this.thoughtGroup.name = name;

	for (var i = 0; i < randomNr; i++) {
		
		this.thoughtGroup.create(0, 0, 'balloon', name);
	}

	for (var a = 0; a < randomNr; a++) {
		
		var angle = this.game.rnd.angle();

		var decor1 = this.thoughtGroup.children[a];
		decor1.anchor.set(0.5);
		decor1.x = Math.cos(angle)*Math.random()*60;
		decor1.y = Math.sin(angle)*Math.random()*60;


		if (randomNr < 10) {
			
			for (var b = 0; b < a; b++) {

				var pos = decor1.position.distance(this.thoughtGroup.children[b].position);

				if (pos < 30) {

					a--;
					break;
				}
			}
		}
	}
};



//Pick one of the piles
InvitationGame.prototype.pickDecor = function (origin) {

	if (!this.playCard.decorGroup.length || this.game.input.activePointer.y < 400) {

		var choice = origin.parent;

		origin.events.onInputUp.add(this.dropDecor, this);

		this.gameGroup.bringToTop(choice);
		
		choice.follow(this.game.input.activePointer);
	}
		
};




//Drop the pile on the card
InvitationGame.prototype.dropDecor = function (origin) {

	var choice = origin.parent;

	origin.events.onInputUp.remove(this.dropDecor, this);

	choice.follow();

	if (this.game.input.activePointer.y < 400) {

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
InvitationGame.prototype.checkDecor = function () {
	
	//TODO: Make separate else ifs for if statements.

	if (this.playCard.decorGroup.length) {

		if (this.playCard.decorGroup.children.length === this.thoughtGroup.children.length && this.playCard.decorGroup.children[0].frameName === this.thoughtGroup.name) {

			this.playCard.handle.events.destroy();
			
			var t = new TimelineMax();
			t.addCallback(this.guestHappy, null, null, this);
	 		t.addSound(this.p.speech, this.p, 'wasCorrect', 0);
	 		t.addSound(this.p.speech, this.p, 'willYouHelpMe');
	 		t.addCallback(this.dragCard, null, null, this);
	 	}

		else {

			var s = new TimelineMax();
			s.addCallback(this.guestSad, null, null, this);
	 		s.addSound(this.p.speech, this.p, 'wrong1', 0);
		}
	}
};


//Drag finished card to stack
InvitationGame.prototype.dragCard = function () {

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
InvitationGame.prototype.addCardToStack = function () {

	this.playCard.update = function () {};

	if (this.game.input.activePointer.x < 300) {

		this.cardStack.add(this.playCard);

		this.playCard.x = 10;
		this.playCard.y = 10;

		var t = this.destroyRound();
	 	t.addCallback(this.nextRound, '+=2', null, this);
	}

	else {

		this.playCard.x = this.game.width / 2;
		this.playCard.y = this.game.height / 3;
		this.playCard.scale.set(1);
	}
};


//Destroy last round
InvitationGame.prototype.destroyRound = function ()  {

	this.playCard.handle.events.destroy();

	var t = new TimelineMax();

 	t.addSound(this.p.speech, this.p, 'ok1', 0);
 	t.addLabel('startFade');

	for (var i = 0; i < 3; i++) {

		t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
		t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
	}

	t.add(new TweenMax(this.thoughtGroup, 2, {alpha:0}), 'startFade');
	t.addCallback(this.thoughtGroup.destroy, null, null, this.thoughtGroup);

	t.add(new TweenMax(this.guest, 2, {alpha:0}), 'startFade');
	t.addCallback(this.guest.destroy, null, null, this.guest);

	return t;
};


InvitationGame.prototype.modeIntro = function () {

		var t = new TimelineMax();
		//this.partyIntro(t);

		this.p = new Panda (this.game);
		
		t.addSound(this.p.speech, this.p, 'hello');
	 	t.addSound(this.p.speech, this.p, 'willYouHelpMe', 1);
	 	t.addCallback(this.createGuest, null, null, this);
	 	t.addCallback(this.createCard, null, null, this);
	 	t.addCallback(this.createChoices, null, null, this);
	 	t.addCallback(this.introShow, null, null, this);
};



InvitationGame.prototype.modePlayerDo = function () {

	this.disable(false);

	this.finishedCards = this.cardStack.children.length - 1;

	var t = new TimelineMax();

	if (this.finishedCards < 3) {

		t.addCallback(this.createGuest, null, null, this);
		t.addCallback(this.createCard, null, null, this);
		t.addCallback(this.createChoices, null, null, this);
	 	t.addCallback(this.particleBurst, null, null, this);
	}

	else if (this.finishedCards === 3) {

		t.addCallback(this.modeOutro, '+=1', null, this);
	}
};




InvitationGame.prototype.modeOutro = function () {

		var t = new TimelineMax();
		
		t.addSound(this.p.speech, this.p, 'letsGo');
		t.addLabel('startFade');
		t.add(new TweenMax(this.thoughtBubble, 2, {alpha:0}), 'startFade');
		t.add(new TweenMax(this.cardStack, 2, {alpha:0}), 'startFade');
		t.add(new TweenMax(this.cardStackCard, 2, {alpha:0}), 'startFade');
};



//Animated instruction
InvitationGame.prototype.introShow = function () {

	var rightPile = this.choices[this.correctPile];
	var positionX = this.choices[this.correctPile].x;
	var positionY = this.choices[this.correctPile].y;
	
	var t = new TimelineMax();

	t.addCallback(function () {
		
		this.gameGroup.bringToTop(this.arm);
	}, null, null, this);

	t.to(this.arm, 3, {x:positionX, y:positionY, ease: Power1.easeIn});
	t.addSound(this.p.speech, this.p, 'isThisRight');
	
	t.addLabel('toCard');
	t.to(this.arm, 2, {x:this.playCard.x + 10, y:this.playCard.y + 10, ease: Power1.easeIn}, 'toCard');

	t.addCallback(function () {
		
		rightPile.follow(this.arm);
	}, 'toCard', null, this);

	t.addCallback(function () {
		
		this.playCard.transferFrom(rightPile);
	}, null, null, this);

	t.addCallback(this.guestHappy, null, null, this);
	t.addSound(this.p.speech, this.p, 'wasCorrect');

	t.to([this.arm, this.playCard], 2, {x:this.cardStack.x, y:this.cardStack.y, ease: Power1.easeIn});
	t.addCallback(function () {
		
		this.cardStack.add(this.playCard);
		this.playCard.x = 10;
		this.playCard.y = 10;
	}, null, null, this);
	t.to(this.arm, 2, {x:860, y:560, ease: Power1.easeIn});
	t.addCallback(function () {
		
		this.destroyRound();
	}, null, null, this);
	t.addCallback(this.nextRound, '+=2', null, this);

	return t;
};




//Change level of difficulty, amount
InvitationGame.prototype.maxNumber = function () {

	if (this.difficulty <= 5) {
		
		return this.game.rnd.between(1, 4);
	}

	else if (this.difficulty <= 8) {
		
		return this.game.rnd.between(1, 9);
	}

	else if (this.difficulty <= 10) {
		
		return this.game.rnd.between(1, 9);
	}
};


//Change level of difficulty, sprite
InvitationGame.prototype.spriteVariation = function () {

	if (this.difficulty <= 3) {

		var sprites3 = ['treasure11', 'treasure1', 'treasure9'];
		var rndSprite3 = this.game.rnd.pick(sprites3);

		return rndSprite3;
	}

	else if (this.difficulty <= 5) {

		var sprites2 = ['treasure11', 'treasure1'];
		var rndSprite2 = this.game.rnd.pick(sprites2);

		return rndSprite2;
	}

	else if (this.difficulty <= 10) {

		var sprites1 = ['treasure11'];
		var rndSprite1 = this.game.rnd.pick(sprites1);
		return rndSprite1;

	}
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                         Create container objects                          */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/


Container.prototype = Object.create(Phaser.Group.prototype);
Container.prototype.constructor = Container;
function Container (game, x, y, handle, amount, decor) {

	Phaser.Group.call(this, game, null); // Parent constructor.
	
	this.x = x;
	this.y = y;
	this.handle = this.create(0, 0, 'balloon', handle);
	this.handle.inputEnabled = true;
	this.handle.anchor.set(0.5);

	this.decorGroup = this.game.add.group(this);

	this.decorGroup.name = decor;

	var state = game.state.getCurrentState();
	
	
	for (var i = 0; i < amount; i++) {
		
		var sprite = this.decorGroup.create(0, 0, 'balloon', decor);
		sprite.anchor.set(0.5);
	}

	
	if (state.difficulty < 8) {

		for (var a = 0; a < this.decorGroup.children.length; a++) {
			
			var angle = this.game.rnd.angle();

			var decor1 = this.decorGroup.children[a];
			var radius = this.handle.width / 2;

			decor1.x = Math.cos(angle)*Math.random()*radius;
			decor1.y = Math.sin(angle)*Math.random()*radius;


			if (this.decorGroup.children.length < 10) {
				
				for (var b = 0; b < a; b++) {

					var pos = decor1.position.distance(this.decorGroup.children[b].position);

					if (pos < 30) {

						a--;
						break;
					}
				}
			}
		}
	}


	if (state.difficulty >= 8) {
		
		this.nr = new NumberText (this.game, 0, 0, amount, 60);
		this.add(this.nr);
	}
	
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



Card.prototype = Object.create(Container.prototype);
Card.prototype.constructor = Card;
function Card (game, x, y) {

	Container.call(this, game, x, y, 'map'); // Parent constructor.
	
}


Card.prototype.transferFrom = function (container) {

	Container.prototype.transferFrom.call(this, container);

	for (var i = 0; i < this.decorGroup.children.length; i++) {

		var decor = this.decorGroup.children[i];

		decor.x = this.game.rnd.between(-100, 100);
		decor.y = this.game.rnd.between(-100, 100);

		if (this.decorGroup.children.length < 10) {
			
			for (var j = 0; j < i; j++) {

				var pos = decor.position.distance(this.decorGroup.children[j].position);

				if (pos < 30) {

					i--;
					break;
				}
			}
		}
	}
};



Tray.prototype = Object.create(Container.prototype);
Tray.prototype.constructor = Tray;
function Tray (game, x, y, amount, decor) {

	Container.call(this, game, x, y, 'map', amount, decor); // Parent constructor.
	
}


Tray.prototype.transferFrom = function (container) {

	Container.prototype.transferFrom.call(this, container);

	var state = this.game.state.getCurrentState();

	if (state.difficulty < 8) {

		for (var i = 0; i < this.decorGroup.children.length; i++) {

			var decor = this.decorGroup.children[i];
			var angle = this.game.rnd.angle();
			var radius = this.handle.width / 2;

			decor.x = Math.cos(angle)*Math.random()*radius;
			decor.y = Math.sin(angle)*Math.random()*radius;

			if (this.decorGroup.children.length < 10) {
				
				for (var j = 0; j < i; j++) {

					var pos = decor.position.distance(this.decorGroup.children[j].position);

					if (pos < 30) {

						i--;
						break;
					}
				}
			}
		}
	}

	else if (state.difficulty >= 8) {

		for (var k = 0; k < this.decorGroup.children.length; k++) {

			var decor1 = this.decorGroup.children[k];
			
			decor1.x = 0;
			decor1.y = 0;
		}
	}
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Create guest object                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/


Guest.prototype = Object.create(Phaser.Group.prototype);
Guest.prototype.constructor = Guest;
function Guest (game, x, y, guestName, tint) {

	Phaser.Group.call(this, game, null); // Parent constructor.
	
	this.x = x;
	this.y = y;
	
	
	if (guestName === 'bee') {

		this.scale.set(0.5);
		this.body = this.create(0, 0, 'bee', 'body');
		this.body.anchor.set(0.5);
		this.mouthHappy = this.create(50, 35, 'bee', 'mouth_happy');
		this.mouthHappy.anchor.set(0.5);
		this.mouthHappy.visible = false;
		this.mouthSad = this.create(50, 35, 'bee', 'mouth_sad');
		this.mouthSad.anchor.set(0.5);
		this.mouthSad.visible = false;
		this.wings = this.create(-25, -43, 'bee', 'wings1');
		this.wings.anchor.set(0.5);
		
	}

	else if (guestName === 'bird') {

		this.scale.set(0.16);
		this.rightLeg = this.game.add.sprite(50, 160, 'birdhero', 'leg', this);
		this.body = this.game.add.sprite(0, 0, 'birdhero', 'body', this);
		this.body.anchor.set(0.5);
		this.leftLeg = this.game.add.sprite(0, 175, 'birdhero', 'leg', this);
		this.wing = this.game.add.sprite(75, -20, 'birdhero', 'wing', this);
		this.wing.anchor.set(1, 0);
		this.game.add.sprite(110, -160, 'birdhero', 'eyes', this);
		this.game.add.sprite(118, -145, 'birdhero', 'pupils', this);
		this.mouthHappy = this.game.add.sprite(190, -70, 'birdhero', 'beak1', this);
		this.mouthHappy.anchor.set(0.5);
		this.mouthHappy.visible = false;
		this.mouthSad = this.game.add.sprite(190, -70, 'birdhero', 'beak0', this);
		this.mouthSad.anchor.set(0.5);
		this.mouthSad.visible = false;

		this.body.tint = tint;
		this.wing.tint = tint;
	}

	else if (guestName === 'lizard') {

		this.scale.set(0.3);
		this.x = 460;
		this.body = game.add.sprite(0, 0, 'lizard', 'body', this);
		this.head = game.add.group(this);
		this.head.x = 60;
		this.head.y = 60;
		this.mouthNeutral = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthNeutral.anchor.set(1, 0.4);
		this.mouthNeutral.angle = -9;
		this.mouthNeutral.visible = false;
		this.mouthHappy = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthHappy.anchor.set(1, 0.4);
		this.mouthHappy.angle = -18;
		this.mouthHappy.visible = false;
		this.mouthSad = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
		this.mouthSad.anchor.set(1, 0.4);
		this.mouthSad.angle = -3;
		this.mouthSad.visible = false;
		this.forehead = game.add.sprite(125, 35, 'lizard', 'head', this.head);
		this.forehead.anchor.set(1, 1);

		this.mouthNeutral.tint = 0x00aa00;
		this.mouthHappy.tint = 0x00aa00;
		this.mouthSad.tint = 0x00aa00;
		this.forehead.tint = 0x00aa00;
		this.body.tint = 0x00aa00;
	}

	else if (guestName === 'beetle') {

		this.scale.set(0.6);
		this.beetle = this.create(0, 0, 'balloon', 'beetle');
		this.beetle.anchor.set(0.5);
	}
}



NumberText.prototype = Object.create(Phaser.Text.prototype);
NumberText.prototype.constructor = NumberText;

function NumberText (game, x, y, text, size, color) {
	size = size || 50;
	color = color || '#000000';

	Phaser.Text.call(this, game, x, y, text, {font: size + 'pt ' + GLOBAL.FONT, fill: color}); // Parent constructor.
	this.anchor.set(0.5);

	return this;
}



















