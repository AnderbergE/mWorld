var PartyGame = require('./PartyGame.js');
var Troll = require('../../agent/Troll.js');
var Hedgehog = require('../../agent/Hedgehog.js');
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

	this.afterInvitations();

	this.firstBg = this.gameGroup.create(0, 0, 'garland', 'background');

	this.difference = 0;
	this.finishedRounds = 0;
	this.flagsBack = 0;

	this.t = new Troll (this.game);
	this.gameGroup.add(this.t);
	this.t.visible = false;
	this.t.scale.set(0.22);

	this.emitter = this.add.emitter(0, 0, 150);
	this.emitter.gravity = 0;
    this.emitter.setAlpha(1, 0, 3000);
    this.emitter.makeParticles(Troll.prototype.id, 'star');

    var line = this.add.bitmapData(70,2);

    line.ctx.beginPath();
    line.ctx.rect(0,0,70,2);
    line.ctx.fillStyle = 0x000000;
    line.ctx.fill();

    this.line = this.add.sprite(0, 0, line);
    this.line.alpha = 0;
    this.gameGroup.add(this.line);

};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Change difficulty functions                        */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



//Change level of difficulty, amounts
PartyGarlandGame.prototype.getAmounts = function (max) {

	var amountsArray = [];

	for (var i = 1; i < 9; i++) {

		amountsArray.push(i);
	}

	Phaser.Utils.shuffle(amountsArray);

	var correct = 4;

	if (max > 4) {

		correct = this.game.rnd.between(4, max);
	}

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

	Phaser.Utils.shuffle(amountsArray);

	var correct = max;

	amountsArray.splice(amountsArray.indexOf(correct), 1);

	amountsArray.unshift(correct);

	return amountsArray.splice(0, 3);
};



//Change level of difficulty, positionsX
PartyGarlandGame.prototype.getPosX = function (level) {

	var positionX;

	if (level <= 4) {

		positionX = [220, 370, 520];

		Phaser.Utils.shuffle(positionX);
	}

	else if (level <= 10) {

		positionX = [270, 570, 870];

		Phaser.Utils.shuffle(positionX);
	}

	return positionX;
};



//Change level of difficulty, positionsY
PartyGarlandGame.prototype.getPosY = function (level) {

	var positionY;

	if (level <= 4) {

		positionY = [560, 640, 720];
	}

	else if (level <= 10) {

		positionY = [600, 600, 600];

		Phaser.Utils.shuffle(positionY);
	}

	return positionY;
};



