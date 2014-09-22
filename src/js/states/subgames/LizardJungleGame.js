/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                           Lizard Jungle game
/* Methods:         All
/* Representations: All, except "none".
/* Range:           1--4, 1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype = Object.create(NumberGame.prototype);
LizardJungleGame.prototype.constructor = LizardJungleGame;
function LizardJungleGame () {
	NumberGame.call(this); // Call parent constructor.
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

LizardJungleGame.prototype.buttonColor = 0xb07010;

LizardJungleGame.prototype.tintBank = [
	0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x1122ff, 0x222222, 0xaf9ee3
];


/* Phaser state function */
LizardJungleGame.prototype.preload = function () {
	this.load.audio('lizardPlaceholder', LANG.SPEECH.AGENT.hmm);

	this.load.atlasJSONHash('lizard', 'assets/img/subgames/lizardjungle/atlas.png', 'assets/img/subgames/lizardjungle/atlas.json');
};

/* Phaser state function */
LizardJungleGame.prototype.create = function () {
	// Setup additional game objects on top of NumberGame.init
	this.setupButtons({
		buttons: {
			x: this.world.width - (this.representation.length*75) - 25,
			y: this.pos.tree.y - 30,
			vertical: true,
			size: this.pos.tree.height,
			reversed: true
		},
		yesnos: {
			x: this.world.width - 100,
			vertical: true,
			color: 0xd6c068
		}
	});
	this.agent.thought.guess.setDirection(true);

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
		this.tree.x,
		this.tree.y - (this.tree.children[0].height*this.tree.scale.y)/2,
		'lizard', 'crown', this.gameGroup);
	crown.anchor.set(0.5, 0.6);

	// The target is set up in the newFood function
	this.target = this.add.sprite(0, 0, 'lizard', 'ant', this.gameGroup);
	this.target.anchor.set(0.5);
	this.target.visible = false;

	// Setup lizard
	this.lizard = new LizardJungleLizard(575, 500);
	if (this.method === GLOBAL.METHOD.additionSubtraction) {
		this.lizard.addThought(-100, -75, this.representation[0]);
		this.lizard.thought.guess.setDirection(true);
	}
	this.gameGroup.add(this.lizard);


	// Everything is set up! Blast off!
	this.startGame();
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
	var start = this.tree.children[this.tree.length - 1].world;
	var offset = 150;
	var arrow = this.add.sprite(start.x + offset, start.y, 'objects', 'arrow', this.gameGroup);
	arrow.tint = 0xf0f000;
	arrow.anchor.set(0, 0.5);
	arrow.visible = false;

	var t = new TimelineMax();
	t.addCallback(function () { arrow.visible = true; });
	t.addCallback(function () {}, '+=0.5');
	for (var i = 0; i < number; i++) {
		var pos = this.getTargetPos(1 + i);
		if (i !== 0) { t.add(new TweenMax(arrow, 0.6, { x: '+=' + offset, y: pos.y })); }
		t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
	}
	t.addCallback(function () { arrow.destroy(); }, '+=0.5');
	return t;
};

LizardJungleGame.prototype.getTargetPos = function (number) {
	return this.tree.children[this.tree.length - number].world;
};


LizardJungleGame.prototype.newFood = function (silent) {
	this.target.x = this.tree.x;
	this.target.y = this.world.height + this.target.height;
	this.target.tint = this.rnd.pick(this.tintBank);

	var t = new TimelineMax();
	t.addCallback(function () { this.target.visible = true; }, null, null, this);
	t.add(new TweenMax(this.target, 1, { y: this.getTargetPos(1).y }));
	for (var i = 1; i < this.currentNumber; i++) {
		t.add(new TweenMax(this.target, 0.8, { y: this.getTargetPos(1 + i).y }));
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
	}, null, null, this);
	t.add(this.lizard.think());
};

LizardJungleGame.prototype.runNumber = function (number, simulate) {
	var sum = number + this.addToNumber;
	var result = simulate ? sum - this.currentNumber : this.tryNumber(number, this.addToNumber);

	this.disable(true);
	this.agent.eyesFollowObject(this.target);
	this.lizard.followPointer(false);
	if (this.lizard.thought) {
		this.lizard.thought.visible = false;
	}

	var t = new TimelineMax();

	/* Correct :) */
	if (!result) {
		t.add(this.lizard.shootObject(this.target));
		t.addLabel('afterShot');
		t.addCallback(function () {
			this.hideButtons();
			this.target.visible = false;
			this.agent.setHappy();
		}, null, null, this);
		t.addSound('lizardPlaceholder', this.lizard); // nom nom
		t.add(this.addWater(this.lizard.tounge.world.x, this.lizard.tounge.world.y), 'afterShot');
		t.add(tweenTint(this.lizard, this.target.tint), 'afterShot');
		this.atValue = 0;

	/* Incorrect :( */
	} else {
		t.addCallback(this.agent.setSad, null, null, this.agent);
		t.add(this.doReturnFunction(sum, result));
	}

	t.addCallback(this.agent.setNeutral, null, null, this.agent);
	t.addCallback(this.updateRelative, null, null, this);
	return t;
};

