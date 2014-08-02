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

	/* Setup gameplay differently depending on situation. */
	this.doInstructions = true;
	this.isRelative = false;
	if (this.method === GLOBAL.METHOD.count) {
		this.doStartFunction = this.startStop;
		this.doReturnFunction = this.rideReturn;
	} else if (this.method === GLOBAL.METHOD.incrementalSteps) {
		this.doStartFunction = this.startStop;
		this.doReturnFunction = this.rideNoReturn;
	} else if (this.method === GLOBAL.METHOD.addition) {
		this.doStartFunction = this.startBelow;
		this.doReturnFunction = this.rideToPreviousIfHigher;
		this.isRelative = true;
	} else if (this.method === GLOBAL.METHOD.subtraction) {
		this.doStartFunction = this.startAbove;
		this.doReturnFunction = this.rideToPreviousIfLower;
		this.isRelative = true;
	} else {
		this.doStartFunction = this.startThink;
		this.doReturnFunction = this.rideNoReturn;
		this.isRelative = true;
	}

	// Add music and sounds
	var elevatorAudio = this.add.audio('birdheroElevator', 1);
	var elevatorAudioArrive = this.add.audio('birdheroElevatorArrive', 1);
	var elevatorAudioDown = this.add.audio('birdheroElevatorDown', 1);
	this.speech = createAudioSheet('birdheroSpeech', LANG.SPEECH.birdhero.markers);


	// Add background
	this.add.sprite(0, 0, 'birdhero', 'bg', this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = this.pos.agent.start.x;
	this.agent.y = this.pos.agent.start.y;
	this.agent.scale.set(this.pos.agent.scale);
	this.agent.visible = true;
	// Adding thought bubble that is used in the agent try mode.
	this.agent.thought = this.add.group(this.gameGroup);
	this.agent.thought.x = this.pos.agent.stop.x + this.pos.agent.thought.x;
	this.agent.thought.y = this.pos.agent.stop.y + this.pos.agent.thought.y;
	this.agent.thought.visible = false;
	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	this.agent.thought.guess = new NumberButton(1, this.representation[0], {
		x: -60, y: -30, min: 1, max: this.amount, disabled: true
	});
	this.agent.thought.add(this.agent.thought.guess);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	this.add.sprite(this.pos.tree.x-90, this.pos.tree.y-25, 'birdhero', 'crown', this.gameGroup);
	this.tree = this.add.sprite(this.pos.tree.x, this.pos.tree.y, 'birdhero', 'bole', this.gameGroup);
	this.tree.branch = [this.amount];
	var treeBottom = this.tree.y + this.pos.tree.branch.start;
	var treeCenter = this.tree.x + this.pos.tree.center;
	var heightPerBranch = (this.pos.tree.branch.start - this.pos.tree.branch.end)/this.amount;
	for (var i = 0; i < this.amount; i++) {
		this.tree.branch[i] = new BirdheroBranch(treeCenter, treeBottom - heightPerBranch*i, this.tint[i]);
		this.tree.branch[i].scale.x = i % 2 ? 1 : -1;
		this.tree.branch[i].chicks = 1;
		this.gameGroup.add(this.tree.branch[i]);
	}
	this.tree.bringToTop();

	// Add the elevator, the bird is added to this group to be in the elevator when moving it.
	this.elevator = this.add.group(this.gameGroup);
	this.elevator.origin = this.tree.y + this.tree.height + this.pos.tree.elevator;
	this.elevator.x = treeCenter;
	this.elevator.y = this.elevator.origin;
	var rope = this.add.sprite(0, 0, 'birdhero', 'rope', this.elevator);
	rope.anchor.set(0.5, 1);
	rope.scale.set(1.2);

	// Create bird, it is added to the elevator group to move with the elevator when it moves.
	// Since the bird is in the elevator group, we need to offset for that when moving it.
	this.bird = new BirdheroBird();
	this.bird.visible = false;
	this.elevator.add(this.bird);
	// Calculate positions for bird based on elevator.
	this.pos.bird.start.x -= this.elevator.x;
	this.pos.bird.start.y -= this.elevator.y;
	this.pos.bird.stop.x -= this.elevator.x;
	this.pos.bird.stop.y -= this.elevator.y;

	var bucket = this.add.sprite(0, 0, 'birdhero', 'bucket', this.elevator);
	bucket.scale.set(1.2);
	bucket.anchor.set(0.5, 0);
	this.elevator.text = this.add.text(0, bucket.y + bucket.height*0.7, '0', {
		font: '30pt ' +  GLOBAL.FONT,
		fill: '#ff0000'
	}, this.elevator);
	this.elevator.text.anchor.set(0.5);


	// Add Timeline/Tween functions
	this.bird.moveTo = {
		initial: function () {
			return _this.bird.move({ x: _this.pos.bird.stop.x, y: _this.pos.bird.stop.y }, 2, _this.pos.bird.scale);
		},
		elevator: function () {
			return _this.bird.move({ x: 0, y: bucket.height*0.5 }, 2, _this.pos.bird.small);
		},
		peak: function (up) {
			if (up) {
				return _this.bird.move({ y: '-=50' }, 1, _this.pos.bird.elevator);
			}
			return _this.bird.move({ y: '+=50' }, 1, _this.pos.bird.small);
		},
		nest: function (target) {
			return _this.bird.move({ x: _this.tree.branch[target-1].visit().x }, 1, _this.pos.bird.small);
		}
	};

	this.elevator.moveTo = {
		_step: function (target) {
			return new TweenMax(_this.elevator, 1, {
				y: (target === 0 ?
					_this.elevator.origin :
					(_this.tree.branch[target-1].y + _this.tree.branch[target-1].visit().y - bucket.height*0.6)),
				ease: Power1.easeInOut,
				onComplete: function () {
					_this.elevator.text.text = target.toString();
				}
			});
		},
		/* Direct true goes directly to target, false stops at each floor. */
		branch: function (target, direct, from) {
			var t = new TimelineMax();

			var currentFloor = from || parseInt(_this.elevator.text.text);
			if (currentFloor !== target) {
				var dir =  currentFloor < target ? 1 : -1;

				if (direct) {
					t.add(_this.elevator.moveTo._step(target));
				} else {
					for (var i = currentFloor + dir; true; i += dir) {
						t.add(_this.elevator.moveTo._step(i));
						if (i !== target) {
							t.addCallback(elevatorAudio.play, null, null, elevatorAudio);
						} else {
							break;
						}
					}
				}
			}

			if (target === 0) {
				t.addSound(elevatorAudioDown, null, null, 0);
			} else {
				t.addCallback(elevatorAudioArrive.play, null, null, elevatorAudioArrive);
			}

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


	// Add HUD
	function pushNumber (number) {
		return _this.rideElevator(number + _this.addToNumber)
			.addCallback(_this.nextRound, null, null, _this);
	}
	/* This is modified only when isRelative is set to true. */
	this.addToNumber = 0;

	this.buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		y: this.world.height-(this.representation.length*75)-25,
		onClick: pushNumber
	});
	this.buttons.visible = false;
	this.hudGroup.add(this.buttons);

	this.yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100,
		onClick: function (value) {
			if (!value) {
				_this.agent.say(_this.speech).play('agentCorrected');
				_this.showNumbers();
			}
			else { pushNumber(_this.agent.lastGuess); }
		}
	});
	this.yesnos.visible = false;
	this.hudGroup.add(this.yesnos);


	/* Play music on the first mode that is not the intro. */
	EventSystem.subscribe(GLOBAL.EVENT.modeChange, playMusic);
	function playMusic (mode) {
		if (mode !== GLOBAL.MODE.intro) {
			_this.add.audio('birdheroMusic', 1, true).play();
			EventSystem.unsubscribe(GLOBAL.EVENT.modeChange, playMusic);
		}
	}

	// Everything is set up! Blast off!
	this.startGame();
};