PartyGarlandGame.prototype.getTints = function () {

	var tints = [0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x00ffff, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff];

	Phaser.Utils.shuffle(tints);

	return tints;
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                                Set up round                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyGarlandGame.prototype.generateRound = function () {

	var amounts;
	var pileType;
	var posX;
	var posY;
	var tints;

	if (this.difficulty <= 1) {
		
		amounts = this.getAmounts(4);
		pileType = 'garland';
		posX = this.getPosX(1);
		posY = this.getPosY(1);
		tints = this.getTints();
	}

	else if (this.difficulty <= 2) {
		
		amounts = this.getAmounts(4);
		pileType = 'garland';
		posX = this.getPosX(2);
		posY = this.getPosY(2);
		tints = this.getTints();
	}

	else if (this.difficulty <= 3) {
		
		amounts = this.getAmounts(4);
		pileType = 'garland';
		posX = this.getPosX(3);
		posY = this.getPosY(3);
		tints = this.getTints();
	}

	else if (this.difficulty <= 4) {
		
		amounts = this.getAmounts(4);
		pileType = 'piles';
		posX = this.getPosX(4);
		posY = this.getPosY(4);
		tints = this.getTints();
	}

	else if (this.difficulty <= 5) {

		amounts = this.getAmounts(4);
		pileType = 'piles';
		posX = this.getPosX(5);
		posY = this.getPosY(5);
		tints = this.getTints();
	}

	else if (this.difficulty <= 6) {
		
		amounts = this.getAmounts(5);
		pileType = 'manyNumber';
		posX = this.getPosX(6);
		posY = this.getPosY(6);
		tints = this.getTints();
	}

	else if (this.difficulty <= 7) {
		
		amounts = this.getAmounts(6);
		pileType = 'manyNumber';
		posX = this.getPosX(7);
		posY = this.getPosY(7);
		tints = this.getTints();
	}

	else if (this.difficulty <= 8) {
		
		amounts = this.getAmounts(7);
		pileType = 'manyNumber';
		posX = this.getPosX(8);
		posY = this.getPosY(8);
		tints = this.getTints();
	}

	else if (this.difficulty <= 9) {
		
		amounts = this.getAmounts(8);
		pileType = 'singleNumber';
		posX = this.getPosX(9);
		posY = this.getPosY(9);
		tints = this.getTints();
	}

	else if (this.difficulty <= 10) {
		
		amounts = this.getAmounts(9);
		pileType = 'singleNumber';
		posX = this.getPosX(10);
		posY = this.getPosY(10);
		tints = this.getTints();
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



PartyGarlandGame.prototype.createAgent = function () {

	if (this.agent instanceof Hedgehog) {

		this.a = new Panda (this.game);
		this.gameGroup.add(this.a);
	    this.a.scale.set(0.2);
	    this.a.x = -300;
		this.a.y = 326;

		this.agentX = 330;
		this.agentX2 = -8;
	}

	else {

		this.a = new Hedgehog (this.game);
		this.gameGroup.add(this.a);
	    this.a.scale.set(0.2);
	    this.a.x = -300;
		this.a.y = 326;

		this.agentX = 350;
		this.agentX2 = 14;
	}

	this.a.visible = false;
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

	if (this.difficulty <= 3) {

		this.arrow.x = this.choices[0].x;
		this.arrow.y = this.choices[0].y - 40;
	}

	else {

		this.arrow.x = this.choices[0].x;
		this.arrow.y = this.choices[0].y - 110;
	}

	var pointAngle;

	if (this.arrow.x < 270) {

		pointAngle = 0.5;
	}

	else if (this.arrow.x < 400) {

		pointAngle = 0;
	}

	else if (this.arrow.x < 600) {

		pointAngle = -0.4;
	}

	else if (this.arrow.x > 600) {

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

		var choice = origin.parent;

		origin.events.onInputUp.add(this.dropFlags, this);

		this.gameGroup.bringToTop(choice);

		var t = new TimelineMax();

		if (choice === this.trollTarget) {

			t.add(new TweenMax(this.line, 0.5, {alpha:0}));
		}

		if (this.finishedRounds === 0) {

			t.add(new TweenMax(this.arrow, 1, {alpha:0}));
			t.addCallback(this.arrow.destroy, null, null, this.arrow);
		}

		t.addCallback(function () {
				
			this.a.eyesFollowPointer();
		}, null, null, this);
			
		choice.follow(this.game.input.activePointer);
	}

};



//Drop the pile on the card
PartyGarlandGame.prototype.dropFlags = function (origin) {

	var choice = origin.parent;

	choice.follow();

	origin.events.onInputUp.remove(this.dropFlags, this);

	this.a.eyesStopFollow();

	if (this.game.input.activePointer.y < 400) {

		var t = new TimelineMax();

		var garland;
		var toX;
		var toY;
		var i;

		t.addCallback(function () {

			this.disable(true);
		}, null, null, this);

		if (this.addedFlagsGroup.length) {

			this.gameGroup.bringToTop(this.addedFlagsGroup);
		}

		this.gameGroup.bringToTop(this.tree);

		this.childWidth = choice.pileGroup.children[0].width;

		t.addLabel('collect');

		if (this.difference === 0) {
			var rotationAngle = this.game.math.angleBetweenPoints(this.a.leftArm, this.garlandGroup);

			t.add(new TweenMax(this.a.leftArm, 0.5, { rotation: -0.5 + rotationAngle, ease: Power1.easeIn }, 'collect'));
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
				this.garlandGroup.add(garland);
				garland.x = -25 + this.addedFlagsGroup.width;
				garland.y = 0;
			}

			choice.pileTypes();

			t.addSound(this.a.speech, this.a, 'thanks');

			var i = this.garlandGroup.children.length;
			var startX = this.garlandGroup.children[0].x - this.childWidth;
			var stopX;

			t.addLabel('fade');

			while (i--) {

				stopX = startX + this.childWidth;

				t.addLabel('start' + i);
				t.add(this.a.move({ x: this.garlandGroup.x + stopX + this.childWidth * 2 + this.agentX2, ease: Power1.easeIn}, 1.2), 'start' + i);
				t.add(new TweenMax.fromTo(this.garlandGroup.children[i], 1, { x: startX, width: 0}, {x: stopX, width: this.childWidth, ease: Power1.easeIn}), 'start' + i);
				
				startX = stopX;
			}

			if (this.garlandGroup.children.length > this.correctAmount) {

				t.add(new TweenMax(this.tree2, 0.5, {alpha:0.7}, 'fade'));
			}

			t.addCallback(this.checkFlags, null, null, this);

		}, null, null, this);
	}

	else {

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
	
	var t = new TimelineMax();

	var i;


	if (this.garlandGroup.length) {

		if (this.garlandGroup.children.length === this.correctAmount) {

			t.add(new TweenMax(this.tree2, 0.5, {alpha:1}));

			this.finishedRounds = this.finishedRounds + 1;

			this.inputHandle.events.destroy();

			t.addCallback(function () {

				this.disable(true);
			}, null, null, this);

			t.addCallback(this.helpGroup.destroy, null, null, this.helpGroup);

	 		t.add(new TweenMax(this.a.leftArm, 0.5, { rotation: -0.8, ease: Power1.easeIn }));
	 		t.add(this.a.move({ x: this.a.x + 100, ease: Power1.easeIn}, 1), '-=0.2');
	 		t.addSound(this.a.speech, this.a, 'wasGood', '-=0.4');

	 		t.add(this.destroyChoices());

	 		if (this.finishedRounds < 5) {
	 		
	 			t.addSound(this.a.speech, this.a, 'moreGarlands', '+=1');
	 		}

	 		t.addCallback(this.nextRound, null, null, this);

	 		this.difference = 0;
	 	}

		else if (this.garlandGroup.children.length > this.correctAmount) {

			for (i = 0; i < 3; i++) {

				this.choices[i].handle.events.destroy();
			}

			this.gameGroup.bringToTop(this.inputHandle);

			if (this.flagsBack < 1) {

	 			t.addSound(this.a.speech, this.a, 'putFlagsBack', '+=0.5');
	 		}

	 		t.addCallback(function () {

				this.disable(false);
			}, '+=0.5', null, this);

	 		this.inputHandle.events.onInputDown.add(this.tooMany, this);
	 		
		}

		else if (this.garlandGroup.children.length < this.correctAmount) {

			this.difference = this.correctAmount - this.garlandGroup.children.length;

			while (this.garlandGroup.children.length) {

				this.addedFlagsGroup.add(this.garlandGroup.children[0]);
			}

			this.gameGroup.bringToTop(this.inputHandle);

			t.addSound(this.a.speech, this.a, 'helpMeFlags');

			t.addLabel('startFade');

			for (i = 0; i < 3; i++) {

				t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
				t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
			}

			t.addCallback(this.generateRound, '+=2', null, this);

			t.addLabel('fadeIn');
		 	t.addCallback(function () {
				
				for (i = 0; i < 3; i++) {

					t.add(new TweenMax(this.choices[i], 1, {alpha:1}), 'fadeIn');
				}
			}, null, null, this);

			if (this.finishedRounds === 0) {

				t.addCallback(this.addArrow, null, null, this);
				t.addCallback(function () {

					this.disable(false);
				}, '+=2.3', null, this);
			}

			else {

				t.addCallback(function () {

					this.disable(false);
				}, 'fadeIn+=1', null, this);
			}
			 		
		}
	}
};



PartyGarlandGame.prototype.tooMany = function (origin) {

	origin.events.onInputUp.add(this.putFlagsBack, this);

	if (this.garlandGroup.length) {

		var oneFlag = this.garlandGroup.children[0];

		var t = new TimelineMax();

		t.addCallback(function () {
				
			this.a.eyesFollowPointer();
		}, null, null, this);

		t.add(this.a.move({ x: this.a.x - oneFlag.width, ease: Power1.easeIn}, 0.8));

		oneFlag.update = function () {

			this.x = this.game.input.activePointer.x - this.parent.x;
			this.y = this.game.input.activePointer.y - this.parent.y;
		};	
	}
};



PartyGarlandGame.prototype.putFlagsBack = function (origin) {

	origin.events.onInputUp.remove(this.putFlagsBack, this);

	this.a.eyesStopFollow();

	this.flagsBack = this.flagsBack + 1;

	var oneFlag = this.garlandGroup.children[0];

	oneFlag.update = function () {};

	var pile = this.game.rnd.pick(this.choices);

	pile.pileGroup.add(oneFlag);

	oneFlag.x = 0;
	oneFlag.y = 0;

	pile.pileTypes();
		
	this.checkFlags();
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Switch round functions                          */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyGarlandGame.prototype.destroyChoices = function () {

	var t = new TimelineMax();

	t.addLabel('startFade');

	for (var i = 0; i < 3; i++) {

		t.add(new TweenMax(this.choices[i], 2, {alpha:0}), 'startFade');
		t.addCallback(this.choices[i].destroy, null, null, this.choices[i]);
	}

	t.add(new TweenMax(this.line, 0.5, {alpha:0}), 'startFade');

	return t;
};



PartyGarlandGame.prototype.slideOut = function () {

	var t = new TimelineMax();

 	t.addLabel('slideOut');

	t.add(this.a.move({ x: this.agentX, ease: Power0.easeNone}, 8), 'slideOut');
 	t.addSound(this.a.speech, this.a, 'hereGood', 'slideOut+=5');

 	if (this.finishedRounds === 0) {
	 	t.fromTo(this.firstBg, 4, {x:0, y:0}, {x:-1024, y:0, ease: Power0.easeNone}, 'slideOut');
	}

	else {

		t.fromTo(this.bg, 4, {x:0}, {x:-1024, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.tree, 4, {x:200}, {x:-1320, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.tree2, 3, {x:this.treePosition}, {x:-1200 + this.treePosition, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.garlandGroup, 4.3, {x:this.garlandGroup.x}, {x:-1390, ease: Power0.easeNone}, 'slideOut');
		t.fromTo(this.addedFlagsGroup, 4.3, {x:this.addedFlagsGroup.x}, {x:-1390, ease: Power0.easeNone}, 'slideOut');
	}

	return t;
};



PartyGarlandGame.prototype.betweenRounds = function () {

	var t = new TimelineMax();

	this.betweenBg = this.gameGroup.create(0, 0, 'garland', 'background');

	this.gameGroup.sendToBack(this.betweenBg);

 	t.fromTo(this.betweenBg, 8, {x:1022, y:0}, {x:-1026, y:0, ease: Power0.easeNone});

 	t.add(this.destroyRound());

	return t;
};



PartyGarlandGame.prototype.agentJump = function () {

	var t = new TimelineMax(); 
	t.addLabel('jump');
	t.to(this.a, 0.3, {y:'-=15', ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false});
	t.to(this.a.rightLeg, 0.3, {angle: -40, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.a.leftLeg, 0.3, {angle: 40, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.a.rightArm, 0.3, {rotation: 0.6, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');
	t.to(this.a.leftArm, 0.3, {rotation: -0.6, ease: Power0.easeInOut, repeat: 3, yoyo: true, paused: false}, 'jump');

	return t;
};



PartyGarlandGame.prototype.destroyRound = function () {

	var t = new TimelineMax();

	this.flagsBack = 0;

 	t.addCallback(this.bg.destroy, null, null, this.bg);
	t.addCallback(this.tree.destroy, null, null, this.tree);
	t.addCallback(this.tree2.destroy, null, null, this.tree2);
	t.addCallback(this.garlandGroup.destroy, null, null, this.garlandGroup);
	t.addCallback(this.addedFlagsGroup.destroy, null, null, this.addedFlagsGroup);

	return t;
};



PartyGarlandGame.prototype.newRound = function () {

	var t = new TimelineMax();

	this.createBg();
 	this.generateRound();
 	this.createHelpGroup();
 	this.createGarlandGroup();
 	this.createTrees();

 	for (var i = 0; i < 3; i++) {
 	
 		this.gameGroup.bringToTop(this.choices[i]);
 	}

 	this.gameGroup.sendToBack(this.bg);

	this.bg.visible = true;
	
	this.a.visible = true;

	this.tree.visible = true;
	this.tree2.visible = true;

 	t.addLabel('slideIn');

 	t.fromTo(this.bg, 4, {x:1020}, {x:-4, ease: Power0.easeNone}, 'slideIn');

 	t.fromTo(this.tree, 4, {x:1320}, {x:200, ease: Power0.easeNone}, 'slideIn');
 	t.fromTo(this.tree2, 4, {x:1200 + this.treePosition}, {x:this.treePosition, ease: Power0.easeNone}, 'slideIn');

	return t;
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Troll functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyGarlandGame.prototype.trollStart = function () {

	var t = new TimelineMax();

	var trollNr = this.game.rnd.between(1, 100);

	if (this.finishedRounds > 0 && trollNr <= 60) {

		this.disable(true);
	
		this.trollTarget = this.game.rnd.pick(this.choices);

		var emitX = this.trollTarget.x;

		if (this.difficulty <= 3) {

			emitX = this.trollTarget.x + (this.trollTarget.width / 2);
		}

		t.add(this.t.appear('random', emitX, this.trollTarget.y));
		t.add(this.trollTypePercent());
	}

};



PartyGarlandGame.prototype.trollTypePercent = function () {

	var t = new TimelineMax();

	var nr = this.game.rnd.between(1, 100);

	if (nr <= 20) {

		t.add(this.trollPolka());
	}

	else if (nr <= 60) {

		t.add(this.trollSplit());
	}

	else if (nr > 60) {

		t.add(this.trollSwapFlags());
	}

	return t;
};



PartyGarlandGame.prototype.trollSplit = function () {

	var t = new TimelineMax();

	if (this.trollTarget.pileGroup.length > 1) {

		if (this.difficulty <= 3) {

			t.addCallback(function () {

				var i;
				var splitIndex = Math.round(this.trollTarget.pileGroup.length / 2);
				var stop = this.trollTarget.pileGroup.length;

				t.addLabel('move');

				for (i = splitIndex; i < stop; i++) {

					t.to(this.trollTarget.pileGroup.children[i], 0.5, {x: '+=' + 50, ease: Power4.easeIn}, 'move');
				}

				this.line.x = this.trollTarget.pileGroup.children[splitIndex - 1].world.x + 20;
				this.line.y = this.trollTarget.pileGroup.children[splitIndex - 1].world.y - 30;

				t.add(new TweenMax(this.line, 0.5, {alpha:1}), 'move+=0.8');

				
			}, null, null, this);

			t.addCallback(function () {

				this.disable(false);
			}, '+=1', null, this);
		}

		else {

			t.addCallback(this.trollPolka, null, null, this);
		}
	}

	else {

		t.addCallback(this.trollSwapFlags, null, null, this);
	}

	return t;
};



PartyGarlandGame.prototype.trollPolka = function () {

	var t = new TimelineMax();

	if (this.trollTarget.pileGroup.length > 1) {

		t.addCallback(function () {

			var i;

			for (i = 0; i < this.trollTarget.pileGroup.length - 1; i+=2) {

				this.trollTarget.pileGroup.children[i].tint = 0xff0000;
				this.trollTarget.pileGroup.children[i + 1].tint = 0xffffff;
			}
			
		}, null, null, this);

		t.addCallback(function () {

			this.disable(false);
		}, '+=1', null, this);
	}

	else {

		t.addCallback(this.trollSwapFlags, null, null, this);
	}

	return t;
};



PartyGarlandGame.prototype.trollSwapFlags = function () {

	var t = new TimelineMax();

	var otherPile = this.game.rnd.pick(this.choices);
	var i;
	var diff;

	if (this.trollTarget.pileGroup.length === this.correctAmount) {

		while (otherPile.pileGroup.length === this.correctAmount) {

			otherPile = this.game.rnd.pick(this.choices);
		}
	}

	else if (this.trollTarget.pileGroup.length !== this.correctAmount) {

		otherPile = this.choices[0];
	}


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

			t.addCallback(function () {

				this.disable(false);
			}, '+=0.5', null, this);

		}, null, null, this);
	}

	else if (this.trollTarget.pileGroup.children.length < otherPile.pileGroup.children.length) {

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

			t.addCallback(function () {

				this.disable(false);
			}, '+=0.5', null, this);

		}, null, null, this);
	}

	return t; 

};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



PartyGarlandGame.prototype.modeIntro = function () {

 	this.createBg();
 	this.createAgent();
 	this.generateRound();
 	this.createHelpGroup();
 	this.createGarlandGroup();
 	this.createTrees();

 	var t = new TimelineMax();

	t.add(this.garlandIntro());

 	t.addCallback(function () {
		
		this.a.visible = true;
	}, null, null, this);
 	t.add(this.a.move({ x:290, ease: Power0.easeNone}, 2.8));
 	t.addSound(this.a.speech, this.a, 'goodPlace', '+=0.3');
 	t.addSound(this.a.speech, this.a, 'followMe', '+=1');

 	t.addCallback(this.nextRound, null, null, this);
		
};



PartyGarlandGame.prototype.modePlayerDo = function () {

	var t = new TimelineMax();

	if (this.finishedRounds < 5) {

		t.addLabel('slide');
		t.add(this.slideOut(), 'slide');
		t.add(this.betweenRounds(), 'slide');
		t.add(this.agentJump(), 'slide+=4.8');
		t.add(this.newRound(), '-=4');

	 	t.addLabel('fadeIn', '+=2');
	 	t.addCallback(function () {
			
			for (var i = 0; i < 3; i++) {

				t.add(new TweenMax(this.choices[i], 2, {alpha:1}), 'fadeIn');
			}
		}, null, null, this);
	 	t.add(new TweenMax(this.helpGroup, 2, {alpha:0.3}), 'fadeIn+=0.8');

		t.addSound(this.a.speech, this.a, 'whichGarland', 'fadeIn+=0.8');

		if (this.finishedRounds < 3) {

			t.addSound(this.a.speech, this.a, 'helpMeFlags', '+=1.5');
		}

	 	if (this.finishedRounds === 0) {

	 		t.addCallback(this.addArrow, null, null, this);
	 		t.addCallback(function () {

				this.disable(false);
			}, '+=2.3', null, this);
	 	}

	 	else {

		 	t.addCallback(function () {

				this.disable(false);
			}, '+=0.5', null, this);
		 }

		 t.addCallback(this.trollStart, null, null, this);
	 }

	 else if (this.finishedRounds === 5) {

	 	t.addCallback(this.modeOutro, '+=1', null, this);
	 }
};



PartyGarlandGame.prototype.modeOutro = function () {

	var t = new TimelineMax();
	
	t.addSound(this.a.speech, this.a, 'looksGood');
	t.addSound(this.a.speech, this.a, 'finished', '+=0.5');

	t.add(this.a.move({ x:1200, ease: Power0.easeNone}, 3.5));

	t.add(this.t.water(400, this));

	t.add(this.afterGarlands());

	t.addLabel('glade', '+=2');
	t.addCallback(function () {

		this.gladeIntro.add(this.t);
		this.gladeIntro.add(this.a);
		
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
	}, null, null, this);

	t.add(new TweenMax(this.gladeIntro, 2, {alpha:1}), 'glade+=0.5');

	t.addSound(this.t.speech, this.t, 'isGood', '+=0.3');

	t.addSound(this.t.speech, this.t, 'continueWhenBack', '+=0.5');

	t.addSound(this.a.speech, this.a, 'thanksForHelp', '+=0.5');

	t.addCallback(this.endGame, '+=3', null, this);
};




/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Create pile objects                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/



FlagPile.prototype = Object.create(Phaser.Group.prototype);
FlagPile.prototype.constructor = FlagPile;
function FlagPile (game, x, y, amount, pileType, tints) {

	Phaser.Group.call(this, game, null); // Parent constructor.

	var i;

	this.rope = this.create(0, 0, 'garland', 'rope');
	this.rope.scale.set(0.5);
	this.rope.anchor.set(0.5);
	this.rope.visible = false;

	this.pileGroup = this.game.add.group(this);

	this.x = x;
	this.y = y;
	this.handle = this.create(-50, 0, '', '');
	this.handle.inputEnabled = true;
	this.handle.anchor.set(0, 0.5);

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
	}

	else {

		this.pileGroup.update = function () {

			this.x = what.x - this.parent.x;
			this.y = what.y - this.parent.y;
		};
	}
};



FlagPile.prototype.pileTypes = function () {

	var flags;
	var angle;
	var radius;
	var i;
	var j;
	var pos;


	if (this.type === 'piles') {

		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {

			flags = this.pileGroup.children[i];
			angle = this.game.rnd.angle();
			radius = (this.rope.width - 50) / 2;

			flags.x = Math.cos(angle)*Math.random()*radius;
			flags.y = Math.sin(angle)*Math.random()*radius;
	
			for (j = 0; j < i; j++) {

				pos = flags.position.distance(this.pileGroup.children[j].position);

				if (pos < 40) {

					i--;
					break;
				}
			}
			
		}
	}


	else if (this.type === 'garland') {

		for (i = 1; i < this.pileGroup.children.length; i++) {

			flags = this.pileGroup.children[i];

			flags.x = this.pileGroup.children[i - 1].x + this.pileGroup.children[i].width;
			flags.y = this.pileGroup.children[i].y;
		}
	}


	else if (this.type === 'manyNumber') {

		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {

			flags = this.pileGroup.children[i];
			angle = this.game.rnd.angle();
			radius = (this.rope.width - 50) / 2;

			flags.x = Math.cos(angle)*Math.random()*radius;
			flags.y = Math.sin(angle)*Math.random()*radius;
	
			for (j = 0; j < i; j++) {

				pos = flags.position.distance(this.pileGroup.children[j].position);

				if (pos < 40) {

					i--;
					break;
				}
			}
			
		}

		if (this.nr) {

			this.nr.destroy();
		}
		
		this.nr = new NumberText (this.game, 0, 140, this.pileGroup.children.length, 35);
		this.add(this.nr);
	}


	else if (this.type === 'singleNumber') {

		this.rope.visible = true;

		for (i = 0; i < this.pileGroup.children.length; i++) {

			flags = this.pileGroup.children[i];

			flags.x = 0;
			flags.y = 0;
		}

		if (this.nr) {

			this.nr.destroy();
		}
		
		this.nr = new NumberText (this.game, 0, 140, this.pileGroup.children.length, 35);
		this.add(this.nr);
	}
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Create number objects                            */
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


