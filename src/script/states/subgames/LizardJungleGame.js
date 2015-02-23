var LizardJungleLizard = require('./LizardJungleLizard.js');
var NumberGame = require('./NumberGame.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');

module.exports = LizardJungleGame;

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Lizard Jungle game
/* Methods:         All
/* Representations: All, except "none".
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype = Object.create(NumberGame.prototype);
LizardJungleGame.prototype.constructor = LizardJungleGame;
function LizardJungleGame () {
	NumberGame.call(this); // Call parent constructor.
}

/* Position coordinates for the game */
LizardJungleGame.prototype.pos = {
	tree: {
		x: 200, y: 220, height: 550, offset: -10
	},
	agent: {
		start: { x: 1300, y: 500 },
		stop: { x: 700, y: 400 },
		scale: 0.35
	}
};

LizardJungleGame.prototype.buttonColor = 0xb07010;

LizardJungleGame.prototype.tintBank = [
	0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x1122ff, 0x222222, 0xaf9ee3
];


/* Phaser state function */
LizardJungleGame.prototype.preload = function () {
	this.load.audio('lizardSpeech', LANG.SPEECH.lizard.speech); // speech sheet
	this.load.audio('lizardSnore', ['audio/subgames/lizard/snore.m4a', 'audio/subgames/lizard/snore.ogg', 'audio/subgames/lizard/snore.mp3']);
	this.load.audio('lizardMusic', ['audio/subgames/lizard/music.m4a', 'audio/subgames/lizard/music.ogg', 'audio/subgames/lizard/music.mp3']);
	this.load.atlasJSONHash('lizard', 'img/subgames/lizardjungle/atlas.png', 'img/subgames/lizardjungle/atlas.json');
};

/* Phaser state function */
LizardJungleGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	this.setupButtons({
		buttons: {
			x: this.world.width - (this.representation.length*75) - 25,
			y: this.pos.tree.y - 30,
			vertical: true,
			size: this.pos.tree.height,
			reversed: true
		},
		yesnos: {
			x: this.world.width - 100,
			vertical: true,
			color: 0xd6c068
		}
	});
	this.agent.thought.guess.setDirection(true);

	// Add music and speech
	this.add.music('lizardMusic', 1, true).play();
	this.speech = util.createAudioSheet('lizardSpeech', LANG.SPEECH.lizard.markers);

	// Add main game
	this.add.sprite(0, 0, 'lizard', 'bg', this.gameGroup);
	var cloud1 = this.gameGroup.create(0, 33, 'objects', 'cloud2');
	var cloud2 = this.gameGroup.create(0, 222, 'objects', 'cloud1');
	TweenMax.fromTo(cloud1, 300, { x: -cloud1.width }, { x: this.world.width, repeat: -1 });
	TweenMax.fromTo(cloud2, 200, { x: -cloud2.width }, { x: this.world.width, repeat: -1 });
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	this.tree = this.add.group(this.gameGroup);
	this.tree.x = this.pos.tree.x;
	this.tree.y = this.pos.tree.y;
	this.add.sprite(0, 0, 'lizard', 'bole', this.tree).anchor.set(0.5);
	for (var i = this.amount - 2; i >= 0; i--) {
		this.add.sprite(0, this.tree.height + this.pos.tree.offset, 'lizard', 'bole', this.tree).anchor.set(0.5);
	}
	this.tree.scale.set(this.pos.tree.height/this.tree.height);
	var crown = this.add.sprite(
		this.tree.x,
		this.tree.y - (this.tree.children[0].height*this.tree.scale.y)/2,
		'lizard', 'crown', this.gameGroup);
	crown.anchor.set(0.5, 0.6);

	// The target is set up in the newFood function
	this.target = this.add.sprite(0, 0, 'lizard', 'ant', this.gameGroup);
	this.target.anchor.set(0.5);
	this.target.visible = false;

	// Setup lizard
	this.lizard = new LizardJungleLizard(this.game, 575, 500);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.lizard.addThought(-100, -75, this.representation[0]);
		this.lizard.thought.guess.setDirection(true);
	}
	this.gameGroup.add(this.lizard);
};

