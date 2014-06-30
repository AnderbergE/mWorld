/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bird Hero game                                */
/* Representations: All
/* Range:           1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype = Object.create(Subgame.prototype);
BirdheroGame.prototype.constructor = BirdheroGame;
function BirdheroGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BirdheroGame.prototype.preload = function () {
	this.load.audio('birdheroSpeech',         LANG.SPEECH.birdhero.speech); // audio sprite sheet
	this.load.audio('birdheroIntro',          ['assets/audio/subgames/birdhero/intro.ogg',           'assets/audio/subgames/birdhero/intro.mp3']);
	this.load.audio('birdheroScream',         ['assets/audio/subgames/birdhero/scream.ogg',          'assets/audio/subgames/birdhero/scream.mp3']);
	this.load.audio('birdheroMusic',          ['assets/audio/subgames/birdhero/bg.ogg',              'assets/audio/subgames/birdhero/bg.mp3']);
	this.load.audio('birdheroElevator',       ['assets/audio/subgames/birdhero/elevator.ogg',        'assets/audio/subgames/birdhero/elevator.mp3']);
	this.load.audio('birdheroElevatorArrive', ['assets/audio/subgames/birdhero/elevator_arrive.ogg', 'assets/audio/subgames/birdhero/elevator_arrive.mp3']);
	this.load.audio('birdheroElevatorDown',   ['assets/audio/subgames/birdhero/elevator_down.ogg',   'assets/audio/subgames/birdhero/elevator_down.mp3']);

	this.load.atlasJSONHash('birdhero', 'assets/img/subgames/birdhero/atlas.png', 'assets/img/subgames/birdhero/atlas.json');
};

/* Phaser state function */
BirdheroGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var coords = {
		tree: {
			x: 640, y: 15, center: 140,
			branch: { start: 500, end: 70 },
			elevator: -60
		},
		agent: {
			start: { x: 250, y: 950 },
			stop: { x: 450, y: 500 },
			scale: 0.25,
			thought: { x: -150, y: -100, scale: 0.5 } // offset to agent
		},
		bird: {
			start: { x: -150, y: 700 },
			stop: { x: 200, y: 550 },
			scale: 0.3, small: 0.06
		}
	};
	var tint = [
		0xffffff, 0xffcccc, 0xccffcc, 0xccccff, 0xffffcc,
		0xffccff, 0xccffff, 0x5555cc, 0x55cc55, 0xcc5555
	];

	// Add music and sounds
	var bgMusic = this.add.audio('birdheroMusic', 1, true);
	var elevatorAudio = this.add.audio('birdheroElevator', 1);
	var elevatorAudioArrive = this.add.audio('birdheroElevatorArrive', 1);
	var elevatorAudioDown = this.add.audio('birdheroElevatorDown', 1);
	var speech = this.add.audio('birdheroSpeech');
	var markers = LANG.SPEECH.birdhero.markers;
	for (var marker in markers) {
		speech.addMarker(marker, markers[marker][0], markers[marker][1]);
	}


	// Add background
	this.add.sprite(0, 0, 'birdhero', 'bg', this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.set(coords.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = coords.agent.stop.x + coords.agent.thought.x;
	this.agent.thought.y = coords.agent.stop.y + coords.agent.thought.y;
	this.agent.thought.visible = false;
	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	this.add.sprite(coords.tree.x-90, coords.tree.y-25, 'birdhero', 'crown', this.gameGroup);
	var tree = this.add.sprite(coords.tree.x, coords.tree.y, 'birdhero', 'bole', this.gameGroup);
	tree.branch = [this.amount];
	var treeBottom = tree.y + coords.tree.branch.start;
	var treeCenter = tree.x + coords.tree.center;
	var heightPerBranch = (coords.tree.branch.start - coords.tree.branch.end)/this.amount;
	for (var i = 0; i < this.amount; i++) {
		tree.branch[i] = new BirdheroBranch(treeCenter, treeBottom - heightPerBranch*i, tint[i]);
		tree.branch[i].scale.x = i % 2 ? 1 : -1;
		tree.branch[i].chicks = 1;
		this.gameGroup.add(tree.branch[i]);
	}
	tree.bringToTop();

	// Add the elevator, the bird is added to this group to be in the elevator when moving it.
	var elevator = this.add.group(this.gameGroup);
	elevator.origin = tree.y + tree.height + coords.tree.elevator;
	elevator.x = treeCenter;
	elevator.y = elevator.origin;

	// Create bird, it is added to the elevator group to move with the elevator when it moves.
	// Since the bird is in the elevator group, we need to offset for that when moving it.
	var bird = new BirdheroBird();
	bird.visible = false;
	bird.scale.set(coords.bird.scale);
	elevator.add(bird);
	// Calculate positions for bird based on elevator.
	coords.bird.start.x -= elevator.x;
	coords.bird.start.y -= elevator.y;
	coords.bird.stop.x -= elevator.x;
	coords.bird.stop.y -= elevator.y;

	elevator.bucket = this.add.sprite(0, 0, 'birdhero', 'bucket', elevator);
	elevator.bucket.anchor.set(0.5, 0);
	elevator.text = this.add.text(0, elevator.bucket.y + elevator.bucket.height*0.75, '0', {
		font: '30pt ' +  GLOBAL.FONT,
		fill: '#ff0000'
	}, elevator);
	elevator.text.anchor.set(0.5);
	this.add.sprite(0, 12, 'birdhero', 'rope', elevator).anchor.set(0.5, 1);


	// Add HUD
	var buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		y: this.world.height-(this.representation.length*75)-25,
		background: 'wood',
		onClick: pushNumber
	});
	buttons.visible = false;
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100,
		background: 'wood',
		onClick: pushYesno
	});
	yesnos.visible = false;
	this.hudGroup.add(yesnos);


	// Add Timeline/Tween functions
	bird.moveTo = {
		initial: function () {
			return bird.move({ x: coords.bird.stop.x, y: coords.bird.stop.y }, 2, coords.bird.scale);
		},
		elevator: function () {
			return bird.move({ x: 0, y: elevator.bucket.height*0.7 }, 2, coords.bird.small);
		},
		peak: function (up) {
			return bird.move({ y: (up ? '-=30' : '+=30') }, 0.5);
		},
		nest: function (target) {
			var visit = tree.branch[target-1].visit();
			return bird.move({ x: visit.x }, 1);
		}
	};

	elevator.moveTo = {
		_direct: function (target, arrived) {
			return new TweenMax(elevator, 1, {
				y: tree.branch[target-1].y + tree.branch[target-1].visit().y - elevator.bucket.height*0.75,
				ease: Power1.easeInOut,
				onComplete: function () {
					elevator.text.text = target.toString();
					if (arrived) { elevatorAudioArrive.play(); }
					else { elevatorAudio.play(); }
				}
			});
		},
		bottom: function () {
			return new TweenMax(elevator, 1, {
				y: elevator.origin,
				ease: Power1.easeInOut,
				onStart: function () { elevatorAudioDown.play(); },
				onComplete: function() { elevator.text.text = '0'; }
			});
		},
		branch: function (target) {
			if (target === 0) {
				return elevator.moveTo.bottom();
			}

			var t = new TimelineMax();
			for (var i = parseInt(elevator.text.text)+1; i <= target; i++) {
				t.add(elevator.moveTo._direct(i, i === target));
			}
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
		_this.agent.eyesFollowObject(bird.beak.world);
		bird.showWings(false);

		var result = _this.tryNumber(number);
		var branch = tree.branch[number-1];

		var t = new TimelineMax();
		t.skippable(); // TODO: Remove: this should not be skippable!
		t.add(zoom(false), 0);
		t.add(bird.moveTo.elevator(), 0);
		t.add(bird.moveTo.peak(true));
		t.add(elevator.moveTo.branch(number));
		t.add(bird.moveTo.peak(false));
		t.add(bird.moveTo.nest(number));

		if (!result) { /* Correct :) */
			t.addCallback(function () {
				bird.visible = false;
				branch.chicks++;
				speech.play('correct');
			});
			t.addLabel('celebrate');
			t.add(branch.celebrate(2), 'celebrate');
			t.add(_this.addWater(branch.x + branch.mother.x * branch.scale.x, branch.y + branch.mother.y), 'celebrate');
			t.add(elevator.moveTo.bottom());
			t.addCallback(function () {
				_this.nextRound();
			});
		} else { /* Incorrect :( */
			t.addLabel('wrong');
			if (result < 0) { t.addSound(speech, bird, 'higher'); }
			else { t.addSound(speech, bird, 'lower'); }

			t.add(branch.confused(), 'wrong'); // 3 second confusion
			t.add(bird.moveTo.elevator());
			t.add(bird.moveTo.peak(true));
			t.add(elevator.moveTo.bottom());
			t.add(bird.moveTo.peak(false));
			t.addLabel('initial');
			t.add(bird.moveTo.initial(), 'initial');
			t.add(zoom(true), 'initial');
			t.addCallback(function () {
				bird.turn(1);
				_this.nextRound();
			});
		}
	}
	/* Function to trigger when a yes/no button is pushed */
	function pushYesno (value) {
		if (!value) {
			say(speech, _this.agent).play('agentCorrected');
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

	function zoom (ins) {
		var t = new TimelineMax();
		if (ins) {
			t.add(TweenMax.to(_this.gameGroup, 2, { x: -160, y: -650 }), 0);
			t.add(TweenMax.to(_this.gameGroup.scale, 2, { x: 2, y: 2 }), 0);
		} else {
			t.add(TweenMax.to(_this.gameGroup, 1.5, { x: 0, y: 0 }), 0);
			t.add(TweenMax.to(_this.gameGroup.scale, 1.5, { x: 1, y: 1 }), 0);
		}
		return t;
	}

	/* Introduce a new bird, aka: start a new round. */
	function newBird (silent) {
		bird.number = _this.currentNumber;
		bird.tint = tint[bird.number - 1];

		var t = new TimelineMax();
		t.addCallback(function () {
			bird.x = coords.bird.start.x;
			bird.y = coords.bird.start.y;
			bird.visible = true;
		});
		t.add(bird.moveTo.initial(), 0); // TODO: Why does scale f up here when skipping?
		t.add(zoom(true), 0);
		if (!silent) {
			t.addSound(speech, bird, 'floor');
			t.addCallback(function () { bird.showWings(); }, '-=2.9');
		}
		return t;
	}

	/* Have the agent guess a number */
	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);

		return TweenMax.fromTo(_this.agent.thought.scale, 1.5,
			{ x: 0, y: 0 },
			{ x: coords.agent.thought.scale, y: coords.agent.thought.scale,
				ease: Elastic.easeOut,
				onStart: function () {
					_this.agent.thought.visible = true;
					if (_this.agent.thought.guess) { _this.agent.thought.guess.destroy(); }
					say(speech, _this.agent).play('agentHmm');
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

	function instructionIntro () {
		var t = new TimelineMax();
		t.addSound(speech, bird, 'instruction1a');
		t.add(bird.countFeathers());
		t.addLabel('useButtons');
		t.addLabel('flashButtons', '+=0.7');
		t.addSound(speech, bird, 'instruction1b');
		t.add(fade(buttons, true), 'useButtons');
		t.add(buttons.highlight(1), 'flashButtons');
		return t;
	}


	/* Overshadowing of the mode related functions */
	this.modeIntro = function () {
		var sound = _this.add.audio('birdheroIntro');
		var group = _this.add.group(_this.gameGroup);
		var t = new TimelineMax({
			onStart: function () { sound.play(); }
		}).skippable();

		// Create each chick that will be blown away
		var starter = function (chick, branch) {
			branch.chicks = 0;
			chick.visible = true;
		};
		for (var i = 0; i < tree.branch.length; i++) {
			var chick = new BirdheroBird(tint[i]);
			chick.visible = false;
			for (var j in chick.children) {
				// Translate sprite positions for rotation effect
				chick.children[j].x += 300;
				chick.children[j].y += 300;
			}
			var pos = tree.branch[i].chickPos();
			chick.x = pos.x - 35; // Counter-effect translate
			chick.y = pos.y - 20; // Counter-effect translate
			chick.scale.set(coords.bird.small);
			group.add(chick);
			t.add(new TweenMax(chick, 7, {
				x: -500,
				y: game.world.height - Math.random()*150,
				angle: 1080 + Math.random()*2160,
				ease: Power0.easeIn,
				onStart: starter,
				onStartParams: [chick, tree.branch[i]]
			}), 5.5);
		}

		// Make it dark!
		var darkness = new Cover('#000077', 0);
		group.add(darkness);
		t.add(new TweenMax(darkness, 1.5, { alpha: 0.3 }), 3.5);
		t.add(new TweenMax(darkness, 1, { alpha: 0 }), 12);

		// Make it rain!
		var bmd = new Phaser.BitmapData(game, '', 6, 6);
		var half = bmd.width/2;
		bmd.ctx.fillStyle = '#2266cc';
		bmd.ctx.beginPath();
		bmd.ctx.arc(half, half, half, 0, Math.PI2);
		bmd.ctx.closePath();
		bmd.ctx.fill();
		var emitter = game.add.emitter(game.world.centerX, -10, 5000);
		emitter.width = game.world.width*1.5;
		emitter.makeParticles(bmd);
		emitter.setScale(0.5, 1, 0.5, 1);
		emitter.setYSpeed(500, 700);
		emitter.setXSpeed(-300, -400);
		emitter.setRotation(0, 0);
		t.addCallback(function () {
			emitter.start(false, 1000, 25, 200); // It will take 200*25 to reach 5000 = 5s
		}, 4);

		t.eventCallback('onComplete', function () {
			sound.stop();
			emitter.destroy(true);
			darkness.destroy(true);
			group.destroy(true);
			_this.nextRound();
		});
	};

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
			bird.showWings();
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.skippable();
				t.add(newBird(true));
				t.add(instructionIntro());
			} else {
				t.add(newBird());
			}
			t.addCallback(showNumbers);
		}
	};

	this.modePlayerShow = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
			bird.showWings();
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start());
				t.addLabel('agentIntro');
				t.addSound(speech, _this.agent, 'agentIntro');
				t.add(_this.agent.wave(3, 1), 'agentIntro');
			}
			t.add(newBird());
			t.addCallback(showNumbers);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var t = new TimelineMax();
		if (tries > 0) {
			bird.showWings();
			_this.agent.eyesFollowPointer(true);
			// TODO: Add more specified sounds?
			t.addSound(speech, _this.agent, 'agentTryAgain');
			t.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start()); // Agent should be here already.
				t.addSound(speech, _this.agent, 'agentTry');
			}
			t.add(newBird());
			t.add(agentGuess());
		}
	};

	this.modeAgentDo = function (intro, tries) {
		// TODO: This mode is not in Agneta & Magnus thoughts right now, will not update.
		hideButtons();
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);

		if (tries > 0) {
			pushNumber(_this.agent.lastGuess);
		} else { // if intro or first try
			var t = new TimelineMax();
			t.add(newBird());
			t.addCallback(pushNumber, null, [_this.agent.lastGuess]);
		}
	};

	this.modeOutro = function () {
		for (var i = 0; i < tree.branch.length; i++) {
			tree.branch[i].celebrate(3000);
		}

		_this.agent.thought.visible = false;
		_this.agent.eyesFollowPointer(true);
		_this.agent.fistPump()
			.addCallback(function () { _this.nextRound(); });
	};


	/* Play music on the first mode that is not the intro. */
	function playMusic (mode) {
		if (mode !== GLOBAL.MODE.intro) {
			bgMusic.play();
			Event.unsubscribe(GLOBAL.EVENT.modeChange, playMusic);
		}
	}
	Event.subscribe(GLOBAL.EVENT.modeChange, playMusic);


	// Everything is set up! Blast off!
	this.startGame();
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bird Hero game objects                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* A branch for the tree, holds: branch, nest, parent and chicks */
BirdheroBranch.prototype = Object.create(Phaser.Group.prototype);
BirdheroBranch.prototype.constructor = BirdheroBranch;
function BirdheroBranch (x, y, tint) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	var branchType = parseInt(Math.random()*3+1);
	var branch = game.add.sprite(0, 0, 'birdhero', 'branch' + branchType, this);
	this.nest = game.add.sprite(branch.x + (branchType === 1) ? 100 : (branchType === 2) ? 60 : 80, branch.height * 0.4, 'birdhero', 'nest', this);
	this.mother = game.add.sprite(this.nest.x + this.nest.width/5, this.nest.y, 'birdhero', 'parent', this);
	this.mother.y -= this.mother.height*0.7;
	this.mother.tint = tint || 0xffffff;
	this.nest.bringToTop();

	this._chicks = [];

	return this;
}
Object.defineProperty(BirdheroBranch.prototype, 'chicks', {
	get: function() { return this._chicks.length; },
	set: function(value) {
		var change = value - this._chicks.length;
		var dir = change > 0 ? -1 : 1;
		while (change !== 0 && this._chicks.length < 3) {
			if (dir < 0) {
				var chick = game.add.sprite(this.mother.x - 10, this.nest.y, 'birdhero', 'chick', this);
				chick.x += this._chicks.length * chick.width * 0.5;
				chick.y -= chick.height * 0.5;
				chick.tint = this.mother.tint;
				this._chicks.push(chick);
			} else {
				this._chicks.pop().destroy();
			}
			change += dir;
		}
		this.nest.bringToTop();
	}
});