LizardJungleGame.prototype.returnToStart = function (number) {
	this.atValue = 0;
	return this.lizard.shoot(this.getTargetPos(number));
};

LizardJungleGame.prototype.returnNone = function (number) {
	this.atValue = number;
	return this.lizard.shoot(this.getTargetPos(number), true);
};

LizardJungleGame.prototype.returnToPreviousIfHigher = function (number, diff) {
	if (diff > 0) {
		var t = new TimelineMax();
		t.add(this.lizard.shootMiss(
			this.getTargetPos(number),
			this.getTargetPos(this.atValue)));
		t.addSound('lizardPlaceholder'); // That was too high.
		return t;
	} else {
		return this.returnNone(number);
	}
};

LizardJungleGame.prototype.returnToPreviousIfLower = function (number, diff) {
	if (diff < 0) {
		var t = new TimelineMax();
		t.add(this.lizard.shootMiss(
			this.getTargetPos(number),
			this.getTargetPos(this.atValue)));
		t.addSound('lizardPlaceholder'); // That was too low.
		return t;
	} else {
		return this.returnNone(number);
	}
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
			t.add(this.lizard.shoot(this.getTargetPos(this.currentNumber - 1)));
			t.addSound('lizardPlaceholder', this.lizard); // miss
		}
		if (this.currentNumber < this.amount) {
			t.add(this.lizard.shoot(this.getTargetPos(this.currentNumber + 1)));
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
	this.agent.eyesStopFollow();

	var t = new TimelineMax();
		// TODO: Add more specified sounds?
		// t.addSound(this.speech, this.agent, 'agentTryAgain');
	if (tries <= 0) { // if intro or first try
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

	this.body = game.add.sprite(48, 0, 'lizard', 'body', this);
	this.head = game.add.group(this);
	this.head.x = 130;
	this.head.y = 60;

	this.tounge = game.add.sprite(-5, 17, 'lizard', 'tounge', this.head);
	this.tounge.anchor.set(1, 0.5);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.jaw = game.add.sprite(20, 23, 'lizard', 'jaw', this.head);
	this.jaw.anchor.set(1, 0.4);
	this.forehead = game.add.sprite(125, 35, 'lizard', 'head', this.head);
	this.forehead.anchor.set(1, 1);
	this.tint = 0x00aa00;

	this.origin = {
		x: this.x + this.head.x + this.tounge.x,
		y: this.y + this.head.y + this.tounge.y
	};
	this.stuck = false;

	this.talk = new TimelineMax({ repeat: -1, yoyo: true, paused: true });
	this.talk.to(this.jaw, 0.2, { angle: -6 });
	this.talk.to(this.forehead, 0.2, { angle: 2 }, 0);

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

LizardJungleLizard.prototype.startShoot = function (hit) {
	var t = new TimelineMax();
	if (this.stuck) {
		t.add(this.shootReturn());
	}
	t.to(this.head, 0.2, { rotation: game.physics.arcade.angleBetween(hit, this.origin) });
	t.to(this.forehead, 0.5, { angle: 7 });
	t.to(this.jaw, 0.5, { angle: -4 }, '-=0.5');
	return t;
};

LizardJungleLizard.prototype.shoot = function (hit, stuck) {
	var t = this.startShoot(hit);
	t.to(this.tounge, 0.75, {
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

LizardJungleLizard.prototype.shootMiss = function (aim, hit) {
	var t = this.startShoot(aim);
	t.to(this.tounge, 1, {
		width: game.physics.arcade.distanceBetween(aim, this.tounge.world)*1.4,
		height: 18
	});

	t.to(this.head, 1.4, { rotation: game.physics.arcade.angleBetween(hit, this.origin) }, '-=0.4');
	t.to(this.tounge, 1, { width: game.physics.arcade.distanceBetween(hit, this.tounge.world), }, '-=1');

	t.addCallback(function () { this.stuck = true; }, null, null, this);
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