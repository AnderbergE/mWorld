/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Lizard Jungle game                              */
/* Representations: All
/* Range:           1--4
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype = Object.create(NumberPanelSubgame.prototype);
LizardJungleGame.prototype.constructor = LizardJungleGame;
function LizardJungleGame () {
	NumberPanelSubgame.call(this); // Call parent constructor.
}

/* Position coordinates for the game */
LizardJungleGame.prototype.pos = {
	tree: {
		x: 200, y: 220, height: 550, offset: -10
	},
	agent: {
		start: { x: 1300, y: 500 },
		stop: { x: 700, y: 400 },
		scale: 0.35
	}
};

LizardJungleGame.prototype.tintBank = [
	0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00,
	0x0000ff, 0x555555, 0x3333cc, 0x33cc33
];


/* Phaser state function */
LizardJungleGame.prototype.preload = function () {
	this.load.audio('lizardPlaceholder', LANG.SPEECH.AGENT.hmm);

	this.load.atlasJSONHash('lizard', 'assets/img/subgames/lizardjungle/atlas.png', 'assets/img/subgames/lizardjungle/atlas.json');
	this.load.image('lizardBody',    'assets/img/subgames/lizardjungle/body.png');
	this.load.image('lizardHead',    'assets/img/subgames/lizardjungle/head.png');
	this.load.image('lizardJaw',     'assets/img/subgames/lizardjungle/jaw.png');
	this.load.image('lizardTounge',  'assets/img/subgames/lizardjungle/tounge.png');
	this.load.image('lizardArrow',   'assets/img/objects/arrow.png');
};

/* Phaser state function */
LizardJungleGame.prototype.create = function () {
	NumberPanelSubgame.prototype.create.call(this);

	// This is used to know where the tounge is.
	this.atValue = 0;

	// Add main game
	this.add.sprite(0, 0, 'lizard', 'bg', this.gameGroup);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	this.tree = this.add.group(this.gameGroup);
	this.tree.x = this.pos.tree.x;
	this.tree.y = this.pos.tree.y;
	this.add.sprite(0, 0, 'lizard', 'bole', this.tree).anchor.set(0.5);
	for (var i = this.amount - 2; i >= 0; i--) {
		this.add.sprite(0, this.tree.height + this.pos.tree.offset, 'lizard', 'bole', this.tree).anchor.set(0.5);
	}
	this.tree.scale.set(this.pos.tree.height/this.tree.height);
	var crown = this.add.sprite(
		this.tree.x - (this.tree.children[0].width * this.tree.scale.x) * 0.3,
		this.tree.y - (this.tree.children[0].height * this.tree.scale.y) * 0.7,
		'lizard', 'crown', this.gameGroup);
	crown.scale.set(4/this.tree.length);
	crown.anchor.set(0.5);

	// The target is set up in the newFood function
	this.target = this.add.sprite(0, 0, 'lizard', 'ant', this.gameGroup);
	this.target.anchor.set(0.5);
	this.target.visible = false;

	// Setup lizard
	this.lizard = new LizardJungleLizard(575, 500);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.lizard.addThought(-100, -75, this.representation[0]);
	}
	this.gameGroup.add(this.lizard);


	// Add Timeline/Tween functions
	var _this = this; // Subscriptions do not have access to 'this' object
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

LizardJungleGame.prototype.getOptions = function () {
	return {
		buttons: {
			x: this.world.width - (this.representation.length*75) - 25,
			y: this.pos.tree.y - 30,
			vertical: true,
			size: this.pos.tree.height,
			reversed: true
		},
		yesnos: {
			x: this.world.width - 100,
			vertical: true
		}
	};
};

LizardJungleGame.prototype.instructionIntro = function () {
	var t = new TimelineMax();
	//t.addSound(speech, bird, 'instruction1a'); // Help by counting
	t.add(this.pointAtBole(this.currentNumber));
	t.add(fade(this.buttons, true));
	t.addLabel('highlight');
	//t.addSound(speech, bird, 'instruction1b'); // Choose button
	t.add(this.buttons.highlight(1), 'highlight');
	return t;
};

LizardJungleGame.prototype.pointAtBole = function (number) {
	var first = this.tree.children[this.tree.length - 1];
	var start = first.world;
	var offset = 70;
	var arrow = this.add.sprite(start.x + offset, start.y, 'lizardArrow', null, this.gameGroup);
	arrow.anchor.set(0, 0.5);
	arrow.visible = false;

	var t = new TimelineMax();
	t.addCallback(function () { arrow.visible = true; });
	for (var i = 0; i < number; i++) {
		var pos = this.tree.children[this.tree.length - 1 - i].world;
		if (i !== 0) { t.add(new TweenMax(arrow, 1, { x: '+=' + offset, y: pos.y })); }
		t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
	}
	t.addCallback(function () { arrow.destroy(); }, '+=0.5');
	return t;
};


