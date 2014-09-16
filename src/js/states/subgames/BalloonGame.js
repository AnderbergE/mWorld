/* Balloon Game */
BalloonGame.prototype = Object.create(NumberGame.prototype);
BalloonGame.prototype.constructor = BalloonGame;
function BalloonGame () {
	NumberGame.call(this); // Call parent constructor.
}

BalloonGame.prototype.pos = {
	beetle: {
		start: { x: 10, y: 260 },
		stop: { x: -140, y: -40 },
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
	this.cloud1 = this.gameGroup.create(-200, 25, 'cloud1');
	this.cloud2 = this.gameGroup.create(200, 200, 'cloud2');
	this.gameGroup.create(0, 0, 'balloon', 'bg');

	// The interactable bush.
	// TODO: Create better synced graphics.
	var catBush = this.gameGroup.create(175, 420, 'balloon', 'catbush1');
	catBush.purr = this.add.audio('catbushpurr');
	catBush.animations.add('catBlink', ['catbush2', 'catbush3', 'catbush4', 'catbush5', 'catbush6', 'catbush7', 'catbush8', 'catbush9', 'catbush10', 'catbush1']);
	catBush.events.onAnimationComplete.add(function(){
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
			(i % 2 ? this.pos.cave.left : this.pos.cave.right),
			this.pos.cave.y - i * heightPerCave,
			'balloon', 'cave'
		));
	}

	this.chest = this.gameGroup.create(0, 0, 'balloon', 'chest_closed');
	this.chest.anchor.setTo(0.5, 1);
	this.chest.visible = false;

	this.treasure = this.gameGroup.create(0, 0, 'balloon', 'treasure1');
	this.treasure.anchor.setTo(0.5, 1);
	this.treasure.visible = false;

	this.sack = this.gameGroup.create(this.pos.sack.x, this.pos.sack.y, 'balloon', 'sack');
	this.sack.anchor.setTo(0.5, 0.5);

	// Make sure the agent is on top
	this.gameGroup.bringToTop(this.agent);
	this.agent.thought.guess.setDirection(true);
	this.agent.thought.toScale = 3;
	this.agent.thought.x += 100;
	this.agent.thought.y -= 140;
	if (this.representation[0] === GLOBAL.NUMBER_REPRESENTATION.none) {
		this.agent.thought.guess.spriteKey = 'balloon';
		this.agent.thought.guess.spriteFrame = 'b';
		this.agent.thought.guess.representations = GLOBAL.NUMBER_REPRESENTATION.sprite;
	}

	// The stack to grab balloons from
	this.gameGroup.create(this.pos.balloons.x, this.pos.balloons.y, 'balloon', 'metalloop').anchor.set(0.5);
	this.balloonStack = new BalloonGameStack(this.pos.balloons.x, this.pos.balloons.y, this.amount);
	makeDraggable(this.balloonStack);
	this.gameGroup.add(this.balloonStack);
	this.direction = 0.3; // TODO: USE TWEEN For animating the wind in the balloons. 

	// The group where the bucket, beetle and right side balloons go into. Is animated on.
	this.actionGroup = this.add.group(this.gameGroup);
	this.actionGroup.x = this.pos.bucket.x;
	this.actionGroup.y = this.pos.bucket.y;

	this.beetle = this.actionGroup.create(this.pos.beetle.start.x, this.pos.beetle.start.y, 'balloon', 'beetle');
	this.beetle.scale.set(this.pos.beetle.scale);

	this.actionGroup.create(0, 15, 'balloon', 'bucket');
	this.bucketBalloons = new BalloonGameStack(35, 20, 0);
	makeDraggable(this.bucketBalloons);
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

	if (this.representation[0] === GLOBAL.NUMBER_REPRESENTATION.none) {
		// Special case when we have no representation.
		this.eyes = this.gameGroup.create(0, 0, 'balloon', 'eyes');
		this.eyes.visible = false;
	} else {
		this.map = this.add.group(this.gameGroup);
		this.map.x = this.pos.beetle.stop.x+70;
		this.map.y = this.pos.beetle.stop.y+60;
		this.map.visible = false;
		this.map.create(0, 0, 'balloon', 'map'); // Background for map
		this.map.target = new NumberButton(this.correctAnswer, this.representation, { // Representation on map
			x: 30, y: 30, size: 70, background: null, disabled: true
		});
		this.map.add(this.map.target);
	}


	var _this = this;

	// The button to push when done with the balloons.
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
	this.gameGroup.add(this.liftoffButton);

	function makeDraggable (stack) {
		stack.balloons.inputEnabled = true;
		stack.balloons.events.onInputDown.add(function () {
			if (this.amount > 0) {
				this.updateBalloons(this.amount - 1);

				var b = _this.gameGroup.create(0, 0, 'balloon', 'b1');
				b.anchor.set(0.5, 1);
				b.update = function () {
					this.x = game.input.activePointer.x;
					this.y = game.input.activePointer.y;
				};

				var f = function () {
					this.balloons.events.onInputUp.remove(f, this);
					b.update = function () {};
					stopDrag(b);
				};
				this.balloons.events.onInputUp.add(f, this);
			}
		}, stack);
	}

	// When you let go of a balloon.
	function stopDrag (balloon) {
		var t = new TimelineMax();
		// Check for ovelap with bucket balloons.
		if (Phaser.Rectangle.intersects(balloon.getBounds(), _this.actionGroup.getBounds())) {
			_this.bucketBalloons.pending++;
			t.to(balloon, 0.5, { x: _this.actionGroup.x + _this.bucketBalloons.x, y: _this.actionGroup.y + _this.bucketBalloons.y });
			t.addCallback(function () {
				_this.bucketBalloons.pending--;
				_this.bucketBalloons.updateBalloons(_this.bucketBalloons.amount + 1);
			});
		} else {
			t.to(balloon, 1, _this.pos.balloons);
			t.addCallback(function () {
				_this.balloonStack.updateBalloons(_this.balloonStack.amount + 1);
			});
		}
		t.addCallback(balloon.destroy, null, null, balloon);
	}


	// Make sure the call this when everything is set up.
	this.startGame();
};