/** @returns {Object} The x, y coordinates of where the chick is */
BirdheroBranch.prototype.chickPos = function () {
	return {
		x: this.x + this._chicks[0].x * this.scale.x,
		y: this.y + this._chicks[0].y
	};
};

/** @returns {Object} The x, y coordinates of where the bird should stop at the nest */
BirdheroBranch.prototype.visit = function () {
	return {
		x: this.nest.x * this.scale.x,
		y: this.nest.y
	};
};

/**
 * When the nest goes wild!
 * @param {number} The duration of the celebration, default: 3
 * @returns {Object} The celebration tween
 */
BirdheroBranch.prototype.celebrate = function (duration) {
	duration = duration || 3;
	var times = parseInt(duration / 0.2);
	times += (times % 2 === 0) ? 1 : 0; // Bird will be strangely positioned if number is not odd.
	var t = new TimelineMax();
	t.add(new TweenMax(this.mother, 0.2, { y: this.mother.y - 5, ease: Power0.easeInOut, repeat: times, yoyo: true }));
	for (var i = 0; i < this._chicks.length; i++) {
		t.add(new TweenMax(this._chicks[i], 0.2, { y: '-=3', ease: Power0.easeInOut, repeat: times, yoyo: true }), Math.random()*0.2);
	}
	return t;
};