LizardJungleGame.prototype.newFood = function (silent) {
	this.target.x = this.tree.x;
	this.target.y = this.world.height + this.target.height;
	this.target.tint = this.rnd.pick(this.tintBank);

	var t = new TimelineMax();
	t.addCallback(function () { this.target.visible = true; }, null, null, this);
	t.add(new TweenMax(this.target, 1, { y: this.tree.children[this.tree.length - 1].world.y }));
	for (var i = 1; i < this.currentNumber; i++) {
		t.add(new TweenMax(this.target, 0.8, { y: this.tree.children[this.tree.length - 1 - i].world.y }));
	}
	
	if (!silent) {
		this.doStartFunction(t);
	}

	return t;
};

LizardJungleGame.prototype.startStop = function () {
	// Do nothing
};

LizardJungleGame.prototype.startBelow = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(1, this.currentNumber - 1), true));
};

LizardJungleGame.prototype.startAbove = function (t) {
	t.add(this.runNumber(this.rnd.integerInRange(this.currentNumber + 1, this.amount), true));
};

LizardJungleGame.prototype.startThink = function (t) {
	t.addCallback(function () {
		this.addToNumber = this.rnd.integerInRange(1, this.amount);
		this.lizard.thought.guess.number = this.addToNumber;
		this.updateButtons();
	}, null, null, this);
	t.add(this.lizard.think());
};

LizardJungleGame.prototype.runNumber = function (number, simulate) {
	this.disable(true);
	this.lizard.followPointer(false);
	this.agent.eyesFollowObject(this.lizard.tounge.world);
	if (this.lizard.thought) {
		this.lizard.thought.visible = false;
	}

	var result = simulate ? number - this.currentNumber : this.tryNumber(number);

	var t = new TimelineMax();
	if (!result) { // Correct :)
		t.add(this.lizard.shootObject(this.target));
		t.addLabel('afterShot');
		t.addCallback(function () { this.target.visible = false; }, null, null, this);
		t.addCallback(this.hideButtons, null, null, this);
		t.addSound('lizardPlaceholder', this.lizard); // nom nom
		t.add(tweenTint(this.lizard, this.target.tint), 'afterShot');
		this.atValue = 0;
	} else { // Incorrect :(
		t.add(this.doReturnFunction(number, result));
	}

	if (this.isRelative) {
		t.addCallback(function () {
			this.addToNumber = parseInt(this.atValue);
			this.updateButtons();
		}, null, null, this);
	}

	return t;
};

LizardJungleGame.prototype.returnToStart = function (number) {
	this.atValue = 0;
	return this.lizard.shoot(this.tree.children[this.tree.length - number].world);
};

LizardJungleGame.prototype.returnNone = function (number) {
	this.atValue = number;
	return this.lizard.shoot(this.tree.children[this.tree.length - number].world, true);
};

LizardJungleGame.prototype.returnToPreviousIfHigher = function (number, diff) {
	var t = new TimelineMax();
	if (diff > 0) {
		t.addSound('lizardPlaceholder'); // I think that is too high. Mouth is open, no animation.
	} else {
		t.add(this.returnNone(number));
	}
	return t;
};

LizardJungleGame.prototype.returnToPreviousIfLower = function (number, diff) {
	var t = new TimelineMax();
	if (diff < 0) {
		t.addSound('lizardPlaceholder'); // I think that is too low. Mouth is open, no animation.
	} else {
		t.add(this.returnNone(number));
	}
	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.modeIntro = function () {
	// A slight wait is needed for the game world to set up, so sleep for a second.
	var st = new TimelineMax();
	st.addSound('lizardPlaceholder'); //snoring
	st.add(this.lizard.sleeping(2), 0);
	st.addCallback(function () {
		// Now we can use .world properties.
		var t = new TimelineMax();
		t.skippable();
		t.addSound('lizardPlaceholder', this.lizard); // slept
		t.add(this.newFood(true));
		t.addSound('lizardPlaceholder', this.lizard); // ant
		if (this.currentNumber > 1) {
			t.add(this.lizard.shoot(this.tree.children[this.tree.length + 1 - this.currentNumber].world));
			t.addSound('lizardPlaceholder', this.lizard); // miss
		}
		if (this.currentNumber < this.amount) {
			t.add(this.lizard.shoot(this.tree.children[this.tree.length - 1 - this.currentNumber].world));
			t.addSound('lizardPlaceholder', this.lizard); // miss
		}
		t.addCallback(this.nextRound, null, null, this);
	}, null, null, this);
};

LizardJungleGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.lizard.followPointer(true);
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			if (!this.target.visible) {
				// This is just in case the intro does not play.
				t.add(this.newFood());
			}
			t.add(this.instructionIntro());
			this.doStartFunction(t);
		} else {
			t.add(this.newFood());
		}
		t.addCallback(function () {
			this.showNumbers();
			this.lizard.followPointer(true);
		}, null, null, this);
	}
};

LizardJungleGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
		this.lizard.followPointer(true);
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			// t.addSound(this.speech, this.agent, 'agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
			t.addSound('lizardPlaceholder', this.lizard); // helping to shoot
			// t.addSound(this.speech, this.agent, 'agentIntro');
		}
		t.add(this.newFood());
		t.addCallback(function () {
			this.showNumbers();
			this.lizard.followPointer(true);
		}, null, null, this);
	}
};

LizardJungleGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		this.agent.eyesStopFollow();
		// TODO: Add more specified sounds?
		// t.addSound(this.speech, this.agent, 'agentTryAgain');
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			// t.addSound(this.speech, this.agent, 'agentTry');
		}
		t.add(this.newFood());
	}

	t.add(this.agentGuess());
	t.addCallback(function () {
		this.showYesnos();
		this.lizard.followPointer(true);
	}, null, null, this);
};

LizardJungleGame.prototype.modeOutro = function () {
	this.agent.thought.visible = false;
	this.agent.eyesStopFollow();
	this.agent.setHappy();
	var t = new TimelineMax();
	t.addSound('lizardPlaceholder', this.lizard); // finished
	t.add(this.agent.fistPump(), 0);
	t.addCallback(this.nextRound, null, null, this);
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        Lizard Jungle game objects                         */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* Camilla Chameleon, the lizard that you are helping. */
LizardJungleLizard.prototype = Object.create(Character.prototype);
LizardJungleLizard.prototype.constructor = LizardJungleLizard;
function LizardJungleLizard (x, y) {
	Character.call(this); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;

	this.body = game.add.sprite(48, 0, 'lizardBody', null, this);
	this.head = game.add.group(this);
	this.head.x = 110;
	this.head.y = 75;

	this.tounge = game.add.sprite(-5, 17, 'lizardTounge', null, this.head);
	this.tounge.anchor.set(1, 0.5);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.forehead = game.add.sprite(17, 29, 'lizardHead', null, this.head);
	this.forehead.anchor.set(1, 1);
	this.jaw = game.add.sprite(0, 18, 'lizardJaw', null, this.head);
	this.jaw.anchor.set(1, 0);

	this.stuck = false;

	this.talk = new TimelineMax({ repeat: -1, yoyo: true, paused: true });
	this.talk.to(this.jaw, 0.2, { angle: -2 });
	this.talk.to(this.forehead, 0.2, { angle: 4 }, 0);

	this.snore = game.add.text(this.head.x, this.head.y - 100, 'zzz', {
		font: '40pt ' +  GLOBAL.FONT,
		fill: '#ffffff'
	}, this);
	this.snore.alpha = 0; // Maybe this should be visible = false, but whatever.
}
Object.defineProperty(LizardJungleLizard.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) {
		this.body.tint = value;
		this.forehead.tint = value;
		this.jaw.tint = value;
	}
});

LizardJungleLizard.prototype.sleeping = function (duration) {
	duration = duration || 3;

	var t = new TimelineMax({ repeat: TweenMax.prototype.calcYoyo(duration, 1.5) });
	t.add(TweenMax.fromTo(this.snore, 0.8, { alpha: 0 }, { x: '+=25', y: '-=25', alpha: 1 }));
	t.add(TweenMax.to(this.snore, 0.7, { x: '+=25', y: '-=25', alpha: 0, ease: Power1.easeIn }));
	return t;
};

LizardJungleLizard.prototype.followPointer = function (on) {
	if (on && !this.stuck) {
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

LizardJungleLizard.prototype.shoot = function (hit, stuck) {
	var headOrigin = { x: this.x + this.head.x, y: this.y + this.head.y };
	var t = new TimelineMax();
	if (this.stuck) {
		t.add(this.shootReturn());
	}
	t.to(this.head, 0.2, { rotation: game.physics.arcade.angleBetween(hit, headOrigin) });
	t.to(this.forehead, 0.5, { angle: 10 });
	t.to(this.jaw, 0.5, { angle: -5 }, '-=0.5');
	t.to(this.tounge, 0.5, {
		width: game.physics.arcade.distanceBetween(hit, this.tounge.world),
		height: 18
	});
	t.addLabel('stretched');
	t.addCallback(function () { this.stuck = true; }, null, null, this);
	if (!stuck) {
		t.add(this.shootReturn());
	}
	return t;
};

LizardJungleLizard.prototype.shootReturn = function () {
	var t = new TimelineMax();
	t.to(this.tounge, 0.5, { width: 1, height: 5 });
	t.to(this.forehead, 0.2, { angle: 0 });
	t.to(this.jaw, 0.2, { angle: 0 }, '-=0.2');
	t.addCallback(function () { this.stuck = false; }, null, null, this);
	return t;
};

LizardJungleLizard.prototype.shootObject = function (obj) {
	var pos = obj.world || obj;
	var t = this.shoot(pos);
	t.add(new TweenMax(obj, 0.5, {
		x: obj.x + (this.tounge.world.x - pos.x),
		y: obj.y + (this.tounge.world.y - pos.y) }), 'stretched');
	return t;
};