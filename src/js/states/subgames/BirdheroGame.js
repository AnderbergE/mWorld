/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bird Hero game
/* Methods:         All
/* Representations: All, except "none".
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype = Object.create(NumberGame.prototype);
BirdheroGame.prototype.constructor = BirdheroGame;
function BirdheroGame () {
	NumberGame.call(this); // Call parent constructor.
}

/* Position coordinates for the game */
BirdheroGame.prototype.pos = {
	tree: {
		x: 640, y: 15, center: 140,
		branch: { start: 500, end: 70 },
		elevator: -60
	},
	agent: {
		start: { x: 250, y: 950 },
		stop: { x: 450, y: 500 },
		scale: 0.25
	},
	bird: {
		start: { x: -150, y: 700 },
		stop: { x: 180, y: 550 },
		scale: 0.3, elevator: 0.135, small: 0.06
	}
};

BirdheroGame.prototype.buttonColor = 0xeaea00;

/* Do not use tint below 0x111120, or 0xXXXX20, it will not work on the bird */
BirdheroGame.prototype.tintBank = [
	0xff8888, 0x77ee77, 0x8888ff, 0xfaced0, 0xfedcba,
	0x11abba, 0xabcdef, 0x333333, 0xed88ba
];


/* Phaser state function */
BirdheroGame.prototype.preload = function () {
	this.load.audio('birdheroSpeech', LANG.SPEECH.birdhero.speech); // speech audio sheet
	this.load.audio('birdheroSfx', ['assets/audio/subgames/birdhero/sfx.ogg', 'assets/audio/subgames/birdhero/sfx.mp3']); // sound effects audio sheet
	this.load.audio('birdheroMusic', ['assets/audio/subgames/birdhero/music.ogg', 'assets/audio/subgames/birdhero/music.mp3']);
	this.load.atlasJSONHash('birdhero', 'assets/img/subgames/birdhero/atlas.png', 'assets/img/subgames/birdhero/atlas.json');
};

