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
		stop: { x: 390, y: 500 },
		scale: 0.25,
		mirror: true
	},
	balloons: { x: 150, y: 500 },
	bucket: { x: 780, y: 540 },
	cave: { left: 670, right: 860, y: 450, height: 420 },
	sack: { x: 950, y: 600 },
	liftoff: { x: 850, y: 650 }
};

/* Phaser state function */
BalloonGame.prototype.preload = function () {
	this.load.audio('balloonSpeech', LANG.SPEECH.balloongame.speech); // audio sprite sheet
	this.load.audio('balloonMusic',  ['assets/audio/subgames/birdhero/bg.ogg', 'assets/audio/subgames/birdhero/bg.mp3']);
	this.load.audio('pop',           ['assets/audio/subgames/balloongame/pop.ogg', 'assets/audio/subgames/balloongame/pop.mp3']);
	this.load.audio('catbushpurr',   ['assets/audio/subgames/balloongame/catbushpurr.ogg', 'assets/audio/subgames/balloongame/catbushpurr.mp3']);
	this.load.audio('chestunlock',   ['assets/audio/subgames/balloongame/chestunlock.ogg', 'assets/audio/subgames/balloongame/chestunlock.mp3']);
	this.load.audio('sackjingle',    ['assets/audio/subgames/balloongame/belljingle.ogg', 'assets/audio/subgames/balloongame/belljingle.mp3']);

	this.load.atlasJSONHash('balloon', 'assets/img/subgames/balloon/atlas.png', 'assets/img/subgames/balloon/atlas.json');
	this.load.image('cloud1', 'assets/img/objects/cloud1.png');
	this.load.image('cloud2', 'assets/img/objects/cloud2.png');
};

