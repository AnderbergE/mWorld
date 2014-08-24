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
	var _this = this; // Subscriptions do not have access to 'this' object

	// Add main game
	this.add.sprite(0, 0, 'lizard', 'bg', this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = this.pos.agent.start.x;
	this.agent.y = this.pos.agent.start.y;
	this.agent.scale.set(this.pos.agent.scale);
	this.agent.visible = true;
	this.agent.addThought(this.representation[0]);
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
	this.add.sprite(this.tree.x - 40, this.tree.y + this.tree.height/this.tree.length, 'lizard', 'crown', this.gameGroup).anchor.set(0.5, 1);

	// The target is set up in the newFood function
	this.target = this.add.sprite(0, 0, 'lizard', 'ant', this.gameGroup);
	this.target.anchor.set(0.5);
	this.target.visible = false;

	// Setup lizard
	this.lizard = new LizardJungleLizard(575, 500);
	this.gameGroup.add(this.lizard);


	// Add Timeline/Tween functions
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
	/* Function to trigger when a number button is pushed */
	function pushNumber (number) {
		return _this.lizardShoot(number)
			.addCallback(_this.nextRound, null, null, _this);
	}

	this.buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		x: this.world.width-(this.representation.length*75)-25,
		y: this.tree.y - this.tree.height / this.tree.length / 2,
		vertical: true,
		size: this.tree.height,
		reversed: true,
		onClick: pushNumber
	});
	this.buttons.visible = false;
	this.hudGroup.add(this.buttons);

	this.yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.width-100,
		vertical: true,
		onClick: function (value) {
			if (!value) {
				_this.showNumbers();
			}
			else {
				pushNumber(_this.agent.lastGuess);
			}
		}
	});
	this.yesnos.visible = false;
	this.hudGroup.add(this.yesnos);


	// Everything is set up! Blast off!
	this.startGame();
};


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

LizardJungleGame.prototype.tint = [
	0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00,
	0x0000ff, 0x555555, 0x3333cc, 0x33cc33
];

LizardJungleGame.prototype.instructionIntro = function () {
	var t = new TimelineMax();
	//t.addSound(speech, bird, 'instruction1a');
	t.add(this.pointAtBole(this.currentNumber));
	t.add(fade(this.buttons, true));
	t.add(this.buttons.highlight(1));
	//t.addSound(speech, bird, 'instruction1b');
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

/* Have the agent guess a number */
LizardJungleGame.prototype.agentGuess = function () {
	this.agent.guessNumber(this.currentNumber, 1, this.amount);
	return this.agent.think();
};

/* Show the number panel, hide the yes/no panel and enable input */
LizardJungleGame.prototype.showNumbers = function () {
	this.disable(true);
	this.buttons.reset();
	fade(this.yesnos, false);
	fade(this.buttons, true).eventCallback('onComplete', this.disable, false, this);

	this.lizard.followPointer(true);
	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Show the yes/no panel, hide the number panel and enable input */
LizardJungleGame.prototype.showYesnos = function () {
	this.disable(true);
	this.yesnos.reset();
	fade(this.buttons, false);
	fade(this.yesnos, true).eventCallback('onComplete', this.disable, false, this);

	this.lizard.followPointer(true);
	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Hide the number and yes/no panel */
LizardJungleGame.prototype.hideButtons = function () {
	this.disable(true);
	fade(this.buttons, false);
	fade(this.yesnos, false);

	if (this.agent.visible) { this.agent.eyesStopFollow(); }
};

LizardJungleGame.prototype.newFood = function () {
	this.target.x = this.tree.x;
	this.target.y = this.world.height + this.target.height;
	this.target.tint = this.tint[this.currentNumber];

	var t = new TimelineMax();
	t.addCallback(function () { this.target.visible = true; }, null, null, this);
	t.add(new TweenMax(this.target, 1, { y: this.tree.children[this.tree.length - 1].world.y }));
	for (var i = 1; i < this.currentNumber; i++) {
		t.add(new TweenMax(this.target, 0.8, { y: this.tree.children[this.tree.length - 1 - i].world.y }));
	}
	return t;
};

LizardJungleGame.prototype.lizardShoot = function (number) {
	this.disable(true);
	this.lizard.followPointer(false);
	this.agent.eyesFollowObject(this.lizard.tounge.world);

	var result = this.tryNumber(number);
	var treePiece = this.tree.children[this.tree.length - number].world;
	var hit = { x: treePiece.x, y: treePiece.y };

	var t = new TimelineMax();
	if (!result) { // Correct :)
		t.addCallback(function () { this.hideButtons(); }, null, null, this);
		t.add(this.lizard.shootObject(this.target));
		t.addCallback(function () { this.target.visible = false; }, null, null, this);
		t.add(TweenMax.to(this.lizard, 1, { tint: this.target.tint }));
	} else { // Incorrect :(
		t.add(this.lizard.shoot(hit));
	}

	return t;
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                 Overshadowing Subgame mode functions                      */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
LizardJungleGame.prototype.modeIntro = function () {
	// Most of the intro is in modePlayerDo. But we need a slight wait
	// so that the game world can set up.
	var t = new TimelineMax();
	t.addSound('lizardPlaceholder', this.lizard);
	t.addCallback(function () { this.nextRound(); }, null, null, this);
};

LizardJungleGame.prototype.modePlayerDo = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.newFood());
			//t.addSound('lizardPlaceholder', this.lizard);
			var hit;
			if (this.currentNumber > 1) {
				hit = { x: this.tree.x, y: this.tree.children[this.tree.length + 1 - this.currentNumber].world.y };
				t.add(this.lizard.shoot(hit));
			}
			if (this.currentNumber < this.amount) {
				hit = { x: this.tree.x, y: this.tree.children[this.tree.length - 1 - this.currentNumber].world.y };
				t.add(this.lizard.shoot(hit));
			}
			t.add(this.instructionIntro());
		} else {
			t.add(this.newFood());
		}
		t.addCallback(this.showNumbers, null, null, this);
	}
};

