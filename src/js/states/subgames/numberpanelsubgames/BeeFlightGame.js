/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bee Flight game                               */
/* Representations: All
/* Range:           1--4
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype = Object.create(NumberPanelSubgame.prototype);
BeeFlightGame.prototype.constructor = BeeFlightGame;
function BeeFlightGame () {
	NumberPanelSubgame.call(this); // Call parent constructor.
}

BeeFlightGame.prototype.pos = {
	flowers: {
		start: 325, stopOffset: 0
	},
	home: {
		x: 110, y: 700
	},
	homeScale: 0.3,
	bee: {
		x: 120, y: 300
	},
	agent: {
		start: { x: 1200, y: 400 },
		stop: { x: 777, y: 360 },
		scale: 0.35
	}
};

/* Phaser state function */
BeeFlightGame.prototype.preload = function () {
	this.load.audio('beeMusic', ['assets/audio/subgames/beeflight/music.ogg', 'assets/audio/subgames/beeflight/music.mp3']);
	this.load.audio('beePlaceholder', LANG.SPEECH.AGENT.hmm);

	this.load.atlasJSONHash('bee', 'assets/img/subgames/beeflight/atlas.png', 'assets/img/subgames/beeflight/atlas.json');
};

/* Phaser state function */
BeeFlightGame.prototype.create = function () {
	NumberPanelSubgame.prototype.create.call(this);

	// Add music
	this.add.audio('beeMusic', 1, true).play();

	// Add background
	this.add.sprite(0, 0, 'bee', 'bg', this.gameGroup);
	var home = this.add.sprite(this.pos.home.x, this.pos.home.y, 'bee', 'home', this.gameGroup);
	home.anchor.set(0.5, 1);
	this.gameGroup.bringToTop(this.agent);

	// Setup flowers
	var size = this.world.width - this.pos.flowers.stopOffset - this.pos.flowers.start;
	var width = size / this.amount;
	var yPos = this.amount > 5 ? 450 : 550;
	var yOffset = this.amount > 5 ? 50 : 0;
	this.flowers = [];
	var i, v, c, row;
	for (i = 0; i < this.amount; i++) {
		row = (i % 3);
		this.flowers.push(this.add.sprite(this.pos.flowers.start + width*i, yPos + yOffset * row, 'bee', 'flower', this.gameGroup));
		if (!row && i !== 0) { // So that the flower nearest is on top of farest.
			this.gameGroup.moveDown(this.flowers[i]);
		}
		this.flowers[i].anchor.set(0.5, 0);

		// Calculate tint
		v = this.rnd.integerInRange(150, 230);
		c = this.rnd.integerInRange(1, 3);
		this.flowers[i].tint = Phaser.Color.getColor(c === 1 ? v : 255, c === 2 ? v : 255, c === 3 ? v : 255);
	}

	// Setup bee
	this.bee = new BeeFlightBee(this.pos.home.x, this.pos.home.y);
	this.bee.scale.set(this.pos.homeScale);
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
			t.add(_this.bee.move(_this.pos.home, 3, _this.pos.homeScale));
			return t;
		},
		start: function () {
			var t = new TimelineMax();
			t.add(_this.bee.move(_this.pos.bee, 3, 1));
			return t;
		},
		flower: function (target, direct) {
			var t = new TimelineMax();
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
					t.addLabel('flow' + i);
					while (i !== target + dir) {
						t.add(_this.bee.move({ x: _this.flowers[i - 1].x }, 1), 'flow' + i);
						i += dir;
						t.addLabel('flow' + i);
						t.addLabel('flows' + i, '-=0.5');
						t.addSound('beePlaceholder', _this.bee, null, 'flows' + i);
					}
				}
			}

			t.add(_this.bee.move({ y: flow.y }, 0.75));
			return t;
		}
	};


	// Everything is set up! Blast off!
	this.startGame();
};

BeeFlightGame.prototype.getOptions = function () {
	return {
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
	};
};