/* Phaser state function */
BalloonGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	var buttonOptions = {
		yesnos: {
			x: 0,
			y: this.world.height-100,
			size: this.world.width - 300
		}
	};
	if (this.method === GLOBAL.METHOD.addition ||
		this.method === GLOBAL.METHOD.subtraction ||
		this.method === GLOBAL.METHOD.additionSubtraction) {
		buttonOptions.buttons = {
			x: 0,
			y: this.world.height-80,
			size: this.world.width - 300
		};
	}
	this.setupButtons(buttonOptions);

	// Add sounds and speech
	this.add.audio('balloonMusic', 1, true).play();
	this.speech = createAudioSheet('balloonSpeech', LANG.SPEECH.balloongame.markers);

	// Add background
	this.gameGroup.add(new Cover('#689cca'));
	this.cloud1 = this.gameGroup.create(0, 25, 'cloud1');
	this.cloud2 = this.gameGroup.create(0, 200, 'cloud2');
	// This is needed, otherwise the clouds can be seen slightly to the right of the bg.
	this.gameGroup.create(0, 0, 'balloon', 'bg').width = this.world.width + 1;
	// Make the clouds move.
	TweenMax.fromTo(this.cloud1, 70, { x: -this.cloud1.width }, { x: this.world.width, repeat: -1 });
	TweenMax.fromTo(this.cloud2, 50, { x: -this.cloud2.width }, { x: this.world.width, repeat: -1 });

	// The interactable bush.
	// TODO: Create better synced graphics.
	var catBush = this.gameGroup.create(175, 420, 'balloon', 'catbush1');
	catBush.purr = this.add.audio('catbushpurr');
	catBush.animations.add('catBlink', ['catbush2', 'catbush3', 'catbush4', 'catbush5', 'catbush6', 'catbush7', 'catbush8', 'catbush9', 'catbush10', 'catbush1']);
	catBush.events.onAnimationComplete.add(function () {
		catBush.inputEnabled = true;
	}, this);

	catBush.inputEnabled = true;
	catBush.events.onInputDown.add(function () {
		catBush.inputEnabled = false;
		catBush.purr.play();
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
	this.chest.anchor.setTo(0.5, 1);
	this.chest.visible = false;
	this.treasure = this.gameGroup.create(0, 0, 'balloon', 'treasure1');
	this.treasure.anchor.setTo(0.5, 1);
	this.treasure.visible = false;
	this.sack = this.gameGroup.create(this.pos.sack.x, this.pos.sack.y, 'balloon', 'sack');
	this.sack.anchor.setTo(0.5, 0.5);

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
	this.makeDraggable(this.bucketBalloons);
	this.actionGroup.add(this.bucketBalloons);

	this.magnifyGroup = this.add.group(this.gameGroup);
	this.magnifyGroup.x = 530;
	this.magnifyGroup.y = 150;
	this.magnifyGroup.magnifyBubble = this.magnifyGroup.create(0, 0, 'balloon', 'magnify');
	this.magnifyGroup.magnifyBubble.anchor.setTo(0.5, 0.5);
	this.magnifyGroup.magnifyBalloons = this.magnifyGroup.create(-5, 10, 'balloon', 'b'+this.balloonStack.amount);
	this.magnifyGroup.magnifyBalloons.anchor.setTo(0.5, 0.5);
	this.magnifyGroup.magnifyBalloons.scale.set(0.6);
	this.magnifyGroup.visible = false;

	// Setup how to show the target number.
	if (this.representation[0] === GLOBAL.NUMBER_REPRESENTATION.none) {
		// Special case when we have no representation.
		this.eyes = this.gameGroup.create(0, 0, 'balloon', 'eyes');
		this.eyes.visible = false;
	} else {
		this.map = this.add.group(this.gameGroup);
		this.map.x = this.actionGroup.x + this.pos.beetle.stop.x + this.beetle.width - 3;
		this.map.y = this.actionGroup.y + this.pos.beetle.stop.y - 14;
		this.map.visible = false;
		this.map.create(0, 0, 'balloon', 'map'); // Background for map
		this.map.target = new NumberButton(this.correctAnswer, this.representation, { // Representation on map
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

			var b = this.gameGroup.create(0, 0, 'balloon', 'b1');
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
	// Check for ovelap with bucket balloons.
	if (Phaser.Rectangle.intersects(balloon.getBounds(), this.actionGroup.getBounds())) {
		// Add to the buckets. Using a pending value in case lift off is clicked during transition.
		var current = this.bucketBalloons.amount;
		this.bucketBalloons.pending++;
		t.to(balloon, 0.5, { x: this.actionGroup.x + this.bucketBalloons.x, y: this.actionGroup.y + this.bucketBalloons.y });
		t.addCallback(function () {
			this.bucketBalloons.pending--;
			this.bucketBalloons.updateBalloons(current + 1);
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
 * Reset the balloons.
 * @param {integer} value - If the bucket balloons should have a specific amount (default 0).
 */
BalloonGame.prototype.resetBalloons = function (inBucket) {
	inBucket = inBucket || 0;
	this.bucketBalloons.updateBalloons(inBucket);
	this.balloonStack.updateBalloons(this.amount - inBucket); // TODO: Maybe a nice "blow up" animation?
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
 * Pops the balloons attached to the bucket.
 * @return {Object} The animation timeline.
 */
BalloonGame.prototype.popBalloons = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.bucketBalloons.popBalloons(); // Will set amount to 0.
		this.balloonStack.updateBalloons(this.amount); // TODO: Maybe a nice "blow up" animation?
	}, null, null, this);
	t.addSound('pop');
	return t;
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
		this.hideButtons();
		this.disable(false);
		this.disableBalloons(false);
	}
};

/** This creates a new treasure to search for. */
BalloonGame.prototype.newTreasure = function () {
	var t = new TimelineMax();
	if (this.eyes) {
		this.eyes.x = this.caves[this.currentNumber - 1].x + 30;
		this.eyes.y = this.caves[this.currentNumber - 1].y + 30;
		t.add(fade(this.eyes, true));
	}
	if (this.map) {
		this.map.target.number = this.currentNumber;
	}

	t.addSound(this.speech, this.beetle, 'newtreasure');
	this.doStartFunction(t);

	t.addCallback(function () {
		this.disable(false);
		this.agent.eyesFollowPointer();
	}, null, null, this);

	return t;
};

/**
 * This creates a random number of balloons to begin with.
 * @param {number} min - Minimum value of random.
 * @param {number} max - Maximum value of random.
 */
BalloonGame.prototype.startWithBalloons = function (min, max) {
	this.addToNumber = this.rnd.integerInRange(min, max);
	this.atValue = this.addToNumber;
	this.resetBalloons(this.addToNumber);
};

BalloonGame.prototype.startStop = function () {
	// Do nothing.
};

BalloonGame.prototype.startBelow = function (t) {
	t.addCallback(this.startWithBalloons, null, [0, this.currentNumber - 1], this);
};

BalloonGame.prototype.startAbove = function (t) {
	t.addCallback(this.startWithBalloons, null, [this.currentNumber + 1, this.amount], this);
};

BalloonGame.prototype.startThink = function (t) {
	t.addCallback(this.startWithBalloons, null, [0, this.amount], this);
};

/**
 * When you press the anchor this happens.
 * @param {number} amount - The amount of balloons to try with.
 *                          NOTE: this.addToNumber is added to the amount (used in some methods).
 */
BalloonGame.prototype.runNumber = function (amount) {
	var sum = amount + this.addToNumber;
	this.balloonStack.updateBalloons(this.amount - sum);
	this.bucketBalloons.updateBalloons(sum);
	var result = this.tryNumber(sum);

	var t = new TimelineMax().skippable();
	t.addCallback(function () {
		this.agent.eyesFollowObject(this.beetle);
		this.disable(true);
	}, null, null, this);

	if (this.beetle.x !== 0 && this.beetle.y !== 0) {
		t.add(new TweenMax(this.beetle, 2, { x: 0, y: 0, ease: Power1.easeIn }));
	}

	if (this.actionGroup.y !== this.caves[sum - 1].y) {
		t.add(new TweenMax(this.actionGroup, 2, { y: this.caves[sum - 1].y, ease: Power1.easeInOut }));
	}

	if (!result) { // CORRECT :)
		t.add(this.openChest(sum));
		this.returnToStart(t);

	} else { // INCORRECT :(
		if (result > 0) {
			t.addSound(this.speech, this.beetle, 'tryless');
		} else {
			t.addSound(this.speech, this.beetle, 'trymore');
		}
		this.doReturnFunction(t, sum, result);
	}

	// TODO: Check this out.
	if (this.method === GLOBAL.METHOD.incrementalSteps) {
		if (this.bucketBalloons.sum > 7) {
			fade(this.magnifyGroup, true);
		} else {
			fade(this.magnifyGroup, false);
		}
	}

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
	t.addSound('chestunlock');
	t.addLabel('unlocked');
	t.addCallback(function () { this.chest.frameName = 'chest_open'; }, null, null, this);
	t.add(this.addWater(this.chest.x, this.chest.y), 'unlocked');
	t.add(this.playRandomPrize(), 'unlocked');
	t.addSound(this.speech, this.beetle, 'yippi', 'unlocked');
	t.add(fade(this.chest,false));
	return t;
};

/** A prize popping out of the chest. */
BalloonGame.prototype.playRandomPrize = function () {
	// TODO: Make the different treasures have different amounts of probability to appear.
	this.treasure.frameName = 'treasure' + game.rnd.integerInRange(1, 6);
	this.treasure.x = this.chest.x;
	this.treasure.y = this.chest.y + 10;
	this.treasure.visible = false;

	var t = new TimelineMax();
	t.add(new TweenMax(this.treasure, 1, { y: '-=75', ease: Power1.easeOut }));
	t.add(fade(this.treasure, true), '-=1');
	t.add(new TweenMax(this.treasure, 1, { y: '+=75', ease: Power1.easeIn }));
	t.add(new TweenMax(this.treasure, 2, { x: this.pos.sack.x, y: this.pos.sack.y + 10, ease: Power4.easeIn }));
	t.addLabel('sacking');
	t.addSound('sackjingle', null, null, 'sacking');
	t.add(new TweenMax(this.sack, 0.2, { y: '+=3', ease: Power1.easeInOut }).backForth(2), 'sacking');
	return t;
};

/** Pop the balloons and go back down. */
BalloonGame.prototype.popAndReturn = function (t) {
	t.add(fade(this.magnifyGroup, false));
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
		t.addCallback(this.resetBalloons, null, [this.atValue], this);
		// TODO: Say something
	} else {
		this.returnNone(t, number);
	}
};

BalloonGame.prototype.returnToPreviousIfLower = function (t, number, diff) {
	if (diff < 0) {
		this.popAndReturn(t);
		t.addCallback(this.resetBalloons, null, [this.atValue], this);
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
	if (this.map) {
		this.map.target.number = this.currentNumber;
		t.addLabel('mapping');
		t.addSound(this.speech, this.beetle, 'beetleintro3');
		t.add(fade(this.map, true), 'mapping');
		t.add(new TweenMax(this.map, 2, { x: 650, y: 620, ease: Power1.easeIn }));
	} else {
		t.addSound(this.speech, this.beetle, 'beetleintro1');
		t.addSound(this.speech, this.beetle, 'beetleintro2');
	}
	t.addCallback(this.nextRound, null, null, this);
};

BalloonGame.prototype.modePlayerDo = function (intro, tries) {
	var t = new TimelineMax();
	if (tries === 0) { // New round.
		t.add(this.newTreasure());
	}
	t.addCallback(this.showNumbers, null, null, this);
};

BalloonGame.prototype.modePlayerShow = function (intro, tries) {
	var t = new TimelineMax();
	if (tries === 0) { // New round.
		if (intro) {
			t.skippable();
			if(this.method === GLOBAL.METHOD.incrementalSteps) {
				t.add(this.popAndReturn());
			}
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			t.addSound(this.speech, this.agent, 'agentintro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
		}
		t.add(this.newTreasure());
	}
	t.addCallback(this.showNumbers, null, null, this);
};

BalloonGame.prototype.modeAgentTry = function (intro, tries) {
	this.disableBalloons(true);
	var t = new TimelineMax();
	if (tries > 0) {
		t.addSound(this.speech, this.agent, 'oops');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			if(this.method === GLOBAL.METHOD.incrementalSteps) {
				t.add(this.popAndReturn());
			}
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			t.addSound(this.speech, this.agent, 'agenttry');
		}
		t.add(this.newTreasure());
	}
	t.add(this.agentGuess());
	t.addCallback(this.showYesnos, null, null, this);
};

BalloonGame.prototype.modeOutro = function () {
	this.disable(true);
	this.agent.fistPump()
		.addCallback(this.nextRound, null, null, this);
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