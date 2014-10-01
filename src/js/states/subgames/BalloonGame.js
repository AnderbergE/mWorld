/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Balloon game
/* Methods:         All
/* Representations: All. "none" only in count and step-by-step method.
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGame.prototype = Object.create(NumberGame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	NumberGame.call(this); // Call parent constructor.
}

BalloonGame.prototype.pos = {
	beetle: {
		start: { x: 10, y: 260 },
		stop: { x: -170, y: -40 },
		scale: 0.65
	},
	agent: {
		start: { x: 250, y: 950 },
		stop: { x: 360, y: 570 },
		scale: 0.25,
		mirror: true
	},
	balloons: { x: 150, y: 580 },
	bucket: { x: 780, y: 610 },
	cave: { left: 670, right: 860, y: 555, height: 420 },
	sack: { x: 730, y: 650 },
	map: { x: 520, y: 470 },
	liftoff: { x: 900, y: 670 }
};

BalloonGame.prototype.buttonColor = 0xa3e9a4;

/* Phaser state function */
BalloonGame.prototype.preload = function () {
	this.load.audio('balloonSpeech', LANG.SPEECH.balloongame.speech); // speech sheet
	this.load.audio('balloonSfx', ['assets/audio/subgames/balloongame/sfx.ogg', 'assets/audio/subgames/balloongame/sfx.mp3']); // sound sheet
	this.load.atlasJSONHash('balloon', 'assets/img/subgames/balloon/atlas.png', 'assets/img/subgames/balloon/atlas.json');
};