BeeFlightGame.prototype.instructionIntro = function () {
	var t = new TimelineMax();
	//t.addSound(speech, bird, 'instruction1a');
	// t.add(pointAtBole(_this.currentNumber));
	t.add(fade(this.buttons, true));
	t.add(this.buttons.highlight(1));
	//t.addSound(speech, bird, 'instruction1b');
	return t;
};

BeeFlightGame.prototype.newFlower = function () {
	var t = new TimelineMax();
	t.add(this.bee.moveTo.start());
	t.addCallback(function () {
		this.flowers[this.currentNumber - 1].frameName = 'flower' + this.currentNumber;
	}, null, null, this);
	this.doStartFunction(t);
	return t;
};

BeeFlightGame.prototype.startStop = function (t) {
	t.addSound('beePlaceholder', this.bee);
};

BeeFlightGame.prototype.startBelow = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
};

BeeFlightGame.prototype.startAbove = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
};

BeeFlightGame.prototype.startThink = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(1, this.amount);
		this.bee.thought.guess.number = this.addToNumber;
		this.updateButtons();
	}, null, null, this);
	t.add(this.bee.think());
};

BeeFlightGame.prototype.runNumber = function (number, simulate) {
	this.disable(true);

	var current = this.currentNumber-1;
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);
	if (this.bee.thought) {
		this.bee.thought.visible = false;
	}

	var t = new TimelineMax();
	t.add(this.bee.moveTo.flower(sum));
	if (!result) { // Correct :)
		t.addCallback(function () {
			this.hideButtons();
			this.flowers[current].frameName = 'flower';
		}, null, null, this);
		t.add(this.bee.moveTo.home());
		this.atValue = 0;
	} else { // Incorrect :(
		this.doReturnFunction(t, sum, result);
	}

	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

BeeFlightGame.prototype.returnToStart = function (t) {
	this.atValue = 0;
	t.add(this.bee.moveTo.start());
	t.add(this.bee.moveTurn(1));
};

BeeFlightGame.prototype.returnNone = function (t, number) {
	this.atValue = number;
	// Do nothing else
};

BeeFlightGame.prototype.returnToPreviousIfHigher = function (t, number, diff) {
	if (diff > 0) {
		t.add(this.bee.moveTo.flower(this.atValue, true));
	} else {
		this.returnNone(t, number);
	}
};

BeeFlightGame.prototype.returnToPreviousIfLower = function (t, number, diff) {
	if (diff < 0) {
		t.add(this.bee.moveTo.flower(this.atValue, true));
	} else {
		this.returnNone(t, number);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype.modeIntro = function () {
	var t = new TimelineMax();
	t.addCallback(this.nextRound, null, null, this);
};

BeeFlightGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.newFlower());
			t.add(this.instructionIntro());
		} else {
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
			t.addLabel('agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
		}
		t.add(this.newFlower());
		t.addCallback(this.showNumbers, null, null, this);
	}
};

BeeFlightGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		this.agent.eyesStopFollow();
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
		}
		t.add(this.newFlower());
		
	}

	t.add(this.agentGuess());
	t.addCallback(this.showYesnos, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bee Flight game objects                          */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* Camilla Chameleon, the lizard that you are helping. */
BeeFlightBee.prototype = Object.create(Character.prototype);
BeeFlightBee.prototype.constructor = BeeFlightBee;
function BeeFlightBee (x, y) {
	Character.call(this); // Parent constructor.
	this.turn = true;
	this.x = x || 0;
	this.y = y || 0;

	this.body = this.create(0, 0, 'bee', 'body');
	this.body.anchor.set(0.5);
	this.mouth = this.create(50, 35, 'bee', 'mouth_happy');
	this.mouth.anchor.set(0.5);
	this.wings = this.create(-25, -43, 'bee', 'wings0');
	this.wings.anchor.set(0.5);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	this._flap = TweenMax.to(this.wings, 0.1, {
		frame: this.wings.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	this.flap(true);
}

BeeFlightBee.prototype.flap = function (on) {
	if (on && this._flap.paused()) {
		this._flap.restart(0);
	} else {
		this._flap.pause(0);
	}
};