LizardJungleGame.prototype.modePlayerShow = function (intro, tries) {
	if (tries > 0) {
		this.showNumbers();
	} else { // if intro or first try
		var t = new TimelineMax();
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start());
			t.addLabel('agentIntro');
			// t.addSound(this.speech, this.agent, 'agentIntro');
			t.add(this.agent.wave(3, 1), 'agentIntro');
		}
		t.add(this.newFood());
		t.addCallback(this.showNumbers, null, null, this);
	}
};

LizardJungleGame.prototype.modeAgentTry = function (intro, tries) {
	var t = new TimelineMax();
	if (tries > 0) {
		this.agent.eyesStopFollow();
		// TODO: Add more specified sounds?
		// t.addSound(this.speech, this.agent, 'agentTryAgain');
		t.add(this.agentGuess());
		t.addCallback(this.showYesnos, null, null, this);
	} else { // if intro or first try
		if (intro) {
			t.skippable();
			t.add(this.agent.moveTo.start()); // Agent should be here already.
			// t.addSound(this.speech, this.agent, 'agentTry');
		}
		t.add(this.newFood());
		t.add(this.agentGuess());
		t.addCallback(this.showYesnos, null, null, this);
	}
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

	var t = new TimelineMax({ repeat: TweenMax.prototype.calcYoyo(duration / 1.5) });
	t.add(TweenMax.fromTo(this.snore, 0.8, { alpha: 0 }, { x: '+=25', y: '-=25', alpha: 1 }));
	t.add(TweenMax.to(this.snore, 0.7, { x: '+=25', y: '-=25', alpha: 0, ease: Power1.easeIn }));
	return t;
};

LizardJungleLizard.prototype.followPointer = function (on) {
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

LizardJungleLizard.prototype.shoot = function (pos) {
	var hit = { x: pos.x, y: pos.y };
	var headOrigin = { x: this.x + this.head.x, y: this.y + this.head.y };
	var t = new TimelineMax();
	t.to(this.head, 0.2, { rotation: game.physics.arcade.angleBetween(hit, headOrigin) });
	t.to(this.forehead, 0.5, { angle: 10 });
	t.to(this.jaw, 0.5, { angle: -5 }, '-=0.5');
	t.to(this.tounge, 0.5, {
		width: game.physics.arcade.distanceBetween(hit, this.tounge.world),
		height: 18
	});
	t.addLabel('stretched');
	t.to(this.tounge, 0.5, { width: 1, height: 5 });
	t.to(this.forehead, 0.2, { angle: 0 });
	t.to(this.jaw, 0.2, { angle: 0 }, '-=0.2');
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