// Makes it so we can't click the balloons.
BalloonGame.prototype.disableBalloons = function (value) {
	this.balloonStack.balloons.inputEnabled = !value;
	this.bucketBalloons.balloons.inputEnabled = !value;
	this.liftoffButton.disabled = value;
};

// TODO: showYesnos should not show liftoffbutton

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

// This creates a new treasure to search for.
BalloonGame.prototype.newTreasure = function () {
	var t = new TimelineMax().skippable();
	if (this.eyes) {
		this.eyes.x = this.caves[this.currentNumber - 1].x + 40;
		this.eyes.y = this.caves[this.currentNumber - 1].y + 55;
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

BeeFlightGame.prototype.startStop = function () {
	// Do nothing.
};

BeeFlightGame.prototype.startBelow = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(0, this.currentNumber - 1);
		this.balloonStack.updateBalloons(this.amount - this.addToNumber);
		this.bucketBalloons.updateBalloons(this.addToNumber);
	}, null, null, this);
};

BeeFlightGame.prototype.startAbove = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(this.currentNumber + 1, this.amount);
		this.balloonStack.updateBalloons(this.amount - this.addToNumber);
		this.bucketBalloons.updateBalloons(this.addToNumber);
	}, null, null, this);
};

BeeFlightGame.prototype.startThink = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(1, this.amount);
		// this.bee.thought.guess.number = this.addToNumber;
	}, null, null, this);
	// t.add(this.bee.think());
};

// When you press the anchor this happens.
BalloonGame.prototype.runNumber = function (amount) {
	this.balloonStack.updateBalloons(this.amount - amount);
	this.bucketBalloons.updateBalloons(amount);

	var result = this.tryNumber(amount);

	var t = new TimelineMax().skippable();
	t.addCallback(function () {
		this.agent.eyesFollowObject(this.beetle);
		this.disable(true);
	}, null, null, this);

	if (this.beetle.x !== 0 && this.beetle.y !== 0) {
		t.add(new TweenMax(this.beetle, 2, { x: 0, y: 0, ease: Power1.easeIn }));
	}

	t.add(new TweenMax(this.actionGroup, 2, { y: this.caves[amount - 1].y, ease: Power1.easeInOut }));

	if (!result) { // If we guessed correctly
		t.add(this.openChest(amount));

	} else { // If we guessed wrong
		if (result > 0) {
			t.addSound(this.speech, this.beetle, 'tryless');
		} else {
			t.addSound(this.speech, this.beetle, 'trymore');
		}
	}

	// Popping balloons and going back down.
	if(this.method !== GLOBAL.METHOD.incrementalSteps) {
		t.add(this.popAndReturn());
	} else if (this.bucketBalloons.amount > 7) {
		fade(this.magnifyGroup, true);
	} else {
		fade(this.magnifyGroup, false);
	}

	return t;
};

// The animation and sound of the chest opening.
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

// The prize popping out.
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

// Makes the beetle jump up and pop the balloons, causing them all to fall down to the ground.
BalloonGame.prototype.popAndReturn = function () {
	var t = new TimelineMax();
	t.to(this.beetle, 0.5, { y: '-=50', ease: Power4.easeIn });
	t.addCallback(function () {
		this.bucketBalloons.popBalloons(); // Will set amount to 0.
		this.balloonStack.updateBalloons(this.amount); // TODO: Maybe a nice "blow up" animation?
	}, null, null, this);
	t.addSound('pop');
	t.to(this.beetle, 0.5, { y: '+=50', ease: Power4.easeIn });
	t.addCallback(this.bucketBalloons.updateBalloons, null, null, this.bucketBalloons);
	t.to(this.actionGroup, 2, { y: this.pos.bucket.y, ease: Bounce.easeOut });
	t.add(fade(this.magnifyGroup, false), 0);
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
BalloonGame.prototype.modeIntro = function () {
	var t = new TimelineMax().skippable();
	t.add( new TweenMax(this.beetle, 3, { x: this.pos.beetle.stop.x, y: this.pos.beetle.stop.y, ease: Power1.easeIn }));
	if (this.map) {
		t.addLabel('mapping');
		t.addSound(this.speech, this.beetle, 'beetleintro3');
		t.add(fade(this.map, true), 'mapping');
		t.add(new TweenMax(this.map, 2, { x: 650, y: 620, ease: Power1.easeIn }));
	} else {
		t.addSound(this.speech, this.beetle, 'beetleintro1');
		t.addSound(this.speech, this.beetle, 'beetleintro2');
	}
	t.addCallback(function () {
		this.nextRound();
	}, null, null, this);
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


//Makes the left stack sway with the wind and the clouds move forward in the background.
BalloonGame.prototype.update = function () {
	/*
	if (this.balloonStack.balloons.angle > 7) {
		this.direction = -0.3;
	} else if (this.balloonStack.balloons.angle < -7) {
		this.direction = 0.3;
	}
	this.balloonStack.balloons.angle += this.direction;
	*/

	if (this.cloud1.x > 600) {
		this.cloud1.x = -this.cloud1.width;
	} else {
		this.cloud1.x += 0.3;
	}

	if (this.cloud2.x > 600) {
		this.cloud2.x = -this.cloud2.width;
	} else {
		this.cloud2.x += 0.5;
	}
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