/* Phaser state function */
BalloonGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	var buttonOptions = {
		yesnos: {
			x: 5,
			y: this.world.height - 100,
			size: this.world.width * 0.6
		}
	};
	if (this.method === GLOBAL.METHOD.addition ||
		this.method === GLOBAL.METHOD.subtraction ||
		this.method === GLOBAL.METHOD.additionSubtraction) {
		buttonOptions.buttons = {
			x: buttonOptions.yesnos.x,
			y: this.world.height - this.representation.length*75 - (this.representation.length > 1 ? 0 : 15),
			size: buttonOptions.yesnos.size
		};
	} else {
		delete this.buttons;
	}
	this.setupButtons(buttonOptions);

	// Add music, sounds and speech
	this.add.audio('entryMusic', 0.4, true).play();
	this.speech = createAudioSheet('balloonSpeech', LANG.SPEECH.balloongame.markers);
	this.sfx = createAudioSheet('balloonSfx', {
			sackJingle:  [0.0,   1.6],
			chestUnlock: [1.9,   1.0],
			pop:         [3.1,   0.3],
			catPurr:     [3.7,   2.8]
	});

	// Add background
	this.gameGroup.add(new Cover('#68acea'));
	var cloud1 = this.gameGroup.create(0, 25, 'objects', 'cloud1');
	var cloud2 = this.gameGroup.create(0, 200, 'objects', 'cloud2');
	// This is needed, otherwise the clouds can be seen slightly to the right of the bg.
	this.gameGroup.create(0, 0, 'balloon', 'bg').width = this.world.width + 1;
	// Make the clouds move.
	TweenMax.fromTo(cloud1, 160, { x: -cloud1.width }, { x: 600, repeat: -1 });
	TweenMax.fromTo(cloud2, 120, { x: -cloud2.width }, { x: 600, repeat: -1 });

	// The interactable bush.
	// TODO: Create better synced graphics.
	var catBush = this.gameGroup.create(this.pos.balloons.x + 35, this.pos.balloons.y - 60, 'balloon', 'catbush1');
	catBush.animations.add('catBlink', ['catbush2', 'catbush3', 'catbush4', 'catbush5', 'catbush6', 'catbush7', 'catbush8', 'catbush9', 'catbush10', 'catbush1']);
	catBush.events.onAnimationComplete.add(function () {
		catBush.inputEnabled = true;
	}, this);

	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(function () {
		catBush.inputEnabled = false;
		this.sfx.play('catPurr');
		catBush.animations.play('catBlink', 8, false);
	}, this);

	// Adding the platforms on the cliff wall.
	this.caves = [];
	var heightPerCave = this.pos.cave.height / this.amount;
	for (var i = 0; i < this.amount; i++) {
		this.caves.push(this.gameGroup.create(
			i % 2 ? this.pos.cave.left : this.pos.cave.right,
			this.pos.cave.y - i * heightPerCave,
			'balloon', 'cave'
		));
	}

	// Reward objects, for when you choose the correct number.
	this.chest = this.gameGroup.create(0, 0, 'balloon', 'chest_closed');
	this.chest.anchor.set(0.5, 1);
	this.chest.visible = false;
	this.treasure = this.gameGroup.create(0, 0, 'balloon', 'treasure1');
	this.treasure.anchor.set(0.5, 1);
	this.treasure.visible = false;
	this.sack = this.gameGroup.create(this.pos.sack.x, this.pos.sack.y, 'balloon', 'sack');
	this.sack.scale.set(0.7);
	this.sack.anchor.set(0.5);

	// Fine-tune the agent and bring it on top
	this.gameGroup.bringToTop(this.agent);
	this.agent.thought.guess.setDirection(true);
	this.agent.thought.toScale = 3;
	this.agent.thought.x += 100;
	this.agent.thought.y -= 140;
	if (this.representation[0] === GLOBAL.NUMBER_REPRESENTATION.none) {
		this.agent.thought.guess.spriteKey = 'balloon';
		this.agent.thought.guess.spriteFrame = 'b';
		this.agent.thought.guess.representations = GLOBAL.NUMBER_REPRESENTATION.objects;
	}

	// The stack to grab balloons from
	this.gameGroup.create(this.pos.balloons.x, this.pos.balloons.y, 'balloon', 'metalloop').anchor.set(0.5);
	this.balloonStack = new BalloonGameStack(this.pos.balloons.x, this.pos.balloons.y, this.amount);
	this.balloonStack.scale.set(0.9);
	this.makeDraggable(this.balloonStack);
	this.gameGroup.add(this.balloonStack);
	// Make the balloons sway.
	TweenMax.fromTo(this.balloonStack.balloons, 2, { angle: -7 }, { angle: 7, ease: Power1.easeInOut, repeat: -1, yoyo: true });

	// The group where the bucket, beetle and right side balloons go into.
	// Put into the same group to make it easier to animate together.
	this.actionGroup = this.add.group(this.gameGroup);
	this.actionGroup.x = this.pos.bucket.x;
	this.actionGroup.y = this.pos.bucket.y;

	this.beetle = this.actionGroup.create(this.pos.beetle.start.x, this.pos.beetle.start.y, 'balloon', 'beetle');
	this.beetle.scale.set(this.pos.beetle.scale);

	this.actionGroup.create(0, 15, 'balloon', 'bucket');
	this.bucketBalloons = new BalloonGameStack(35, 20, 0);
	this.bucketBalloons.scale.set(0.9);
	this.makeDraggable(this.bucketBalloons);
	this.actionGroup.add(this.bucketBalloons);

	// Setup how to show the target number.
	if (this.representation[0] === GLOBAL.NUMBER_REPRESENTATION.none) {
		// Special case when we have no representation.
		this.eyes = this.gameGroup.create(0, 0, 'balloon', 'eyes');
		this.eyes.visible = false;
		this.map = null;
	} else {
		this.map = this.add.group(this.gameGroup);
		this.map.x = this.pos.map.x;
		this.map.y = this.pos.map.y;
		this.map.visible = false;
		this.map.create(0, 0, 'balloon', 'map'); // Background for map
		this.map.target = new NumberButton(0, this.representation[0], { // Representation on map
			x: 30, y: 30, size: 70, background: null, disabled: true
		});
		this.map.add(this.map.target);
	}

	// The button to push when done with the balloons.
	var _this = this;
	this.liftoffButton = new SpriteButton ('balloon', 'anchor', {
		x: this.pos.liftoff.x,
		y: this.pos.liftoff.y,
		onClick: function () {
			var amount = _this.bucketBalloons.amount + _this.bucketBalloons.pending;
			if (amount <= 0) {
				// TODO: Add a voice saying you need to attach balloons to the bucket.
				void(amount);
			} else {
				_this.pushNumber(amount);
			}
		}
	});
	if (!!this.buttons) {
		this.liftoffButton.visible = false;
	}
	this.gameGroup.add(this.liftoffButton);


	// Let's start the game!
	this.startGame();
};