/**
 * When something strange is happening.
 * @param {number} The duration of the confusion, default: 3
 * @returns {Object} The confusion tween
 */
BirdheroBranch.prototype.confused = function (duration) {
	if (!this.confusing) {
		this.confusing = game.add.text(this.mother.x+10, this.mother.y-40, '?!?', {
			font: '20pt ' +  GLOBAL.FONT,
			fill: '#000',
			stroke: '#000',
			strokeThickness: 3
		}, this);
		if (this.scale.x < 0) { // Always show the text in the correct way.
			this.confusing.x += this.confusing.width;
			this.confusing.scale.x = -1;
		}
	}

	duration = duration || 3;
	var times = parseInt(duration / 0.2);
	times += (times % 2 === 0) ? 1 : 0; // Group will be strangely positioned if number is not odd.

	var _this = this;
	this.confusing.visible = false;
	return new TweenMax(this.confusing, 0.2, { y: this.confusing.y - 5, repeat: times, yoyo: true,
		onStart: function () { _this.confusing.visible = true; },
		onComplete: function () { _this.confusing.visible = false; }
	});
};


/* The bird that you are helping home */
BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;
function BirdheroBird (tint) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this._number = null;

	this.rightLeg = game.add.sprite(50, 160, 'birdhero', 'leg', this);
	this.rightWing = game.add.sprite(160, -90, 'birdhero', 'wing5', this);
	this.rightWing.visible = false;
	this.body = game.add.sprite(0, 0, 'birdhero', 'body', this);
	this.body.anchor.set(0.5);
	this.leftLeg = game.add.sprite(0, 175, 'birdhero', 'leg', this);
	this.wing = game.add.sprite(75, -20, 'birdhero', 'wing', this);
	this.wing.anchor.set(1, 0);
	this.leftWing = game.add.sprite(90, -125, 'birdhero', 'wing5', this);
	this.leftWing.angle = 10;
	this.leftWing.scale.x = -1;
	this.leftWing.visible = false;
	game.add.sprite(110, -160, 'birdhero', 'eyes', this);
	game.add.sprite(118, -145, 'birdhero', 'pupils', this);
	this.beak = game.add.sprite(190, -70, 'birdhero', 'beak0', this);
	this.beak.anchor.set(0.5);

	this.tint = tint || 0xffffff;

	/* Animations */
	this.talk = TweenMax.to(this.beak, 0.2, {
		frame: this.beak.frame+1, ease: SteppedEase.config(1), repeat: -1, yoyo: true, paused: true
	});
	this.walk = new TimelineMax({ repeat: -1, paused: true })
		.fromTo(this.leftLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0)
		.fromTo(this.rightLeg, 0.1, { angle: 0 }, { angle: -20 , yoyo: true, repeat: 1 }, 0.2);

	return this;
}
Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.wing.tint = value - 0x111111;
		this.rightWing.tint = this.wing.tint;
		this.leftWing.tint = this.wing.tint;
	}
});
Object.defineProperty(BirdheroBird.prototype, 'number', {
	get: function() { return this._number; },
	set: function(value) {
		this._number = value;
		this.rightWing.frameName = 'wing' + (value > 5 ? 5 : value);
		if (value > 5) { this.leftWing.frameName = 'wing' + (value - 5); }
	}
});

