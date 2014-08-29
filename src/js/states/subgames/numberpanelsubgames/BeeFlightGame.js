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
		start: 300, stopOffset: -50
	},
	bee: {
		x: 100, y: 300
	},
	agent: {
		start: { x: -200, y: 700 },
		stop: { x: 300, y: 500 },
		scale: 0.25
	}
};

/* Phaser state function */
BeeFlightGame.prototype.preload = function () {
	this.load.audio('beeMusic', ['assets/audio/subgames/beeflight/music.ogg', 'assets/audio/subgames/beeflight/music.mp3']);
	this.load.audio('beePlaceholder', LANG.SPEECH.AGENT.hmm);

	this.load.image('beeBg',     'assets/img/subgames/beeflight/bg.png');
	this.load.image('beeBody',   'assets/img/subgames/beeflight/humfrid.png');
	this.load.image('beeFlower', 'assets/img/subgames/beeflight/flower.png');
};

/* Phaser state function */
BeeFlightGame.prototype.create = function () {
	NumberPanelSubgame.prototype.create.call(this);

	// This is used to know where the bee is.
	this.atValue = 0;

	// Add music
	this.add.audio('beeMusic', 1, true).play();

	// Add background
	this.add.sprite(0, 0, 'beeBg', null, this.gameGroup);
	this.gameGroup.bringToTop(this.agent);

	// Setup flowers
	var size = this.world.width - this.pos.flowers.stopOffset - this.pos.flowers.start;
	var width = size / this.amount;
	this.flowers = [];
	for (var i = 0; i < this.amount; i++) {
		this.flowers.push(this.add.sprite(this.pos.flowers.start + width*i, 400, 'beeFlower', null, this.gameGroup));
		this.flowers[i].anchor.set(0.5, 0);
	}

	// Setup bee
	this.bee = new BeeFlightBee(this.pos.bee.x, this.pos.bee.y);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.bee.addThought(-100, -75, this.representation[0]);
	}
	this.gameGroup.add(this.bee);


	// Add Timeline/Tween functions
	var _this = this; // Subscriptions do not have access to 'this' object
	this.bee.moveTo = {
		start: function () {
			var t = new TimelineMax();
			t.add(_this.bee.move(_this.pos.bee, 3));
			t.add(_this.bee.moveTurn(1));
			return t;
		},
		flower: function (number) {
			var t = new TimelineMax();
			t.add(_this.bee.move({ x: _this.flowers[number].x }, 3));
			t.add(_this.bee.move({ y: _this.flowers[number].y }, 1));
			return t;
		}
	};
	this.agent.moveTo = {
		start: function () {
			if (_this.agent.x === _this.pos.agent.stop.x &&
				_this.agent.y === _this.pos.agent.stop.y) {
				return new TweenMax(_this.agent);
			}
			return _this.agent.move({ x: _this.pos.agent.stop.x, y: _this.pos.agent.stop.y }, 3);
		}
	};


	// Everything is set up! Blast off!
	this.startGame();
};

BeeFlightGame.prototype.getOptions = function () {
	var size = this.world.width - this.pos.flowers.stopOffset - this.pos.flowers.start;
	return {
		buttons: {
			x: this.pos.flowers.start,
			y: 25,
			size: size,
		},
		yesnos: {
			x: this.pos.flowers.start,
			y: 25,
			size: size,
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
	t.add(new TweenMax(this.flowers[this.currentNumber-1], 1, { tint: '0x33ffff' }));
	return t;
};

BeeFlightGame.prototype.startStop = function () {
	// Do nothing
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

BeeFlightGame.prototype.runNumber = function (number) {
	this.disable(true);

	var current = this.currentNumber-1;
	var result = this.tryNumber(number);

	var t = new TimelineMax();
	t.add(this.bee.moveTo.flower(number-1));
	if (!result) { // Correct :)
		t.addCallback(this.hideButtons, null, null, this);
		t.add(new TweenMax(this.flowers[current], 1, { tint: '0xffffff' }));
		t.add(this.bee.moveTo.start());
	} else { // Incorrect :(
		t.add(new TweenMax(this.flowers[current], 1, { tint: '0xff33ff' }));
		this.doReturnFunction(t, number, result);
	}

	if (this.isRelative) {
		t.addCallback(function () {
			this.addToNumber = parseInt(this.atValue);
			this.updateButtons();
		}, null, null, this);
	}

	return t;
};

BeeFlightGame.prototype.returnToStart = function (t) {
	this.atValue = 0;
	t.add(this.bee.moveTo.start());
};

BeeFlightGame.prototype.returnNone = function (t, number) {
	this.atValue = number;
	// Do nothing else
};

BeeFlightGame.prototype.returnToPreviousIfHigher = function (t, number, diff) {
	if (diff > 0) {
		t.addSound('beePlaceholder'); // I think that is too high. Mouth is open, no animation.
	} else {
		this.returnNone(t, number);
	}
};

BeeFlightGame.prototype.returnToPreviousIfLower = function (t, number, diff) {
	if (diff < 0) {
		t.addSound('beePlaceholder'); // I think that is too low. Mouth is open, no animation.
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

	this.body = game.add.sprite(0, 0, 'beeBody', null, this);
	this.body.anchor.set(0.5);
}
