/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Lizard Jungle game                              */
/* Representations: All
/* Range:           1--4
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype = Object.create(Subgame.prototype);
LizardJungleGame.prototype.constructor = LizardJungleGame;
function LizardJungleGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
LizardJungleGame.prototype.preload = function () {
	this.load.image('lizardBg',      'assets/img/subgames/lizardjungle/bg.jpg');
	this.load.image('lizardBody',    'assets/img/subgames/lizardjungle/body.png');
	this.load.image('lizardHead',    'assets/img/subgames/lizardjungle/head.png');
	this.load.image('lizardMouth',   'assets/img/subgames/lizardjungle/mouth.png');
	this.load.image('lizardTounge',  'assets/img/subgames/lizardjungle/tounge.png');
	this.load.image('lizardTree',    'assets/img/subgames/lizardjungle/tree.png');
	this.load.image('lizardTreeTop', 'assets/img/subgames/lizardjungle/top.png');
	this.load.image('lizardThought', 'assets/img/subgames/birdhero/thoughtbubble.png');
};

/* Phaser state function */
LizardJungleGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var coords = {
		tree: {
			x: 600, y: 10
		},
		agent: {
			start: { x: 1300, y: 700 },
			stop: { x: 700, y: 400 },
			scale: 0.25
		}
	};

	// Add main game
	this.add.sprite(0, 0, 'lizardBg', null, this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.set(coords.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = coords.agent.stop.x - 200;
	this.agent.thought.y = coords.agent.stop.y - 200;
	this.agent.thought.visible = false;
	var thoughtBubble = this.add.sprite(0, 0, 'lizardThought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	var tree = this.add.group(this.gameGroup);
	tree.x = 200;
	tree.y = 700;
	tree.boleHeight = 0;
	tree.pieces = [];
	for (var i = 1; i <= this.amount; i++) {
		tree.pieces.push(this.add.sprite(0, tree.boleHeight, 'lizardTree', null, tree));
		tree.pieces[i-1].anchor.set(0.5, 1);
		tree.boleHeight -= 78;
	}
	this.add.sprite(0, tree.boleHeight + 5, 'lizardTreeTop', null, tree).anchor.set(0.5, 1);
	tree.scale.set(500/-tree.boleHeight);
	tree.boleHeight = -tree.boleHeight * tree.scale.y;
	var shootOffset = 78 * tree.scale.y / 2;

	// Setup lizard
	var lizard = new LizardJungleLizard(575, 500);
	this.gameGroup.add(lizard);

	// Add HUD
	var buttons = new ButtonPanel(this.amount, this.representation, {
		x: this.world.width-(this.representation.length*75)-25, y: tree.y - tree.boleHeight,
		vertical: true, size: tree.boleHeight, reversed: true,
		background: 'wood', onClick: pushNumber
	});
	buttons.visible = false;
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.width-100, vertical: true, background: 'wood', onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);


	// Add Timeline/Tween functions
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

		var result = _this.tryNumber(number);
		void(result);
		var treePiece = tree.pieces[number-1].world;
		var hit = { x: treePiece.x, y: treePiece.y - shootOffset };

		var t = new TimelineMax();
		t.add(lizard.shoot(hit));
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

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(true); }
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
					say('birdheroAgentHmm', _this.agent).play();
				},
				onComplete: function () {
					_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, _this.representation, {
						x: -60, y: -30, background: 'wood', disabled: true
					});
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					showYesnos();
				}
			});
	}

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
		} else { // if intro or first try
			var t = new TimelineMax();
			//t.add(newBird());
			if (intro) {
				t.eventCallback('onStart', function () { _this.skipper = t; });
				//t.add(instructionIntro());
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
				t.eventCallback('onStart', function () {
					_this.skipper = t;
					hideButtons();
				});
				t.add(_this.agent.moveTo.start());
				t.addLabel('agentIntro');
				//t.addSound('birdheroAgentShow', _this.agent);
				t.add(_this.agent.wave(3, 1), 'agentIntro');
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentShow'); });
			}
			//t.add(newBird());
			t.addCallback(showNumbers);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var t = new TimelineMax();
		if (tries > 0) {
			_this.agent.eyesFollowPointer(true);
			// TODO: Add more specified sounds?
			//t.addSound('birdheroAgentOops', _this.agent);
			t.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				t.eventCallback('onStart', function () {
					_this.skipper = t;
					hideButtons();
				});
				t.add(_this.agent.moveTo.start()); // Agent should be here already.
				//t.addSound('birdheroAgentTry', _this.agent);
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentTry'); });
			}
			//t.add(newBird());
			t.add(agentGuess());
		}
	};

	// Everything is set up! Blast off!
	this.startGame();
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Lizard Jungle game objects                         */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* The bird that you are helping home */
LizardJungleLizard.prototype = Object.create(Phaser.Group.prototype);
LizardJungleLizard.prototype.constructor = LizardJungleLizard;
function LizardJungleLizard (x, y) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;

	this.body = game.add.sprite(48, 0, 'lizardBody', null, this);
	this.head = game.add.group(this);
	this.head.x = 70;
	this.head.y = 55;

	this.tounge = game.add.sprite(10, 15, 'lizardTounge', null, this.head);
	this.tounge.anchor.set(1, 0);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.forehead = game.add.sprite(17, 29, 'lizardHead', null, this.head);
	this.forehead.anchor.set(1, 1);
	this.mouth = game.add.sprite(16, 15, 'lizardMouth', null, this.head);
	this.mouth.anchor.set(1, 0);

	this.followPointer = function (on) {
		if (on) {
			var angleOrigin = { x: this.x + this.head.x, y: this.y + this.head.y };
			var angleTo = { x: 100 };
			this.update = function () {
				angleTo.y = game.input.activePointer.y;
				var a = game.physics.arcade.angleBetween(angleTo, angleOrigin);
				this.head.rotation = a;
			};
		} else {
			this.update = function () {};
		}
	};

	this.shoot = function (pos) {
		var hit = { x: pos.x, y: pos.y };
		var headOrigin = { x: this.x + this.head.x, y: this.y + this.head.y };
		var t = new TimelineMax();
		t.to(this.head, 0.2, { rotation: game.physics.arcade.angleBetween(hit, headOrigin) });
		t.to(this.forehead, 0.5, { angle: 10 });
		t.to(this.mouth, 0.5, { angle: -5 }, '-=0.5');
		t.to(this.tounge, 0.5, {
			width: game.physics.arcade.distanceBetween(hit, this.tounge.world),
			height: 18
		});
		t.to(this.tounge, 0.5, { width: 1, height: 5 });
		t.to(this.forehead, 0.2, { angle: 0 });
		t.to(this.mouth, 0.2, { angle: 0 }, '-=0.2');
		return t;
	};
}