LizardJungleGame.prototype.getTargetPos = function (number) {
	return {
		x: this.tree.x,
		y: this.tree.y + this.tree.children[this.tree.length - number].y * this.tree.scale.y
	};
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Instruction functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.instructionCount = function () {
	var t = new TimelineMax();
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, this.lizard, 'helpToAim', '+=0.5');
	t.addSound(this.speech, this.lizard, 'howHigh');
	t.add(this.pointAtBole(this.currentNumber));
	t.addLabel('useButtons', '+=0.5');
	t.addLabel('flashButtons', '+=1.2');
	t.addSound(this.speech, this.lizard, 'chooseButton', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

LizardJungleGame.prototype.instructionSteps = LizardJungleGame.prototype.instructionCount;

LizardJungleGame.prototype.instructionAdd = function () {
	var t = new TimelineMax();
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, null, 'imStuck');
	t.addSound(this.speech, null, 'openHowHigher');
	t.add(this.pointAtBole(this.currentNumber, this.atValue));
	t.addLabel('useButtons', '+=0.5');
	t.addLabel('flashButtons', '+=1.2');
	t.addSound(this.speech, null, 'chooseButton', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

LizardJungleGame.prototype.instructionSubtract = function () {
	var t = new TimelineMax();
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, null, 'imStuck');
	t.addSound(this.speech, null, 'openHowLower');
	t.add(this.pointAtBole(this.currentNumber, this.atValue));
	t.addLabel('useButtons', '+=0.5');
	t.addLabel('flashButtons', '+=1.2');
	t.addSound(this.speech, null, 'chooseButton', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

LizardJungleGame.prototype.instructionAddSubtract = function () {
	var t = new TimelineMax();
	t.addCallback(this.updateButtons, null, null, this);
	t.addLabel('useButtons', '+=0.5');
	t.addLabel('flashButtons', '+=1.2');
	t.addSound(this.speech, this.lizard, 'higherOrLower', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

LizardJungleGame.prototype.pointAtBole = function (number, from) {
	from = from || 0;
	var dir = number > from ? 1 : -1;
	var pos = this.getTargetPos(from + dir);
	var offset = 150;
	var arrow = this.add.sprite(pos.x + offset, pos.y, 'objects', 'arrow', this.gameGroup);
	arrow.tint = 0xf0f000;
	arrow.anchor.set(0, 0.5);
	arrow.visible = false;

	var t = new TimelineMax();
	t.addCallback(function () { arrow.visible = true; });
	t.addCallback(function () {}, '+=0.5');
	for (var i = from + dir; i !== number; ) {
		t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
		i += dir;
		pos = this.getTargetPos(i);
		t.add(new TweenMax(arrow, 0.5, { x: '+=' + offset, y: pos.y }), '+=0.3');
	}
	t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
	t.addCallback(function () { arrow.destroy(); }, '+=0.5');
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.newFood = function (skipStart) {
	this.target.x = this.tree.x;
	this.target.y = this.world.height + this.target.height;
	this.target.tint = this.rnd.pick(this.tintBank);

	var t = new TimelineMax();
	t.addCallback(function () { this.target.visible = true; }, null, null, this);
	t.add(new TweenMax(this.target, 1, { y: this.getTargetPos(1).y }));
	for (var i = 1; i < this.currentNumber; i++) {
		t.add(new TweenMax(this.target, 0.8, { y: this.getTargetPos(1 + i).y }));
	}
	
	if (!skipStart) {
		this.doStartFunction(t);
	}

	return t;
};

LizardJungleGame.prototype.startStop = function () {
	// Do nothing
};

LizardJungleGame.prototype.startBelow = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
};

LizardJungleGame.prototype.startAbove = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
};

LizardJungleGame.prototype.startThink = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(1, this.amount);
		this.lizard.thought.guess.number = this.addToNumber;
	}, null, null, this);
	t.addLabel('thinker');
	t.addSound(this.speech, this.lizard, 'thinkItIs', 'thinker');
	t.add(this.lizard.think(), 'thinker');
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Number chosen and return functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.runNumber = function (number, simulate) {
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);

	this.disable(true);
	this.agent.eyesFollowObject(this.target);
	this.lizard.followPointer(false);
	if (this.lizard.thought) {
		this.lizard.thought.visible = false;
	}

	var t = new TimelineMax();
	if (GLOBAL.debug) { t.skippable(); }

	/* Correct :) */
	if (!result) {
		t.add(this.lizard.shootObject(this.target));
		t.addCallback(function () {
			this.hideButtons();
			this.target.visible = false;
			this.agent.setHappy();
		}, null, null, this);
		t.addLabel('afterShot');
		t.addSound(this.speech, this.lizard,
			this.rnd.pick(['yummy', (this.currentMode === GLOBAL.MODE.agentTry ? 'almostFull' : 'thankYou')]), 'afterShot');
		t.add(util.tweenTint(this.lizard, this.target.tint), 'afterShot');
		this.atValue = 0;

	/* Incorrect :( */
	} else {
		t.addCallback(this.agent.setSad, null, null, this.agent);
		t.add(this.doReturnFunction(sum, result, simulate));
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

LizardJungleGame.prototype.returnToStart = function (number, diff) {
	this.atValue = 0;
	var t = new TimelineMax();
	t.add(this.lizard.shoot(this.getTargetPos(number)));
	t.addSound(this.speech, this.lizard,
		this.rnd.pick(['miss', 'treeTaste', diff < 0 ? 'higher' : 'lower']));
	return t;
};

LizardJungleGame.prototype.returnNone = function (number, diff, silent) {
	this.atValue = number;
	var t = new TimelineMax();
	t.add(this.lizard.shoot(this.getTargetPos(number), true));
	if (!silent) {
		t.addSound(this.speech, null,
			this.rnd.pick(['openMiss', diff < 0 ? 'openHigher' : 'openLower']));
	}
	return t;
};

LizardJungleGame.prototype.returnToPreviousIfHigher = function (number, diff, silent) {
	if (diff > 0) {
		var t = new TimelineMax();
		t.add(this.lizard.shootMiss(
			this.getTargetPos(number),
			this.getTargetPos(this.atValue)));
		t.addSound(this.speech, null, 'tooHigh');
		return t;
	} else {
		return this.returnNone(number, diff, silent);
	}
};

LizardJungleGame.prototype.returnToPreviousIfLower = function (number, diff, silent) {
	if (diff < 0) {
		var t = new TimelineMax();
		t.add(this.lizard.shootMiss(
			this.getTargetPos(number),
			this.getTargetPos(this.atValue)));
		t.addSound(this.speech, null, 'tooLow');
		return t;
	} else {
		return this.returnNone(number, diff, silent);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.modeIntro = function () {
	var t = new TimelineMax().skippable();
	t.addLabel('snoring');
	t.addSound(this.add.audio('lizardSnore'), null, null, 'snoring');
	t.add(this.lizard.sleeping(3), 0, 'snoring');
	t.addSound(this.speech, this.lizard, 'sleepyHungry');
	t.add(this.newFood(true));
	t.addSound(this.speech, this.lizard, 'takeThatAnt');
	if (this.currentNumber > 1) {
		t.add(this.lizard.shoot(this.getTargetPos(this.currentNumber - 1)));
		t.addSound(this.speech, this.lizard, 'miss');
	}
	if (this.currentNumber < this.amount) {
		t.add(this.lizard.shoot(this.getTargetPos(this.currentNumber + 1)));
		t.addSound(this.speech, this.lizard, 'treeTaste');
	}
	t.addCallback(this.nextRound, null, null, this);
};

LizardJungleGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.lizard.followPointer(true);
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			if (!this.target.visible) {
				// This is just in case the intro does not play.
				t.add(this.newFood());
			}
			this.doStartFunction(t);
			t.add(this.doInstructions());
		} else {
			t.add(this.newFood());
		}
		t.addCallback(function () {
			this.showNumbers();
			this.lizard.followPointer(true);
		}, null, null, this);
	}
};

LizardJungleGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.lizard.followPointer(true);
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
			t.addSound(this.agent.speech, this.agent, 'lizardIntro1', 'agentIntro');
			t.addCallback(this.agent.eyesFollowObject, 'agentIntro', [this.lizard], this.agent);
			t.addSound(this.speech, this.lizard, 'helpingMeAim', '+=0.5');
			t.addSound(this.agent.speech, this.agent, 'lizardIntro2', '+=0.2');
		}
		t.add(this.newFood());
		t.addCallback(function () {
			this.showNumbers();
			this.lizard.followPointer(true);
		}, null, null, this);
	}
};

LizardJungleGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		t.addSound(this.agent.speech, this.agent, 'tryAgain');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.agent.speech, this.agent, 'myTurn' + this.rnd.integerInRange(1, 2));
		}
		t.add(this.newFood());
	}

	t.add(this.agentGuess(), '+=0.3');
	if (intro) {
		t.add(this.instructionYesNo(), '+=0.5');
	}
	t.addCallback(function () {
		this.showYesnos();
		this.lizard.followPointer(true);
	}, null, null, this);
};

LizardJungleGame.prototype.modeOutro = function () {
	this.agent.thought.visible = false;

	var t = new TimelineMax().skippable();
	t.addSound(this.speech, this.lizard, 'fullAndSleepy', '+=0.5');
	t.addCallback(this.agent.setHappy, null, null, this.agent);
	for (var i = 1; i <= 3; i++) {
		var piece = this.getTargetPos(this.rnd.integerInRange(1, this.amount));
		t.add(this.lizard.shoot(piece));
		t.addCallback(this.addWater, '-=0.9', [piece.x, piece.y], this);
	}
	t.addLabel('finito');
	t.addSound(this.speech, this.lizard, 'byeAndThanks', 'finito');
	t.add(this.agent.fistPump(), 'finito');
	t.addCallback(this.nextRound, null, null, this);
};