/**
 * Make it possible to drag a balloon from a stack.
 * @param {Object} stack - The balloon stack.
 */
BalloonGame.prototype.makeDraggable = function (stack) {
	stack.balloons.inputEnabled = true;
	// Can not use drag: it will change the position of the stack, not a new balloon.
	stack.balloons.events.onInputDown.add(function () {
		if (stack.amount > 0) {
			stack.updateBalloons(stack.amount - 1);

			var b = this.gameGroup.create(game.input.activePointer.x, game.input.activePointer.y, 'balloon', 'b1');
			b.scale.set(0.9);
			b.anchor.set(0.5, 1);
			b.update = function () {
				this.x = game.input.activePointer.x;
				this.y = game.input.activePointer.y;
			};

			var f = function () {
				stack.balloons.events.onInputUp.remove(f, this);
				b.update = function () {};
				this.stopDrag(b);
			};
			stack.balloons.events.onInputUp.add(f, this);
		}
	}, this);
};

/**
 * When you let go of a balloon.
 * @param {Object} balloon - The balloon that is being moved.
 */
BalloonGame.prototype.stopDrag = function (balloon) {
	var t = new TimelineMax();
	// Add balloons to bucket if on the righter side of the screen.
	if (balloon.x > this.world.width/2) {
		// Add to the buckets. Using a pending value in case lift off is clicked during transition.
		this.bucketBalloons.pending++;
		t.to(balloon, 0.5, { x: this.actionGroup.x + this.bucketBalloons.x, y: this.actionGroup.y + this.bucketBalloons.y });
		t.addCallback(function () {
			this.bucketBalloons.pending--;
			this.bucketBalloons.updateBalloons(this.bucketBalloons.amount + 1);
		}, null, null, this);

	} else {
		// Go back to the left balloon stack.
		t.to(balloon, 1, this.pos.balloons);
		t.addCallback(function () {
			this.balloonStack.updateBalloons(this.balloonStack.amount + 1);
		}, null, null, this);
	}
	t.addCallback(balloon.destroy, null, null, balloon);
};

/**
 * Move ballons from stack to bucket.
 * @param {number} number - Balloons to move (negative moves to stack instead of bucket).
 * @param {Object} from - The stack to move from (default balloonStack).
 * @param {Object} to - The stack to move to (default bucketBalloons).
 */
BalloonGame.prototype.moveBalloons = function (number) {
	number = number || 0;
	// We cannot use world coordinates since the balloons may not have any.
	var from, to, fromX, fromY;
	if (number > 0) {
		from = this.balloonStack;
		to = this.bucketBalloons;
		fromX = this.balloonStack.x;
		fromY = this.balloonStack.y;
	} else {
		from = this.bucketBalloons;
		to = this.balloonStack;
		fromX = this.actionGroup.x + this.bucketBalloons.x;
		fromY = this.actionGroup.y + this.bucketBalloons.y;
	}
	number = Math.abs(number);

	var _this = this;
	function start (balloon) {
		balloon.visible = true;
		from.updateBalloons(from.amount - 1);
		if (to === _this.bucketBalloons) {
			this.updateTo({
				x: _this.actionGroup.x + _this.bucketBalloons.x,
				y: _this.actionGroup.y + _this.bucketBalloons.y
			});
		} else {
			this.updateTo({
				x: _this.balloonStack.x,
				y: _this.balloonStack.y
			});
		}
	}
	function complete () {
		this.destroy();
		to.updateBalloons(to.amount + 1);
	}

	var t = new TimelineMax();
	for (var i = 0; i < number; i++) {
		var balloon = this.gameGroup.create(fromX, fromY, 'balloon', 'b1');
		balloon.scale.set(0.9);
		balloon.anchor.set(0.5, 1);
		balloon.visible = false;
		t.add(TweenMax.to(balloon, 1, {
			onStart: start, onStartParams: [balloon],
			onComplete: complete, onCompleteScope: balloon
		}, i * 0.5));
	}
	return t;
};

