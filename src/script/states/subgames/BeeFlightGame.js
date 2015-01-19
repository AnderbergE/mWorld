var NumberGame = require('./NumberGame.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var util = require('../../utils.js');
var Character = require('../../agent/Character.js');

module.exports = BeeFlightGame;

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bee Flight game
/* Methods:         All
/* Representations: All, except "none".
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype = Object.create(NumberGame.prototype);
BeeFlightGame.prototype.constructor = BeeFlightGame;
function BeeFlightGame () {
	NumberGame.call(this); // Call parent constructor.
}

BeeFlightGame.prototype.pos = {
	flowers: {
		start: 325, stopOffset: 0
	},
	home: {
		x: 110, y: 700
	},
	bee: {
		x: 120, y: 300,
		homeScale: 0.3,
		airScale: 0.8,
		flowerScale: 0.6
	},
	agent: {
		start: { x: 1200, y: 400 },
		stop: { x: 777, y: 360 },
		scale: 0.35
	}
};

BeeFlightGame.prototype.buttonColor = 0xface3d;

/* Phaser state function */
BeeFlightGame.prototype.preload = function () {
	this.load.audio('beeSpeech', LANG.SPEECH.beeflight.speech); // speech sheet
	this.load.audio('beeMusic', ['audio/subgames/beeflight/music.m4a', 'audio/subgames/beeflight/music.ogg', 'audio/subgames/beeflight/music.mp3']);
	this.load.atlasJSONHash('bee', 'img/subgames/beeflight/atlas.png', 'img/subgames/beeflight/atlas.json');
};

/* Phaser state function */
BeeFlightGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	this.setupButtons({
		buttons: {
			x: 150,
			y: 25,
			size: this.world.width - 300
		},
		yesnos: {
			x: 150,
			y: 25,
			size: this.world.width - 300
		}
	});

	// Add music, sounds and speech
	this.speech = util.createAudioSheet('beeSpeech', LANG.SPEECH.beeflight.markers);
	this.add.audio('beeMusic', 0.1, true).play();

	// Add background
	this.add.sprite(0, 0, 'bee', 'bg', this.gameGroup);
	var cloud1 = this.gameGroup.create(0, 10, 'objects', 'cloud2');
	var cloud2 = this.gameGroup.create(0, 150, 'objects', 'cloud1');
	TweenMax.fromTo(cloud1, 380, { x: -cloud1.width }, { x: this.world.width, repeat: -1 });
	TweenMax.fromTo(cloud2, 290, { x: -cloud2.width }, { x: this.world.width, repeat: -1 });
	var home = this.add.sprite(this.pos.home.x, this.pos.home.y, 'bee', 'home', this.gameGroup);
	home.anchor.set(0.5, 1);
	this.agent.thought.y += 100;
	this.gameGroup.bringToTop(this.agent);

	// Setup flowers
	var size = this.world.width - this.pos.flowers.stopOffset - this.pos.flowers.start;
	var width = size / this.amount;
	var yPos = 550;
	this.flowers = [];
	var i, v, c;
	for (i = 0; i < this.amount; i++) {
		this.flowers.push(this.add.sprite(this.pos.flowers.start + width*i, yPos, 'bee', 'flower', this.gameGroup));
		this.flowers[i].anchor.set(0.5, 0);

		// Calculate tint
		v = this.rnd.integerInRange(150, 230);
		c = this.rnd.integerInRange(1, 3);
		this.flowers[i].tint = Phaser.Color.getColor(c === 1 ? v : 255, c === 2 ? v : 255, c === 3 ? v : 255);
	}

	// Setup bee
	this.bee = new BeeFlightBee(this.game, this.pos.home.x, this.pos.home.y);
	this.bee.scale.set(this.pos.bee.homeScale);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.bee.addThought(170, -75, this.representation[0], true);
		this.bee.thought.toScale = 0.7;
	}
	this.gameGroup.add(this.bee);


	// Add Timeline/Tween functions
	var _this = this;
	this.bee.moveTo = {
		home: function () {
			var t = new TimelineMax();
			t.addCallback(_this.bee.flap, null, [true], _this.bee);
			t.add(_this.bee.move(_this.pos.home, 5, _this.pos.bee.homeScale));
			t.addCallback(_this.bee.flap, null, [false], _this.bee);
			return t;
		},
		start: function () {
			var t = new TimelineMax();
			t.addCallback(_this.bee.flap, null, [true], _this.bee);
			t.add(_this.bee.move(_this.pos.bee, 3, _this.pos.bee.airScale));
			return t;
		},
		flower: function (target, direct) {
			var t = new TimelineMax();
			t.addCallback(_this.bee.flap, null, [true], _this.bee);
			if (_this.bee.y > 300) {
				t.add(_this.bee.move({ y: _this.pos.bee.y }, 1));
			}

			var flow = _this.flowers[target - 1];
			if (this.atValue !== target) {
				if (direct) {
					t.add(_this.bee.move({ x: flow.x }, 2));
				} else {
					var dir = target < _this.atValue ? -1 : 1;
					var i = _this.atValue + dir;
					while (i !== target + dir) {
						t.add(_this.bee.move({ x: _this.flowers[i - 1].x }, 1));
						t.addSound(_this.speech, _this.bee, 'number' + i, '-=0.5');
						i += dir;
					}
				}
			}

			t.add(_this.bee.move({ y: flow.y }, 0.75, _this.pos.bee.flowerScale));
			t.addCallback(_this.bee.flap, null, [false], _this.bee);
			return t;
		}
	};
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Instruction functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype.instructionCount = function () {
	var t = new TimelineMax();
	t.addCallback(this.updateButtons, null, null, this);
	t.add(this.newFlower());
	t.addSound(this.speech, this.bee, 'showTheWay');
	t.addSound(this.speech, this.bee, 'decideHowFar', '+=0.8');
	t.add(this.pointAtFlowers(this.currentNumber));
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.bee, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

BeeFlightGame.prototype.instructionSteps = BeeFlightGame.prototype.instructionCount;

BeeFlightGame.prototype.instructionAdd = function () {
	var t = new TimelineMax();
	t.add(this.newFlower(true));
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, this.bee, 'wrongPlace');
	t.addSound(this.speech, this.bee, 'notFarEnough', '+=0.8');
	// t.add(this.pointAtFlowers(this.currentNumber));
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.bee, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

BeeFlightGame.prototype.instructionSubtract = function () {
	var t = new TimelineMax();
	t.add(this.newFlower(true));
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, this.bee, 'goneTooFar');
	// t.add(this.pointAtFlowers(this.currentNumber));
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.bee, 'pushNumber', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

BeeFlightGame.prototype.instructionAddSubtract = function () {
	var t = new TimelineMax();
	t.add(this.newFlower());
	t.addCallback(this.updateButtons, null, null, this);
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.5');
	t.addSound(this.speech, this.bee, 'useButtons', 'useButtons');
	t.add(util.fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

BeeFlightGame.prototype.pointAtFlowers = function (number) {
	var startY = this.pos.bee.y;
	var arrow = this.gameGroup.create(this.flowers[0].x, startY, 'objects', 'arrow');
	arrow.tint = 0xf0f000;
	arrow.anchor.set(0, 0.5);
	arrow.rotation = -Math.PI/2;
	arrow.visible = false;

	var t = new TimelineMax();
	t.addCallback(function () { arrow.visible = true; });
	t.addCallback(function () {}, '+=0.5');
	for (var i = 0; i < number; i++) {
		if (i !== 0) {
			t.add(new TweenMax(arrow, 0.75, { x: this.flowers[i].x, y: startY }), '+=0.3');
		}
		t.add(new TweenMax(arrow, 1, { y: this.flowers[i].y }));
	}
	t.addCallback(function () { arrow.destroy(); }, '+=0.5');
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype.newFlower = function (silent) {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.flowers[this.currentNumber - 1].frameName = 'flower' + this.currentNumber;
		// TODO: This tint is due to a bug in Pixi, remove when bug is fixed.
		this.flowers[this.currentNumber - 1].tint--;
	}, null, null, this);

	this.doStartFunction(t, silent);
	return t;
};

BeeFlightGame.prototype.startStop = function () {
	// Do nothing
};

BeeFlightGame.prototype.startBelow = function (t, silent) {
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
	if (!silent) {
		t.addSound(this.speech, this.bee, 'notFarEnough');
	}
};

BeeFlightGame.prototype.startAbove = function (t, silent) {
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
	if (!silent) {
		t.addSound(this.speech, this.bee, 'goneTooFar');
	}
};

BeeFlightGame.prototype.startThink = function (t) {
	var addTo = this.rnd.integerInRange(1, this.amount);
	t.addCallback(function () {
		this.addToNumber = addTo;
		this.bee.thought.guess.number = this.addToNumber;
	}, null, null, this);
	t.addSound(this.speech, this.bee, 'thinkItIs');
	t.addLabel('number', '+=0.3');
	t.add(this.bee.think());
	t.addSound(this.speech, this.bee, 'number' + addTo, 'number');
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Number chosen and return functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype.runNumber = function (number, simulate) {
	var current = this.currentNumber-1;
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);

	this.disable(true);
	this.agent.eyesFollowObject(this.bee);
	if (this.bee.thought) {
		this.bee.thought.visible = false;
	}

	var t = new TimelineMax();
	if (GLOBAL.debug) { t.skippable(); }

	if (!simulate) {
		if (number !== 0) {
			var moving = Math.abs(number);
			if (this.isRelative) {
				t.addSound(this.speech, this.bee, moving === 1 ? 'one' : 'number' + moving);
				t.addSound(this.speech, this.bee, number > 0 ? 'forward' : 'backward');
			} else {
				t.addSound(this.speech, this.bee, 'order' + moving);
				t.addSound(this.speech, this.bee, 'flower');
			}
			t.addCallback(function () {}, '+=0.5'); // Pause until next sound.
		}
		t.addSound(this.speech, this.bee, 'letsGo');
	}

	t.add(this.bee.moveTo.flower(sum));
	
	/* Correct :) */
	if (!result) {
		t.addCallback(function () {
			this.hideButtons();
			this.flowers[current].frameName = 'flower';
			// TODO: This tint is due to a bug in Pixi, remove when bug is fixed.
			this.flowers[current].tint++;
			this.agent.setHappy();
		}, null, null, this);
		t.addSound(this.speech, this.bee, this.rnd.pick(['nectar', 'slurp']));
		t.addLabel('goingHome', '+=0.5');
		t.addSound(this.speech, this.bee, 'goingBack', 'goingHome');
		t.add(this.bee.moveTo.home(), 'goingHome');
		t.add(this.bee.moveTo.start());
		this.atValue = 0;

	/* Incorrect :( */
	} else {
		t.addCallback(this.agent.setSad, null, null, this.agent);
		this.doReturnFunction(t, sum, result, simulate);
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

BeeFlightGame.prototype.returnToStart = function (t) {
	this.atValue = 0;
	t.addSound(this.speech, this.bee, 'noNectar');
	t.add(this.bee.moveTo.start());
	t.add(this.bee.moveTurn(1));
};

BeeFlightGame.prototype.returnNone = function (t, number, notUsed, silent) {
	this.atValue = number;
	if (!silent) {
		t.addSound(this.speech, this.bee, 'noNectar');
	}
};

BeeFlightGame.prototype.returnToPreviousIfHigher = function (t, number, diff, silent) {
	if (diff > 0) {
		t.addSound(this.speech, this.bee, 'tooFar');
		t.addSound(this.speech, this.bee, 'wasBefore');
		t.add(this.bee.moveTo.flower(this.atValue, true));
	} else {
		this.returnNone(t, number, diff, silent);
	}
};

BeeFlightGame.prototype.returnToPreviousIfLower = function (t, number, diff, silent) {
	if (diff < 0) {
		t.addSound(this.speech, this.bee, 'tooNear');
		t.addSound(this.speech, this.bee, 'wasBefore');
		t.add(this.bee.moveTo.flower(this.atValue, true));
	} else {
		this.returnNone(t, number, diff, silent);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype.modeIntro = function () {
	var t = new TimelineMax().skippable();
	t.addSound(this.speech, this.bee, 'badSight');
	t.addLabel('gotoStart', '+=0.5');
	t.add(this.bee.moveTo.start(), 'gotoStart');
	t.addSound(this.speech, this.bee, 'howToFind', 'gotoStart');
	t.addCallback(this.nextRound, null, null, this);
};

BeeFlightGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.doInstructions());  // includes new flower
		} else {
			t.addSound(this.speech, this.bee, 'getMore');
			t.add(this.newFlower());
		}
		t.addCallback(this.showNumbers, null, null, this);
	}
};

BeeFlightGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addSound(this.agent.speech, this.agent, 'beeIntro1');
			t.addLabel('agentIntro', '+=0.5');
			t.add(this.agent.wave(3, 1), 'agentIntro');
			t.addSound(this.agent.speech, this.agent, 'beeIntro2', 'agentIntro');
			t.addCallback(this.agent.eyesFollowObject, 'agentIntro', [this.bee], this.agent);
			t.addSound(this.speech, this.bee, 'gettingHelp', '+=0.2');
			t.addSound(this.agent.speech, this.agent, 'beeIntro3', '+=0.2');
			t.addSound(this.speech, this.bee, 'youHelpLater', '+=0.2');
		}
		t.add(this.newFlower());
		t.addCallback(this.showNumbers, null, null, this);
	}
};

BeeFlightGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		t.addSound(this.agent.speech, this.agent, 'tryAgain');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.agent.speech, this.agent, 'myTurn' + this.rnd.integerInRange(1, 2));
		}
		t.add(this.newFlower());
	}

	t.add(this.agentGuess(), '+=0.3');
	if (intro) {
		t.add(this.instructionYesNo(), '+=0.5');
	}
	t.addCallback(this.showYesnos, null, null, this);
};

BeeFlightGame.prototype.modeOutro = function () {
	this.agent.thought.visible = false;

	var t = new TimelineMax().skippable();
	t.addSound(this.speech, this.bee, 'thatsAll');
	t.addLabel('water');
	t.addLabel('water2', '+=1.5');
	t.addLabel('water3', '+=3');
	t.addCallback(this.agent.setHappy, 'water', null, this.agent);
	t.add(this.agent.fistPump(), 'water');
	t.add(this.addWater(this.bee.x + this.bee.width/2, this.bee.y), 'water');
	t.add(this.addWater(this.bee.x + this.bee.width/2, this.bee.y), 'water2');
	t.add(this.addWater(this.bee.x + this.bee.width/2, this.bee.y), 'water3');
	t.addLabel('letsDance');
	t.add(this.bee.moveTo.home(), 'letsDance');
	t.addSound(this.speech, this.bee, 'dancing', 'letsDance');
	t.addCallback(this.nextRound, null, null, this);
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bee Flight game objects                          */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* Camilla Chameleon, the lizard that you are helping. */
BeeFlightBee.prototype = Object.create(Character.prototype);
BeeFlightBee.prototype.constructor = BeeFlightBee;
function BeeFlightBee (game, x, y) {
	Character.call(this, game); // Parent constructor.
	this.turn = true;
	this.x = x || 0;
	this.y = y || 0;

	this.body = this.create(0, 0, 'bee', 'body');
	this.body.anchor.set(0.5);
	this.mouth = this.create(50, 35, 'bee', 'mouth_happy');
	this.mouth.anchor.set(0.5);
	this.wings = this.create(-25, -43, 'bee', 'wings1');
	this.wings.anchor.set(0.5);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	this._flap = TweenMax.to(this.wings, 0.1, {
		frame: this.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});
	this.wings.frameName = 'wings0';
}

BeeFlightBee.prototype.flap = function (on) {
	if (on) {
		if (this._flap.paused()) {
			this.wings.frameName = 'wings1';
			this._flap.restart(0);
		}
	} else {
		this._flap.pause(0);
		this.wings.frameName = 'wings0';
	}
};