/* Phaser state function */
BirdheroGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	this.setupButtons({
		buttons: {
			y: this.world.height - (this.representation.length*75) - 25
		},
		yesnos: {
			y: this.world.height - 100
		}
	});
	this.agent.thought.guess.setDirection(true);

	// Setup tints by randomising those in the bank.
	this.tint = this.rnd.shuffle(this.tintBank.slice());

	// Add speech and sounds (music added later)
	this.speech = createAudioSheet('birdheroSpeech', LANG.SPEECH.birdhero.markers);
	this.sfx = createAudioSheet('birdheroSfx', {
		intro:          [ 0.0, 12.7],
		happy:          [13.4,  3.8],
		outro:          [18.0,  3.7],
		elevatorDing:   [22.2,  0.8],
		elevatorArrive: [23.6,  0.8],
		elevatorDown:   [25.0,  1.3]
	});

	// Add background
	this.add.sprite(0, 0, 'birdhero', 'bg', this.gameGroup);
	var cloud1 = this.gameGroup.create(-1000, 50, 'objects', 'cloud1');
	var cloud2 = this.gameGroup.create(-1000, 225, 'objects', 'cloud2');
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
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.bird.addThought(450, -250, this.representation[0], true);
		this.bird.thought.guess.setDirection(true);
		this.bird.thought.toScale = 1.3;
	}
	this.elevator.add(this.bird);

	var bucket = this.add.sprite(0, 0, 'birdhero', 'bucket', this.elevator);
	bucket.scale.set(1.2);
	bucket.anchor.set(0.5, 0);
	this.elevator.text = this.add.text(0, bucket.y + bucket.height*0.7, '0', {
		font: '30pt ' +  GLOBAL.FONT,
		fill: '#ff0000'
	}, this.elevator);
	this.elevator.text.anchor.set(0.5);


	// Add Timeline/Tween functions
	var _this = this; // Subscriptions to not have access to 'this' object
	this.bird.moveTo = {
		initial: function () {
			return _this.bird.move({ x: _this.pos.bird.stop.x - _this.elevator.x, y: _this.pos.bird.stop.y - _this.elevator.origin }, 2, _this.pos.bird.scale);
		},
		elevator: function () {
			return _this.bird.move({ x: 0, y: bucket.height*0.4 }, 2, _this.pos.bird.small);
		},
		peak: function (up) {
			if (up) {
				return _this.bird.move({ y: '-=40' }, 1, _this.pos.bird.elevator);
			}
			return _this.bird.move({ y: '+=40' }, 1, _this.pos.bird.small);
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
					(_this.tree.branch[target-1].y + _this.tree.branch[target-1].visit().y - bucket.height*0.5)),
				ease: Power1.easeInOut,
				onComplete: function () {
					_this.atValue = target;
					_this.elevator.text.text = _this.atValue.toString();
				}
			});
		},
		/* Direct true goes directly to target, false stops at each floor. */
		branch: function (target, direct, from) {
			var t = new TimelineMax();

			var currentFloor = from || _this.atValue;
			if (currentFloor !== target) {
				var dir =  currentFloor < target ? 1 : -1;

				if (direct) {
					t.add(_this.elevator.moveTo._step(target));
				} else {
					for (var i = currentFloor + dir; true; i += dir) {
						t.add(_this.elevator.moveTo._step(i));
						if (i !== target) {
							t.addCallback(_this.sfx.play, null, ['elevatorDing'], _this.sfx);
						} else {
							break;
						}
					}
				}
			}

			if (target === 0) {
				t.addSound(_this.sfx, null, 'elevatorDown', 0);
			} else {
				t.addCallback(_this.sfx.play, null, ['elevatorArrive'], _this.sfx);
			}

			return t;
		}
	};

	/* Play music and move clouds on the first mode that is not the intro. */
	EventSystem.subscribe(GLOBAL.EVENT.modeChange, playMusic);
	function playMusic (mode) {
		if (mode !== GLOBAL.MODE.intro) {
			_this.add.audio('birdheroMusic', 1, true).play();
			TweenMax.fromTo(cloud1, 350, { x: -cloud1.width }, { x: _this.world.width, repeat: -1 });
			TweenMax.fromTo(cloud2, 280, { x: -cloud2.width }, { x: _this.world.width, repeat: -1 });
			EventSystem.unsubscribe(GLOBAL.EVENT.modeChange, playMusic);
		}
	}


	// Everything is set up! Blast off!
	this.startGame();
};

/**
 * Zoom in on a certain place.
 * @param {number} ins - 1 = the start pos, 2 = the tree, else zoom out.
 */