/**
 * Pops the balloons attached to the bucket.
 * @return {Object} The animation timeline.
 */
BalloonGame.prototype.popBalloons = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.bucketBalloons.popBalloons(); // Will set amount to 0.
		this.balloonStack.updateBalloons(this.amount);
	}, null, null, this);
	t.addSound(this.sfx, null, 'pop');
	return t;
};

/**
 * Makes it so we can't click the balloons.
 * @param {boolean} value - true is disabled, false is enabled.
 */
BalloonGame.prototype.disableBalloons = function (value) {
	this.balloonStack.balloons.inputEnabled = !value;
	this.bucketBalloons.balloons.inputEnabled = !value;
	this.liftoffButton.disabled = value;
};

/**
 * Overshadowed from NumberGame.
 * Shows either the panel or makes it possible to drag the balloons.
 */
BalloonGame.prototype.showNumbers = function () {
	if (this.buttons) {
		this.disableBalloons(true);
		NumberGame.prototype.showNumbers.call(this);
	} else {
		// "Special" case: borrow things from showNumbers.
		this.hideButtons();
		this.disable(false);
		this.disableBalloons(false);
		fade(this.liftoffButton, true);
		if (this.agent.visible) {
			fade(this.agent.thought, false);
			this.agent.eyesFollowPointer();
		}
	}
};

/**
 * Overshadowed from NumberGame.
 * Shows either the panel or makes it possible to drag the balloons.
 */
