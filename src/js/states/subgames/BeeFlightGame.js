/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bee Flight game                               */
/* Representations: All
/* Range:           1--4
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BeeFlightGame.prototype = Object.create(Subgame.prototype);
BeeFlightGame.prototype.constructor = BeeFlightGame;
function BeeFlightGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BeeFlightGame.prototype.preload = function () {
	this.load.audio('beeMusic', ['assets/audio/subgames/beeflight/music.ogg', 'assets/audio/subgames/beeflight/music.mp3']);

	this.load.image('beeBg',     'assets/img/subgames/beeflight/bg.jpg');
	this.load.image('beeBody',   'assets/img/subgames/beeflight/bumble.png');
	this.load.image('beeFlower', 'assets/img/subgames/beeflight/flower.png');
};

/* Phaser state function */
BeeFlightGame.prototype.create = function () {
	var _this = this; // Subscriptions do not have access to 'this' object
	var coords = {
		flowers: {
			start: 300, stop: this.world.width - 50
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
	coords.flowers.size = coords.flowers.stop - coords.flowers.start;

	// Add music
	var music = this.add.audio('beeMusic', 1, true);

	// Add main game
	this.add.sprite(0, 0, 'beeBg', null, this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.set(coords.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = coords.agent.stop.x + 200;
	this.agent.thought.y = coords.agent.stop.y - 200;
	this.agent.thought.visible = false;
	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.scale.x = -1;
	thoughtBubble.anchor.set(0.5);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	var flowers = [];
	var width = coords.flowers.size / this.amount;
	for (var i = 0; i < this.amount; i++) {
		flowers.push(this.add.sprite(coords.flowers.start + width*i, 400, 'beeFlower', null, this.gameGroup));
		flowers[i].anchor.set(0.5, 0);
	}

	// Setup bee
	var bee = new BeeFlightBee(coords.bee.x, coords.bee.y);
	this.gameGroup.add(bee);

	// Add HUD
	var buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		x: coords.flowers.start,
		y: 25,
		size: coords.flowers.size,
		onClick: pushNumber
	});
	buttons.visible = false;
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: coords.flowers.start,
		y: 25,
		size: coords.flowers.size,
		onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);


	// Add Timeline/Tween functions
	bee.moveTo = {
		start: function () {
			var t = new TimelineMax();
			t.add(bee.move(coords.bee, 3));
			t.add(bee.moveTurn(1));
			return t;
		},
		flower: function (number) {
			var t = new TimelineMax();
			t.add(bee.move({ x: flowers[number].x }, 3));
			t.add(bee.move({ y: flowers[number].y }, 1));
			return t;
		}
	};
	this.agent.moveTo = {
		start: function () {
			if (_this.agent.x === coords.agent.stop.x &&
				_this.agent.y === coords.agent.stop.y) {
				return new TweenMax(_this.agent);
			}
			return _this.agent.move({ x: coords.agent.stop.x, y: coords.agent.stop.y }, 3);
		}
	};


	/* Function to trigger when a number button is pushed */
	function pushNumber (number) {
		_this.disable(true);

		var current = _this.currentNumber-1;
		var result = _this.tryNumber(number);

		var t = new TimelineMax();
		t.add(bee.moveTo.flower(number-1));
		if (!result) { // Correct :)
			t.add(new TweenMax(flowers[current], 1, { tint: '0xffffff' }));
		} else { // Incorrect :(
			t.add(new TweenMax(flowers[current], 1, { tint: '0xff33ff' }));
		}
		t.add(bee.moveTo.start());
		t.addCallback(function () { _this.nextRound(); });
	}
	/* Function to trigger when a yes/no button is pushed */
	function pushYesno (value) {
		if (!value) {
			showNumbers();
		}
		else { pushNumber(_this.agent.lastGuess); }
	}

	/* Show the number panel, hide the yes/no panel and enable input */
	function showNumbers () {
		_this.disable(true);
		buttons.reset();
		fade(yesnos, false);
		fade(buttons, true).eventCallback('onComplete', _this.disable, false, _this);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		_this.disable(true);
		yesnos.reset();
		fade(buttons, false);
		fade(yesnos, true).eventCallback('onComplete', _this.disable, false, _this);

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}
	/* Hide the number and yes/no panel */
	function hideButtons () {
		_this.disable(true);
		fade(buttons, false);
		fade(yesnos, false);

		if (_this.agent.visible) { _this.agent.eyesStopFollow(); }
	}

	function newFlower () {
		var t = new TimelineMax();
		t.add(new TweenMax(flowers[_this.currentNumber-1], 1, { tint: '0x33ffff' }));
		return t;
	}

	/* Have the agent guess a number */
	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);

		return TweenMax.fromTo(_this.agent.thought.scale, 1.5,
			{ x: 0, y: 0 },
			{ x: 1, y: 1,
				ease: Elastic.easeOut,
				onStart: function () {
					_this.agent.thought.visible = true;
					if (_this.agent.thought.guess) { _this.agent.thought.guess.destroy(); }
					// say('birdheroAgentHmm', _this.agent).play();
				},
				onComplete: function () {
					_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, _this.representation, {
						x: -20, y: -30, disabled: true
					});
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					showYesnos();
				}
			});
	}

