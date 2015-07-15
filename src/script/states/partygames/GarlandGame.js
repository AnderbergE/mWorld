var PartyGame = require('./PartyGame.js');
var Hedgehog = require('../../agent/Hedgehog.js');

module.exports = GarlandGame;


GarlandGame.prototype = Object.create(PartyGame.prototype);
GarlandGame.prototype.constructor = GarlandGame;

function GarlandGame () {
	PartyGame.call(this); // Call parent constructor.
}







GarlandGame.prototype.preload = function () {
	PartyGame.prototype.preload.call(this);

	this.load.atlasJSONHash('garden', 'img/garden/atlas.png', 'img/garden/atlas.json');
	this.load.atlasJSONHash('birdhero', 'img/subgames/birdhero/atlas.png', 'img/subgames/birdhero/atlas.json');
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
	this.load.atlasJSONHash('balloon', 'img/subgames/balloon/atlas.png', 'img/subgames/balloon/atlas.json');
	this.load.atlasJSONHash(Hedgehog.prototype.id, 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
};


GarlandGame.prototype.create = function () {

	this.bg = this.gameGroup.create(0, 0, 'garden', 'bg');

	this.h = new Hedgehog (this.game);
	this.gameGroup.add(this.h);
    this.h.scale.set(0.16);
    this.h.x = 270;
	this.h.y = 245;
	this.h.leftArm.rotation = - 0.8;

	this.garlandGroup = this.add.group(this.gameGroup);
	this.garlandGroup.x = 270;
	this.garlandGroup.y = 230;

	this.flagGroup = this.add.group(this.gameGroup);
	

	this.createPiles();

	this.crown = this.gameGroup.create(80, 30, 'birdhero', 'crown');
	this.tree = this.gameGroup.create(200, 220, 'birdhero', 'bole');
	this.tree.scale.set(0.5);
	this.tree.anchor.set(0.5);
	this.crown.scale.set(0.5);

	this.crown2 = this.gameGroup.create(this.treePosition() - 120, 30, 'birdhero', 'crown');
	this.tree2 = this.gameGroup.create(this.treePosition(), 220, 'birdhero', 'bole');
	this.tree2.scale.set(0.5);
	this.tree2.anchor.set(0.5);
	this.crown2.scale.set(0.5);

	
	
	
	
	//PartyGame.prototype.create.call(this);

};



GarlandGame.prototype.createFlags = function (randomNr, name, x, y) {
	
	var pileGroup = this.add.group(this.flagGroup);
	pileGroup.x = x;
	pileGroup.y = y;

	for (var i = 0; i < randomNr; i++) {
		
		this.flag = pileGroup.create(0, 0, 'bee', name);
		this.flag.angle = 180;
		this.flag.scale.set(0.3);
		this.flag.inputEnabled = true;

	}

	if (this.difficulty <= 3) {

		this.garlandPile(pileGroup);
	}

	else if (this.difficulty <= 10) {

		this.randomPile(pileGroup);
	}

	this.flag.tint = 0x77ee77;
	this.flag.events.onInputDown.add(function (origin) {
			this.chooseFlags(origin, pileGroup);
		}, this);
};






GarlandGame.prototype.createPiles = function () {
	
	var amount = [this.flagAmount(), this.maxNumber(), this.maxNumber()];
	var spriteMix = [this.flagSprite(), this.flagSprite(), this.flagSprite()];
	var positionX = [360, 560, 760];

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

	for (var i = 0; i < 3; i++) {

		this.createFlags(amount[piles[i]], spriteMix[piles[i]], positionX[i], 660);
	}
};


//Pick one of the piles
GarlandGame.prototype.chooseFlags = function (origin, pileGroup) {

	if (!this.activeFlags || (this.activeFlags && !pileGroup)) {

		origin.events.onInputUp.add(this.tryFlags, this);
		
		if (pileGroup) {
			this.activeFlags = pileGroup;
		}
		
		this.world.add(this.activeFlags);
		this.activeFlags.update = this.moveFlags;
	}
};


GarlandGame.prototype.moveFlags = function () {
	
	this.x = this.game.input.activePointer.x;
	this.y = this.game.input.activePointer.y;
};



//Drop the pile on the card
GarlandGame.prototype.tryFlags = function (origin) {

	origin.events.onInputUp.remove(this.tryFlags, this);

	var pileGroup = this.activeFlags;

	this.activeFlags.update = function () {};

	if (this.game.input.activePointer.y < 400) {

		this.garlandGroup.add(pileGroup);

		pileGroup.x = 0;
		pileGroup.y = 0;

		var t = new TimelineMax();

		this.placeGarland(pileGroup);
		t.add(new TweenMax(this.h.leftArm, 1, { rotation: 0.5, ease: Power1.easeIn }));
		t.add(this.h.move({
	 			x:this.h.x + this.flag.width, 
	 			y:this.h.y
	 		}, 2)); 
		this.createGarland(pileGroup);

		this.flag.events.onInputDown.add(function (origin) {
			this.chooseFlags(origin);
		}, this);

	}

	else {

		this.flagGroup.add(pileGroup);
		this.activeFlags = null;

	}
};


GarlandGame.prototype.placeGarland = function (pileGroup) {
	
	for (var i = 0; i < pileGroup.children.length; i++) {

		pileGroup.children[i].x = 0;
		pileGroup.children[i].y = 0;
	}
};


GarlandGame.prototype.createGarland = function (pileGroup) {

	var t = new TimelineMax();

	var i = 1;

	while (i < pileGroup.children.length) {

		var flagX = pileGroup.children[i -1].x + pileGroup.children[i].width * i;

		t.addLabel('start');
		t.to(pileGroup.children[i], 2, {x:flagX, y:0, ease: Power1.easeIn}, 'start');
		t.add(this.h.move({x:400, y:this.h.y, ease: Power1.easeIn}, 2), 'start');

		i++;
	}

	t.addCallback(this.checkFlags, null, null, this);
};



//Check if flag amount is correct
GarlandGame.prototype.checkFlags = function () {
	
	var pileGroup = this.activeFlags;

	if (this.activeFlags) {

		if (pileGroup.children.length === this.flagAmount()) {

			var t = new TimelineMax();
	 		t.addSound(this.h.speech, this.h, 'wasCorrect', 0);
	 	}

		else {

			var s = new TimelineMax();
	 		s.addSound(this.h.speech, this.h, 'wrong1', 0);
		}
	}
};


GarlandGame.prototype.randomPile = function (pileGroup) {
	
	for (var i = 0; i < pileGroup.children.length; i++) {

		var flags = pileGroup.children[i];
		var angle = this.game.rnd.angle();

		flags.x = Math.cos(angle)*Math.random()*50;
		flags.y = Math.sin(angle)*Math.random()*50;
	}
};


GarlandGame.prototype.garlandPile = function (pileGroup) {
	
	var t = new TimelineMax();

	for (var i = 1; i < pileGroup.children.length; i++) {

		var flags = pileGroup.children[i];


		flags.x = pileGroup.children[i - 1].x + this.flag.width;
		flags.y = pileGroup.children[i].y;

		t.to(flags, 0, {x:flags.x, y:flags.y, ease: Power1.easeIn});
	}

	if (pileGroup.children.length > 2) {

		var positionY = [350, 450, 550];

		for (var j = 0; j < 3; j++) {

			pileGroup.y = positionY[j];
		}
	}
};



//Change level of difficulty
GarlandGame.prototype.flagAmount = function () {
	
	if (this.difficulty <= 3) {

		return 4;
	}

	else if(this.difficulty <= 10) {
		
		return 9;
	}
};


//Change level of difficulty
GarlandGame.prototype.flagSprite = function () {

	if (this.difficulty <= 10) {

		var sprites1 = ['home'];
		var rndSprite1 = this.game.rnd.pick(sprites1);
		return rndSprite1;
	}

	
};



//Change level of difficulty
GarlandGame.prototype.treePosition = function () {

	if (this.difficulty <= 3) {
		
		return this.garlandGroup.x + (41 * 4);
	}

	if (this.difficulty <= 10) {
		
		return this.garlandGroup.x + (41 * 9);
	}
	
};



//Change level of difficulty
GarlandGame.prototype.maxNumber = function () {
	
	if (this.difficulty <= 3) {

		return this.game.rnd.between(1, 4);
	}

	else if(this.difficulty <= 10) {
		
		return this.game.rnd.between(1, 9);
	}
};







GarlandGame.prototype.modeIntro = function () {

		

		var t = new TimelineMax();
		//this.partyIntro(t);

		t.addCallback(this.modePlayerDo, null, null, this);
		

	 	

};


GarlandGame.prototype.modePlayerDo = function () {

		this.disable(false);
		

	
};