BalloonGame.prototype.showYesnos = function () {
	fade(this.liftoffButton, false);
	NumberGame.prototype.showYesnos.call(this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Instruction functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGame.prototype.instructionCount = function () {
	var t = new TimelineMax();
	t.add(this.newTreasure(true));
	t.addSound(this.speech, this.beetle, 'canYouDrag');
	t.add(this.instructionDrag(), 0);

	var label;
	for (var i = 1; i <= 4; i++){
		label = 'floor' + i;
		t.addLabel(label, '+=0.5');
		t.addSound(this.speech, this.beetle, label);
		t.add(this.pointAtCave(i), label);
	}

	t.addSound(this.speech, this.beetle, 'canYouDragRight', '+=0.5');
	t.addLabel('pushAnchor', '+=0.5');
	t.add(this.liftoffButton.highlight(1), 'pushAnchor');
	t.addSound(this.speech, this.beetle, 'pushAnchor', 'pushAnchor');
	return t;
};

BalloonGame.prototype.instructionSteps = function () {
	var t = new TimelineMax();
	t.add(this.newTreasure(true));
	t.addSound(this.speech, this.beetle, 'canYouDragRight');
	t.add(this.instructionDrag(), 0);
	t.addSound(this.speech, this.beetle, 'pushAnchor');
	return t;
};

BalloonGame.prototype.instructionAdd = function () {
	return this.instructionButtons('presetBalloons', 'pushButton');
};

BalloonGame.prototype.instructionSubtract = function () {
	var t = this.instructionButtons('guessBalloons', 'buttonSubtract');
	t.addSound(this.speech, this.beetle, 'sameAsMap', '+=0.6');
	t.addSound(this.speech, this.beetle, 'whatButton', '+=0.8');
	return t;
};

BalloonGame.prototype.instructionAddSubtract = function () {
	var t = this.instructionButtons('guessBalloons', 'buttonAddSub');
	t.addSound(this.speech, this.beetle, 'sameAsMap', '+=0.6');
	t.addSound(this.speech, this.beetle, 'whatButton', '+=0.8');
	return t;
};

BalloonGame.prototype.instructionButtons = function (moveSound, pushSound) {
	var t = new TimelineMax();
	t.addLabel('moveBalloons');
	t.addSound(this.speech, this.beetle, moveSound, 'moveBalloons');
	t.add(this.newTreasure(true), 'moveBalloons');
	t.addCallback(this.updateButtons, null, null, this);
	t.addLabel('useButtons', '+=0.3');
	t.addLabel('flashButtons', '+=0.8');
	t.addSound(this.speech, this.beetle, pushSound, 'useButtons');
	t.add(fade(this.buttons, true), 'useButtons');
	t.addCallback(this.buttons.highlight, 'flashButtons', [1], this.buttons);
	return t;
};

BalloonGame.prototype.instructionDrag = function () {
	var arrow = this.gameGroup.create(this.balloonStack.x + this.balloonStack.width*0.25, this.balloonStack.y - this.balloonStack.height*0.5, 'objects', 'arrow');
	arrow.anchor.set(0, 0.5);
	arrow.tint = this.buttonColor;
	arrow.visible = false;
	return new TimelineMax({ onStart: function () { arrow.visible = true; } })
		.to(arrow, 3, { x: this.actionGroup.x + 20, y: this.actionGroup.y + 20, angle: 180, ease: Power1.easeInOut }, '+=1')
		.addCallback(arrow.destroy, '+=1', null, arrow);
};

BalloonGame.prototype.pointAtCave = function (number) {
	var cave = this.caves[number - 1];
	var offset = 50;
	var arrow = this.gameGroup.create(cave.x, cave.y + cave.height*0.6, 'objects', 'arrow');
	if (number % 2 === 0) { // Cave to the left
		arrow.x += cave.width + offset;
		offset *= -1;
	} else { // Cave to the right
		arrow.x -= offset;
		arrow.scale.x = -1;
	}
	arrow.anchor.set(0, 0.5);
	arrow.tint = this.buttonColor;
	arrow.visible = false;
	return new TweenMax(arrow, 2, { x: '+=' + offset,
		onStart: function () { arrow.visible = true; },
		onComplete: function () { arrow.destroy(); }
	});
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Start round functions                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/** This creates a new treasure to search for. */
BalloonGame.prototype.newTreasure = function (silent) {
	var t = new TimelineMax();
	if (!silent) {
		t.addSound(this.speech, this.beetle, 'newTreasure');
		t.addSound(this.speech, this.beetle, 'yippie1');
	}

	if (this.eyes) {
		this.eyes.x = this.caves[this.currentNumber - 1].x + 30;
		this.eyes.y = this.caves[this.currentNumber - 1].y + 30;
		t.add(fade(this.eyes, true));
	}
	if (this.map) {
		t.add(fade(this.map.target, false), 0);
		t.addCallback(function () { this.map.target.number = this.currentNumber; }, 0.5, null, this);
		t.add(fade(this.map.target, true), 1);
	}

	this.doStartFunction(t, silent);

	return t;
};

/**
 * This creates a random number of balloons to begin with.
 * @param {number} min - Minimum value of random.
 * @param {number} max - Maximum value of random.
 */
BalloonGame.prototype.startWithBalloons = function (t, min, max) {
	this.addToNumber = this.rnd.integerInRange(min, max);
	this.atValue = this.addToNumber;
	t.add(this.moveBalloons(this.addToNumber));
};

BalloonGame.prototype.startStop = function (t, silent) {
	if (!silent) {
		t.addSound(this.speech, this.beetle, 'helpMeGetThere');
	}
};

BalloonGame.prototype.startBelow = function (t) {
	this.startWithBalloons(t, 1, this.currentNumber - 1);
};

BalloonGame.prototype.startAbove = function (t) {
	this.startWithBalloons(t, this.currentNumber + 1, this.amount);
};

BalloonGame.prototype.startThink = function (t) {
	this.startWithBalloons(t, 0, this.amount);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                    Number chosen and return functions                     */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
/**
 * When you press the anchor this happens.
 * @param {number} amount - The amount of balloons to try with.
 *                          NOTE: this.addToNumber is added to the amount (used in some methods).
 */
BalloonGame.prototype.runNumber = function (amount) {
	var sum = amount + this.addToNumber;
	var result = this.tryNumber(sum);

	this.disable(true);
	this.agent.eyesFollowObject(this.beetle);

	var t = new TimelineMax();
	if (GLOBAL.debug) { t.skippable(); }

	if ((this.bucketBalloons.amount + this.bucketBalloons.pending) !== sum) {
		t.add(this.moveBalloons(sum - this.bucketBalloons.amount));
	}

	if (this.beetle.x !== 0 && this.beetle.y !== 0) {
		t.add(new TweenMax(this.beetle, 2, { x: 0, y: 0, ease: Power1.easeIn }));
	}

	if (this.actionGroup.y !== this.caves[sum - 1].y) {
		t.add(new TweenMax(this.actionGroup, 2, { y: this.caves[sum - 1].y, ease: Power1.easeInOut }));
	}

	/* Correct :) */
	if (!result) {
		t.addCallback(function () {
			this.hideButtons();
			this.agent.setHappy();
		}, null, null, this);
		t.add(this.openChest(sum));
		if (this.method !== GLOBAL.METHOD.incrementalSteps) {
			this.returnToStart(t);
		}

	/* Incorrect :( */
	} else {
		t.addCallback(this.agent.setSad, null, null, this.agent);
		t.addSound(this.speech, this.beetle, 'wrong' + game.rnd.integerInRange(1, 2));
		t.addSound(this.speech, this.beetle, result > 0 ? 'lower' : 'higher', '+=0.2');
		this.doReturnFunction(t, sum, result);
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

/**
 * The animation and sound of the chest opening.
 * @param {number} number - The cave number.
 */
BalloonGame.prototype.openChest = function (number) {
	this.chest.frameName = 'chest_closed';
	this.chest.x = this.caves[number - 1].x + 55;
	this.chest.y = this.caves[number - 1].y + 50;

	var t = new TimelineMax();
	if (this.eyes) {
		t.add(fade(this.eyes, false));
	}
	t.add(fade(this.chest, true));
	t.addSound(this.sfx, null, 'chestUnlock');
	t.addCallback(function () { this.chest.frameName = 'chest_open'; }, null, null, this);
	t.add(this.playRandomPrize());
	t.add(fade(this.chest, false));
	return t;
};

/** A prize popping out of the chest. */
BalloonGame.prototype.playRandomPrize = function () {
	this.treasure.x = this.chest.x;
	this.treasure.y = this.chest.y + 10;
	this.treasure.visible = false;

	/* The boot is the special prize, it has a low percentage of coming. */
	var sound;
	if (game.rnd.frac() < 0.1) {
		this.treasure.frameName = 'treasure6';
		sound = 'treasureBoot';
	} else {
		this.treasure.frameName = 'treasure' + game.rnd.integerInRange(1, 5);
		sound = game.rnd.integerInRange(0, 1) ?
			('yippie' + game.rnd.integerInRange(1, 2)) :
			('treasure' + game.rnd.integerInRange(1, 2));
	}

	var t = new TimelineMax();
	t.addCallback(this.speech.play, null, [sound], this.speech);
	t.add(new TweenMax(this.treasure, 1, { y: '-=75', ease: Power1.easeOut }));
	t.add(fade(this.treasure, true), '-=1');
	t.add(new TweenMax(this.treasure, 1, { y: '+=75', ease: Power1.easeIn }));
	t.add(new TweenMax(this.treasure, 2, { x: this.pos.sack.x, y: this.pos.sack.y + 10, ease: Power4.easeIn }));
	t.addLabel('sacking');
	t.addSound(this.sfx, null, 'sackJingle', 'sacking');
	t.add(new TweenMax(this.sack, 0.2, { y: '+=3', ease: Power1.easeInOut }).backForth(1.4), 'sacking');
	return t;
};

/** Pop the balloons and go back down. */
BalloonGame.prototype.popAndReturn = function (t) {
	t.to(this.beetle, 0.5, { y: '-=50', ease: Power4.easeIn }, '-=0.5');
	t.add(this.popBalloons());
	t.to(this.beetle, 0.5, { y: '+=50', ease: Power4.easeIn });
	t.addCallback(this.bucketBalloons.updateBalloons, null, null, this.bucketBalloons);
	t.to(this.actionGroup, 2, { y: this.pos.bucket.y, ease: Bounce.easeOut });
};

BalloonGame.prototype.returnToStart = function (t) {
	this.atValue = 0;
	this.popAndReturn(t);
};

BalloonGame.prototype.returnNone = function (t, number) {
	this.atValue = number;
};

BalloonGame.prototype.returnToPreviousIfHigher = function (t, number, diff) {
	if (diff > 0) {
		this.popAndReturn(t);
		t.add(this.moveBalloons(this.atValue));
		// TODO: Say something
	} else {
		this.returnNone(t, number);
	}
};

BalloonGame.prototype.returnToPreviousIfLower = function (t, number, diff) {
	if (diff < 0) {
		this.popAndReturn(t);
		t.add(this.moveBalloons(this.atValue));
		// TODO: Say something
	} else {
		this.returnNone(t, number);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGame.prototype.modeIntro = function () {
	var t = new TimelineMax().skippable();
	t.add(new TweenMax(this.beetle, 3, { x: this.pos.beetle.stop.x, y: this.pos.beetle.stop.y, ease: Power1.easeIn }));
	t.addSound(this.speech, this.beetle, 'loveTreasures');
	t.addSound(this.speech, this.beetle, 'yippie1');
	t.addSound(this.speech, this.beetle, 'helpToCave', '+=0.5');
	if (this.map) {
		this.map.target.number = this.currentNumber;
		t.add(fade(this.map, true));
		t.addSound(this.speech, this.beetle, 'lookAtMap', '-=0.3');
	}
	t.addCallback(this.nextRound, null, null, this);
};

BalloonGame.prototype.modePlayerDo = function (intro, tries) {
	var t = new TimelineMax();
	if (tries === 0) { // New round.
		if (intro) {
			t.skippable();
			t.add(this.doInstructions()); // includes new treasure
		} else {
			t.add(this.newTreasure());
		}
	}
	t.addCallback(this.showNumbers, null, null, this);
};

BalloonGame.prototype.modePlayerShow = function (intro, tries) {
	var t = new TimelineMax();
	if (tries === 0) { // New round.
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
			t.addSound(this.agent.speech, this.agent, 'balloonIntro', 'agentIntro');
			t.addCallback(function () {}, '+=0.5'); // pause
		}
		t.add(this.newTreasure());
	}
	t.addCallback(this.showNumbers, null, null, this);
};

BalloonGame.prototype.modeAgentTry = function (intro, tries) {
	this.disableBalloons(true);

	var t = new TimelineMax();
	if (tries > 0) {
		t.addSound(this.agent.speech, this.agent, 'tryAgain');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.agent.speech, this.agent, 'myTurn' + game.rnd.integerInRange(1, 2));
		}
		t.add(this.newTreasure());
	}

	t.add(this.agentGuess(), '+=0.3');
	if (intro) {
		t.add(this.instructionYesNo(), '+=0.5');
	}
	t.addCallback(this.showYesnos, null, null, this);
};

BalloonGame.prototype.modeOutro = function () {
	this.agent.thought.visible = false;
	fade(this.liftoffButton, false);

	var t = new TimelineMax().skippable();
	t.addSound(this.speech, this.beetle, 'fullSack');
	t.addLabel('water');
	t.addLabel('water2', '+=1.5');
	t.addLabel('water3', '+=3');
	t.addCallback(this.agent.setHappy, 'water', null, this.agent);
	t.add(this.agent.fistPump(), 'water');
	t.add(this.addWater(this.beetle.world.x, this.beetle.world.y), 'water');
	t.addSound(this.speech, this.beetle, 'thankYou', 'water2');
	t.add(this.addWater(this.beetle.world.x, this.beetle.world.y), 'water2');
	t.add(this.addWater(this.beetle.world.x, this.beetle.world.y), 'water3');
	t.addCallback(this.nextRound, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Balloon Stack                                */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGameStack.prototype = Object.create(Phaser.Group.prototype);
BalloonGameStack.prototype.constructor = BalloonGameStack;

function BalloonGameStack (x, y, amount) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	this.amount = amount || 0;
	this.pending = 0;
	this.balloons = this.create(0, 0, 'balloon');
	this.balloons.anchor.set(0.5, 1);
	this.updateBalloons();
}

BalloonGameStack.prototype.updateBalloons = function (amount) {
	if (!isNaN(amount)) {
		this.amount = amount;
	}

	if (this.amount === 0) {
		this.visible = false;
	} else {
		this.balloons.frameName = 'b' + this.amount;
		this.visible = true;
	}
};

BalloonGameStack.prototype.popBalloons = function () {
	this.amount = 0;
	this.balloons.frameName = 'b0';
};