/**
 * The bird will show its wings.
 * @param {boolean} true = show, false = hide  (default is true)
 */
BirdheroBird.prototype.showWings = function (on) {
	on = (typeof on === 'undefined' || on === null) ? true : on;
	this.rightWing.visible = on;
	this.wing.visible = !on || this.number <= 5;
	this.leftWing.visible = on && this._number > 5;
};

/**
 * Point at the birds feathers.
 * @returns {Object} The animation timeline
 */
BirdheroBird.prototype.countFeathers = function () {
	var number = this.number;
	var fun = function (i) {
		this.number = i;
		this.showWings();
	};

	var t = new TimelineMax();
	for (var i = 1; i <= number; i++) {
		t.addCallback(fun, (i-1)*1, [i], this);
	}
	t.addCallback(function () {}, '+=1');
	return t;
};

/**
 * Turn around! Every now and then I get a little bit lonely...
 * @param {number} -1 = left, 1 = right, default: opposite of current
 * @returns {Object} The turning tween
 */
BirdheroBird.prototype.turn = function (direction) {
	// Turn by manipulating the scale.
	var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
	return new TweenMax(this.scale, 0.2, { x: newScale });
};

/**
 * Move around, turn according to move direction.
 * NOTE: turning takes 200ms, making a new move before that might give strange results.
 * @param {Object} Properties to tween
 * @param {number} Duration of the move
 * @param {number} If a scaling should happen during the move
 * @returns {Object} The movement tween
 */
BirdheroBird.prototype.move = function (properties, duration, scale) {
	var t = new TimelineMax({
		onStart: function () { this.walk.play(); }, onStartScope: this,
		onComplete: function () { this.walk.pause(0); }, onCompleteScope: this
	});
	t.addLabel('mover'); // Add a label in beginning, use it for simultaneous tweening.
	t.to(this, duration, properties, 'mover');
	t.addCallback(function () {
		var dir = this.scale.x < 0;
		if (typeof properties.x !== 'undefined' && properties.x !== null && // Check if we should turn around
			(properties.x <= this.x && 0 < this.scale.x) ||                 // Going left, scale should be -1
			(this.x <= properties.x && 0 > this.scale.x)) {                 // Going right, scale should be 1
			dir = !dir;
			t.add(this.turn(), 'mover');
		}
		if (scale) {
			t.to(this.scale, duration,
				{ x: (dir ? -1 * scale : scale), y: scale },
				'-=' + (duration - 0.2));
		}
	}, 'mover', null, this);

	return t;
};