BirdheroGame.prototype.pos = {
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
		stop: { x: 180, y: 550 },
		scale: 0.3, elevator: 0.135, small: 0.06
	}
};

/* Do not use tint below 0x111112, or 0xXXXX12, it will not work on the bird */
BirdheroGame.prototype.tint = [
	0xff8888, 0x77ee77, 0x8888ff, 0xfed012, 0xfedcba,
	0x11abba, 0xabcdef, 0xffffff, 0xed88ba
];


BirdheroGame.prototype.zoom = function (ins) {
	var t = new TimelineMax();
	if (ins === 1) {
		t.add(TweenMax.to(this.gameGroup, 2, { x: -160, y: -650 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 2, { x: 2, y: 2 }), 0);
	} else if (ins === 2) {
		t.add(TweenMax.to(this.gameGroup, 2, { x: -350, y: -110 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 2, { x: 1.5, y: 1.5 }), 0);
	} else {
		t.add(TweenMax.to(this.gameGroup, 1.5, { x: 0, y: 0 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 1.5, { x: 1, y: 1 }), 0);
	}
	return t;
};

BirdheroGame.prototype.instructionIntro = function () {
	this.bird.number = this.currentNumber; // Make sure bird has a number.

	var t = new TimelineMax();
	t.addSound(this.speech, this.bird, 'instruction1a');
	t.add(this.bird.countFeathers());
	t.addLabel('useButtons');
	t.addLabel('flashButtons', '+=0.7');
	t.addSound(this.speech, this.bird, 'instruction1b');
	t.add(fade(this.buttons, true), 'useButtons');
	t.add(this.buttons.highlight(1), 'flashButtons');
	return t;
};

BirdheroGame.prototype.instructionAgentTry = function () {
	var t = new TimelineMax();
	t.addSound(this.speech, this.bird, 'instruction2a');
	t.add(fade(this.yesnos, true), 0);
	t.add(this.yesnos.children[0].highlight(1));
	t.addSound(this.speech, this.bird, 'instruction2b');
	t.add(this.yesnos.children[1].highlight(1));
	return t;
};

/* Have the agent guess a number */
BirdheroGame.prototype.agentGuess = function () {
	this.agent.guessNumber(this.currentNumber, 1, this.amount);

	var t = new TimelineMax({
		onStart: function () {
			this.agent.thought.visible = true;
			this.agent.thought.guess.visible = false;
			this.agent.thought.guess.number = this.agent.lastGuess;
		},
		onStartScope: this
	});
	t.addSound(this.speech, this.agent, 'agentHmm');
	t.add(TweenMax.fromTo(this.agent.thought.scale, 1.5,
		{ x: 0, y: 0 },
		{ x: this.pos.agent.thought.scale, y: this.pos.agent.thought.scale, ease: Elastic.easeOut }
	), 0);
	t.add(fade(this.agent.thought.guess, true, 1), 0.5);
	// TODO: Agent should say something here based on how sure it is.

	return t;
};

/* Show the number panel, hide the yes/no panel and enable input */
BirdheroGame.prototype.showNumbers = function () {
	this.disable(true);
	this.buttons.reset();
	fade(this.yesnos, false);
	fade(this.buttons, true).eventCallback('onComplete', this.disable, false, this);

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Show the yes/no panel, hide the number panel and enable input */
BirdheroGame.prototype.showYesnos = function () {
	this.disable(true);
	this.yesnos.reset();
	fade(this.buttons, false);
	fade(this.yesnos, true).eventCallback('onComplete', this.disable, false, this);

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Hide the number and yes/no panel */
BirdheroGame.prototype.hideButtons = function () {
	this.disable(true);
	fade(this.buttons, false);
	fade(this.yesnos, false);

	if (this.agent.visible) { this.agent.eyesStopFollow(); }
};

BirdheroGame.prototype.updateButtons = function () {
	if (this.method === GLOBAL.METHOD.addition) {
		this.buttons.setRange(1, this.amount - this.addToNumber);
	} else if (this.method === GLOBAL.METHOD.subtraction) {
		this.buttons.setRange(1 - this.addToNumber, -1);
	} else {
		this.buttons.setRange(1 - this.addToNumber, this.amount - this.addToNumber);
	}
};

/* Start a new round, aka: introduce a new bird */
BirdheroGame.prototype.newRound = function (silent) {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.bird.number = this.currentNumber;
		this.bird.tint = this.tint[this.bird.number - 1];
		this.bird.x = this.pos.bird.start.x;
		this.bird.y = this.pos.bird.start.y;
		this.bird.scale.set(this.pos.bird.scale);
		this.bird.visible = true;
	}, null, null, this);

	t.add(this.zoom(1), 0);
	t.add(this.bird.moveTo.initial(), 0);

	this.doStartFunction(silent, t);

	return t;
};

BirdheroGame.prototype.startStop = function (silent, t) {
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor1');
		t.addLabel('showWings');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addSound(this.speech, this.bird, 'thisFloor2');
	}
	return t;
};

BirdheroGame.prototype.startBelow = function (silent, t) {
	t.add(this.rideElevator(this.rnd.integerInRange(1, this.currentNumber - 1)));
	if (!silent) {
		t.addLabel('showWings');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addSound(this.speech, this.bird, 'thisFloor2');
	}
	return t;
};

BirdheroGame.prototype.startAbove = function (silent, t) {
	t.add(this.rideElevator(this.rnd.integerInRange(this.currentNumber + 1, this.amount)));
	if (!silent) {
		t.addLabel('showWings');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addSound(this.speech, this.bird, 'thisFloor2');
	}
	return t;
};

BirdheroGame.prototype.startThink = function (silent, t) {
	t.addCallback(function () {
		this.addToNumber = 0;
		this.updateButtons();
	}, null, null, this);
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor1');
		t.addLabel('showWings');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addSound(this.speech, this.bird, 'thisFloor2');
	}
	return t;
};

BirdheroGame.prototype.rideElevator = function (number) {
	var origin = parseInt(this.elevator.text.text);
	var result = this.tryNumber(number);
	var branch = this.tree.branch[number-1];

	var t = new TimelineMax();
	t.skippable(); // TODO: Remove: this should not be skippable!
	t.addCallback(function () {
		this.disable(true);
		this.agent.eyesFollowObject(this.bird.beak.world);
		this.bird.showWings(false);
	}, null, null, this);

	t.add(this.zoom(0), 0);
	if (!origin) {
		t.add(this.bird.moveTo.elevator(), 0);
		t.add(this.bird.moveTo.peak(true));
	}
	t.add(this.elevator.moveTo.branch(number));
	t.add(this.bird.moveTo.peak(false));
	t.add(this.bird.moveTo.nest(number));

	/* Correct :) */
	if (!result) {
		t.addCallback(function () {
			this.hideButtons();

			this.bird.visible = false;
			branch.chicks++;
			this.speech.play('correct');
			this.agent.setHappy();
		}, null, null, this);
		t.addLabel('celebrate');
		t.add(branch.celebrate(2), 'celebrate');
		t.add(this.addWater(branch.x + (branch.mother.x - 10) * branch.scale.x, branch.y + branch.mother.y), 'celebrate');
		t.add(this.elevator.moveTo.branch(0, true, number));

	/* Incorrect :( */
	} else {
		t.addLabel('wrong');
		t.addSound(this.speech, this.bird, result < 0 ? 'higher' : 'lower');
		t.add(branch.confused(), 'wrong');
		t.addCallback(this.agent.setSad, 'wrong', null, this.agent);

		t.add(this.bird.moveTo.elevator());
		t.add(this.bird.moveTo.peak(true));

		t.add(this.doReturnFunction(number, origin, result));

		if (this.isRelative) {
			t.addCallback(function () {
				this.addToNumber = parseInt(this.elevator.text.text);
				this.updateButtons();
			}, null, null, this);
		}
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);

	return t;
};

BirdheroGame.prototype.rideReturn = function (from) {
	var t = new TimelineMax();
	t.add(this.elevator.moveTo.branch(0, true, from));
	t.add(this.bird.moveTo.peak(false));
	t.addLabel('initial');
	t.add(this.bird.moveTo.initial(), 'initial');
	t.add(this.zoom(1), 'initial');
	t.addCallback(this.bird.moveTurn, null, [1], this.bird);
	return t;
};

BirdheroGame.prototype.rideNoReturn = function () {
	return this.zoom(2);
};

BirdheroGame.prototype.rideToPreviousIfHigher = function (from, to, diff) {
	var t = new TimelineMax();
	t.add(this.rideNoReturn());
	if (diff > 0) {
		t.add(this.elevator.moveTo.branch(to, true, from), 0);
	}
	return t;
};

BirdheroGame.prototype.rideToPreviousIfLower = function (from, to, diff) {
	return this.rideToPreviousIfHigher(from, to, -diff);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype.modeIntro = function () {
	var sound = this.add.audio('birdheroIntro');
	var group = this.add.group(this.gameGroup);
	var t = new TimelineMax({
		onStart: function () { sound.play(); }
	}).skippable();

	// Create each chick that will be blown away
	var starter = function (chick, branch) {
		branch.chicks = 0;
		chick.visible = true;
	};
	for (var i = 0; i < this.tree.branch.length; i++) {
		var chick = new BirdheroBird(this.tint[i]);
		chick.visible = false;
		for (var j in chick.children) {
			// Translate sprite positions for rotation effect
			chick.children[j].x += 300;
			chick.children[j].y += 300;
		}
		var pos = this.tree.branch[i].chickPos();
		chick.x = pos.x - 35; // Counter-effect translate
		chick.y = pos.y - 20; // Counter-effect translate
		chick.scale.set(this.pos.bird.small);
		group.add(chick);

		var start = 5 + this.rnd.realInRange(0, 1);
		t.add(this.tree.branch[i].distress(4), start);
		t.add(new TweenMax(chick, 7, {
			x: -500,
			y: this.world.height - this.rnd.integerInRange(0, 150),
			angle: 1080 + this.rnd.integerInRange(0, 2160),
			ease: Power0.easeIn,
			onStart: starter,
			onStartParams: [chick, this.tree.branch[i]]
		}), start);
	}

	// Make it dark!
	var darkness = new Cover('#000077', 0);
	group.add(darkness);
	t.add(new TweenMax(darkness, 1.5, { alpha: 0.3 }), 3.5);
	t.add(new TweenMax(darkness, 1, { alpha: 0 }), 12);

	// Make it rain!
	var bmd = new Phaser.BitmapData(game, '', 6, 6);
	var half = bmd.width/2;
	bmd.ctx.fillStyle = '#0044aa';
	bmd.ctx.beginPath();
	bmd.ctx.arc(half, half, half, 0, Math.PI2);
	bmd.ctx.closePath();
	bmd.ctx.fill();
	var emitter = this.add.emitter(this.world.centerX, -10, 5000);
	emitter.width = this.world.width*1.5;
	emitter.makeParticles(bmd);
	emitter.setScale(0.5, 1, 0.5, 1);
	emitter.setYSpeed(500, 700);
	emitter.setXSpeed(-300, -400);
	emitter.setRotation(0, 0);
	t.addCallback(function () {
		emitter.start(false, 1000, 25, 200); // It will take 200*25 to reach 5000 = 5s
	}, 4);

	t.addCallback(function () {
		sound.stop();
		emitter.destroy(true);
		darkness.destroy(true);
		group.destroy(true);
		this.nextRound();
	}, null, null, this);
};

BirdheroGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.bird.showWings();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.newRound(true));
			t.add(this.instructionIntro());
			t.addCallback(this.showNumbers, null, null, this);
		} else {
			t.add(this.newRound().addCallback(this.showNumbers, 'showWings', null, this));
		}
	}
};

BirdheroGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.bird.showWings();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			t.addSound(this.speech, this.agent, 'agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
		}
		t.add(this.newRound().addCallback(this.showNumbers, 'showWings', null, this));
	}
};

BirdheroGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		this.bird.showWings();
		this.agent.eyesStopFollow();
		// TODO: Add more specified sounds?
		t.addSound(this.speech, this.agent, 'agentTryAgain');
		t.add(this.agentGuess());
		t.addCallback(this.showYesnos, null, null, this);
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.speech, this.agent, 'agentTry');
			t.add(this.newRound());
			t.add(this.agentGuess());
			t.add(this.instructionAgentTry());
			t.addCallback(this.showYesnos, null, null, this);
		} else {
			t.add(this.newRound());
			t.add(this.agentGuess());
			t.addCallback(this.showYesnos, null, null, this);
		}
	}
};

BirdheroGame.prototype.modeOutro = function () {
	for (var i = 0; i < this.tree.branch.length; i++) {
		this.tree.branch[i].celebrate(3000);
	}

	this.agent.thought.visible = false;
	this.agent.eyesStopFollow();
	this.agent.fistPump()
		.addCallback(this.agent.setHappy, 0, null, this.agent)
		.addCallback(this.nextRound, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bird Hero Tree Branch                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroBranch.prototype = Object.create(Phaser.Group.prototype);
BirdheroBranch.prototype.constructor = BirdheroBranch;

/**
 * A branch for the tree. Holds: branch, nest, parent and chicks.
 * @constructor
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} tint - The tint of the parent and chicks.
 * @return {Object} Itself.
 */
function BirdheroBranch (x, y, tint) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	var branchType = game.rnd.integerInRange(1, 3);
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
 * When the nest is upset!
 * @param {number} The duration of the animation, default: 3
 * @returns {Object} The tween
 */
BirdheroBranch.prototype.distress = function (duration) {
	return new TweenMax(this.mother, 0.1, { y: this.mother.y - 3, ease: Power0.easeInOut }).backForth(duration || 3);
};

/**
 * When the nest goes wild!
 * @param {number} The duration of the celebration, default: 3
 * @returns {Object} The celebration tween
 */
BirdheroBranch.prototype.celebrate = function (duration) {
	duration = duration || 3;

	var t = new TimelineMax();
	t.add(new TweenMax(this.mother, 0.2, { y: this.mother.y - 5, ease: Power0.easeInOut }).backForth(duration));
	for (var i = 0; i < this._chicks.length; i++) {
		t.add(new TweenMax(this._chicks[i], 0.2, { y: '-=3', ease: Power0.easeInOut }).backForth(duration), Math.random()*0.2);
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
		this.confusing.visible = false;
	}

	return new TweenMax(this.confusing, 0.2, { y: this.confusing.y - 5,
		onStart: function () { this.confusing.visible = true; }, onStartScope: this,
		onComplete: function () { this.confusing.visible = false; }, onCompleteScope: this
	}).backForth(duration || 3);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bird Hero Rescue Bird                            */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroBird.prototype = Object.create(Character.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;

/**
 * The bird that you are helping home.
 * @constructor
 * @param {number} tint - The tint of the bird.
 * @return {Object} Itself.
 */
function BirdheroBird (tint) {
	Character.call(this); // Parent constructor.
	this.turn = true;

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
		frame: this.beak.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
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

		/* For some reason the tint need to be changed to update the frame. */
		// TODO: Update this when issue is solved in Phaser.
		this.tint += this.tint % 2 === 0 ? 1 : -1;
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
 * @return {Object} The animation timeline
 */
BirdheroBird.prototype.countFeathers = function () {
	var number = this.number;
	var fun = function (i) {
		this.number = i;
		this.showWings();
	};

	var t = new TimelineMax();
	for (var i = 1; i <= number; i++) {
		t.addCallback(fun, i-1, [i], this);
	}
	t.addCallback(function () {}, '+=1');
	return t;
};