/*
	function pointAtBole (number) {
		var first = tree.pieces[0];
		var center = { x: first.width*tree.scale.x/2, y: first.height*tree.scale.y/2*1.3 }; // 1.2 is a offset
		var start = first.world;
		var offset = 70;
		var arrow = game.add.sprite(start.x + center.x + offset, start.y - center.y, 'lizardArrow', null, this.gameGroup);
		arrow.visible = false;

		var t = new TimelineMax();
		t.addCallback(function () { arrow.visible = true; });
		for (var i = 0; i < number; i++) {
			var pos = tree.pieces[i].world;
			if (i !== 0) { t.add(new TweenMax(arrow, 1, { x: '+=' + offset, y: pos.y - center.y })); }
			t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
		}
		t.addCallback(function () { arrow.destroy(); }, '+=0.5');
		return t;
	}
*/

	function instructionIntro () {
		var t = new TimelineMax();
		//t.addSound(speech, bird, 'instruction1a');
		// t.add(pointAtBole(_this.currentNumber));
		t.add(fade(buttons, true));
		t.add(buttons.highlight(1));
		//t.addSound(speech, bird, 'instruction1b');
		return t;
	}

	this.modeIntro = function () {
		// Most of the intro is in modePlayerDo. But we need a slight wait
		// so that the game world can set up.
		var t = new TimelineMax();
		// t.addSound('lizardPlaceholder', lizard);
		t.addCallback(function () { _this.nextRound(); });
	};

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.skippable();
				t.add(newFlower());
				t.add(instructionIntro());
			} else {
				t.add(newFlower());
			}
			t.addCallback(showNumbers);
		}
	};

	this.modePlayerShow = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start());
				t.addLabel('agentIntro');
				//t.addSound('birdheroAgentShow', _this.agent);
				t.add(_this.agent.wave(3, 1), 'agentIntro');
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentShow'); });
			}
			t.add(newFlower());
			t.addCallback(showNumbers);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var t = new TimelineMax();
		if (tries > 0) {
			_this.agent.eyesStopFollow();
			// TODO: Add more specified sounds?
			//t.addSound('birdheroAgentOops', _this.agent);
			t.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start()); // Agent should be here already.
				//t.addSound('birdheroAgentTry', _this.agent);
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentTry'); });
			}
			t.add(newFlower());
			t.add(agentGuess());
		}
	};


	/* Play music on the first mode. */
	function playMusic () {
		music.play();
		EventSystem.unsubscribe(GLOBAL.EVENT.modeChange, playMusic);
	}
	EventSystem.subscribe(GLOBAL.EVENT.modeChange, playMusic);


	// Everything is set up! Blast off!
	this.startGame();
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