BirdheroGame.prototype.zoom = function (ins) {
	var t = new TimelineMax();
	if (ins === 1) {
		t.add(TweenMax.to(this.gameGroup, 2, { x: -160, y: -650 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 2, { x: 2, y: 2 }), 0);
	} else if (ins === 2) {
		t.add(TweenMax.to(this.gameGroup, 2, { x: -350, y: -110 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 2, { x: 1.4, y: 1.4 }), 0);
	} else {
		t.add(TweenMax.to(this.gameGroup, 1.5, { x: 0, y: 0 }), 0);
		t.add(TweenMax.to(this.gameGroup.scale, 1.5, { x: 1, y: 1 }), 0);
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Instruction functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype.instructionCount = function () {
	var t = new TimelineMax();
	t.add(this.newRound(true));
	t.addCallback(this.updateButtons, null, null, this);
	t.addSound(this.speech, this.bird, 'blownOut');
	t.addLabel('countFeathers', '+=0.5');
	t.addSound(this.speech, this.bird, 'countFeathers', 'countFeathers');
	t.add(this.bird.countFeathers(), 'countFeathers');
	this.instructionButtons(t);
	return t;
};

BirdheroGame.prototype.instructionSteps = BirdheroGame.prototype.instructionCount;

BirdheroGame.prototype.instructionAdd = function () {
	var t = new TimelineMax();
	t.add(this.newRound());
	t.addCallback(this.updateButtons, null, null, this);
	t.addCallback(function () {}, '+=' + this.speech.markers.howMuchHigher.duration);
	this.instructionButtons(t);
	return t;
};

BirdheroGame.prototype.instructionSubtract = function () {
	var t = new TimelineMax();
	t.add(this.newRound());
	t.addCallback(this.updateButtons, null, null, this);
	t.addCallback(function () {}, '+=' + this.speech.markers.howMuchLower.duration);
	this.instructionButtons(t);
	return t;
};

BirdheroGame.prototype.instructionAddSubtract = function () {
	var t = new TimelineMax();
	t.add(this.newRound());
	t.addCallback(this.updateButtons, null, null, this);
	t.addCallback(function () {}, '+=' + this.speech.markers.higherOrLower.duration);
	this.instructionButtons(t);
	return t;
};

BirdheroGame.prototype.instructionButtons = function (t) {
	t.addLabel('useButtons', '+=0.5');
	t.addLabel('flashButtons', '+=1.2');
	t.addSound(this.speech, this.bird, 'pushButton', 'useButtons');
	t.add(fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
};

BirdheroGame.prototype.instructionAgentTry = function () {
	var t = new TimelineMax();
	// t.addSound(this.speech, this.bird, 'instruction2a');
	t.add(fade(this.yesnos, true), 0);
	t.add(this.yesnos.children[0].highlight(1));
	// t.addSound(this.speech, this.bird, 'instruction2b');
	t.add(this.yesnos.children[1].highlight(1));
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/* Start a new round, aka: introduce a new bird */
BirdheroGame.prototype.newRound = function (silent) {
	this.bird.number = this.currentNumber;
	this.bird.tint = this.tint[this.bird.number - 1];
	this.bird.x = this.pos.bird.start.x - this.elevator.x;
	this.bird.y = this.pos.bird.start.y - this.elevator.origin;
	this.bird.scale.set(this.pos.bird.scale);
	this.bird.visible = true;

	var t = new TimelineMax();
	t.add(this.zoom(1), 0);
	t.add(this.bird.moveTo.initial(), 0);

	this.doStartFunction(t, silent);

	return t;
};

BirdheroGame.prototype.startStop = function (t, silent) {
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addCallback(function () { this.bird.say(this.speech, 'helpMeHome').play('helpMeHome'); }, '+=0.3', null, this);
	}
};

BirdheroGame.prototype.startBelow = function (t, silent) {
	t.addSound(this.speech, this.bird, 'useMyself');
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addCallback(function () { this.bird.say(this.speech, 'howMuchHigher').play('howMuchHigher'); }, '+=0.3', null, this);
	}
};

BirdheroGame.prototype.startAbove = function (t, silent) {
	t.addSound(this.speech, this.bird, 'useMyself');
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor');
		t.addCallback(this.bird.showWings, null, null, this.bird);
		t.addCallback(function () { this.bird.say(this.speech, 'howMuchLower').play('howMuchLower'); }, '+=0.3', null, this);
	}
};

BirdheroGame.prototype.startThink = function (t, silent) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(1, this.amount);
		this.bird.thought.guess.number = this.addToNumber;
	}, null, null, this);

	if (!silent) {
		t.addSound(this.speech, this.bird, 'thisFloor');
		t.addCallback(this.bird.showWings, null, null, this.bird);
	}

	t.addLabel('thinker', '+=0.3');
	t.add(this.bird.think(), 'thinker');
	if (!silent) {
		t.addSound(this.speech, this.bird, 'thinkItIs', 'thinker');
		t.addCallback(function () { this.bird.say(this.speech, 'higherOrLower').play('higherOrLower'); }, '+=0.3', null, this);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Number chosen and return functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype.runNumber = function (number, simulate) {
	var origin = this.atValue;
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);
	var branch = this.tree.branch[sum-1];

	this.disable(true);
	this.agent.eyesFollowObject(this.bird.beak);
	if (this.bird.thought) {
		this.bird.thought.visible = false;
	}

	var t = new TimelineMax();
	if (GLOBAL.debug) { t.skippable(); } // NOTE: This malfunctions in add/subt methods.

	t.addCallback(this.bird.showWings, null, [false], this.bird);

	t.add(this.zoom(0), 0);
	if (!origin) {
		t.add(this.bird.moveTo.elevator(), 0);
		t.add(this.bird.moveTo.peak(true));
	}
	t.add(this.elevator.moveTo.branch(sum));
	t.add(this.bird.moveTo.peak(false));
	t.add(this.bird.moveTo.nest(sum));

	/* Correct :) */
	if (!result) {
		t.addCallback(function () {
			this.hideButtons();
			this.bird.visible = false;
			branch.chicks++;
			this.agent.setHappy();
		}, null, null, this);
		t.addLabel('celebrate');
		t.addSound(this.sfx, null, 'happy', 'celebrate');
		t.add(branch.celebrate(2), 'celebrate');
		t.add(this.elevator.moveTo.branch(0, true, sum));

	/* Incorrect :( */
	} else {
		t.addLabel('wrong');
		t.addCallback(this.agent.setSad, 'wrong', null, this.agent);
		t.addSound(this.speech, this.bird, game.rnd.integerInRange(0, 1) ? 'dontLiveHere' : 'notMyParent');
		t.addSound(this.speech, this.bird, result < 0 ? 'higher' : 'lower', '+=0.2');
		t.add(branch.confused(), 'wrong');
		t.add(this.bird.moveTo.elevator());
		t.add(this.bird.moveTo.peak(true));

		t.add(this.doReturnFunction(sum, origin, result));
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

BirdheroGame.prototype.returnToStart = function (from) {
	var t = new TimelineMax();
	t.add(this.elevator.moveTo.branch(0, true, from));
	t.add(this.bird.moveTo.peak(false));
	t.addLabel('initial');
	t.add(this.bird.moveTo.initial(), 'initial');
	t.add(this.zoom(1), 'initial');
	t.addCallback(this.bird.moveTurn, null, [1], this.bird);
	return t;
};

BirdheroGame.prototype.returnNone = function () {
	return this.zoom(2);
};

BirdheroGame.prototype.returnToPreviousIfHigher = function (from, to, diff) {
	var t = new TimelineMax();
	t.add(this.returnNone());
	if (diff > 0) {
		t.add(this.elevator.moveTo.branch(to, true, from), 0);
	}
	return t;
};

BirdheroGame.prototype.returnToPreviousIfLower = function (from, to, diff) {
	return this.returnToPreviousIfHigher(from, to, -diff);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BirdheroGame.prototype.modeIntro = function () {
	var group = this.add.group(this.gameGroup);
	var t = new TimelineMax({
		onStart: function () { this.sfx.play('intro'); }, onStartScope: this
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
		this.sfx.stop();
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
			t.add(this.doInstructions()); // includes new round
		} else {
			t.add(this.newRound());
		}
		t.addCallback(this.showNumbers, null, null, this);
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
			// t.addSound(this.speech, this.agent, 'agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
		}
		t.add(this.newRound());
		t.addCallback(this.showNumbers, null, null, this);
	}
};

BirdheroGame.prototype.modeAgentTry = function (intro, tries) {
	this.agent.eyesStopFollow();

	var t = new TimelineMax();
	if (tries > 0) {
		this.bird.showWings();
		// TODO: Add more specified sounds?
		// t.addSound(this.speech, this.agent, 'agentTryAgain');
		t.add(this.agentGuess());
		t.addCallback(this.showYesnos, null, null, this);
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			// t.addSound(this.speech, this.agent, 'agentTry');
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
	this.agent.thought.visible = false;
	this.agent.eyesStopFollow();

	var t = new TimelineMax();
	t.addLabel('water');
	t.addLabel('water2', '+=1.5');
	t.addLabel('water3', '+=3');

	for (var i = 0; i < this.tree.branch.length; i++) {
		t.addCallback(this.tree.branch[i].celebrate, null, null, this.tree.branch[i]);
	}

	t.addCallback(this.agent.setHappy, 'water', null, this.agent);
	t.add(this.agent.fistPump(), 'water');

	t.addSound(this.sfx, null, 'outro', 'water');
	t.addSound(this.speech, null, 'thankYou', 'water2');

	var x = this.tree.x + this.pos.tree.center;
	t.add(this.addWater(x, this.pos.tree.branch.start), 'water');
	t.add(this.addWater(x, this.pos.tree.branch.start*0.7), 'water2');
	t.add(this.addWater(x, this.pos.tree.branch.start*0.4), 'water3');
	t.addCallback(this.nextRound, null, null, this);
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
		this.tint -= 1;
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
