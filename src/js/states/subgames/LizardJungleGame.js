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
	var coords = {
		tree: {
			x: 200, y: 220, height: 550, offset: -10
		},
		agent: {
			start: { x: 1300, y: 700 },
			stop: { x: 700, y: 400 },
			scale: 0.25
		}
	};
	var tint = [
		0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00,
		0x0000ff, 0x555555, 0x3333cc, 0x33cc33, 0xcc3333
	];

	// Add main game
	this.add.sprite(0, 0, 'lizard', 'bg', this.gameGroup);

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
	var thoughtBubble = this.add.sprite(0, 0, 'thought', null, this.agent.thought);
	thoughtBubble.anchor.set(0.5);
	this.gameGroup.bringToTop(this.agent);

	// Setup tree and its branches
	var tree = this.add.group(this.gameGroup);
	tree.x = coords.tree.x;
	tree.y = coords.tree.y;
	this.add.sprite(0, 0, 'lizard', 'bole', tree).anchor.set(0.5);
	for (var i = this.amount - 2; i >= 0; i--) {
		this.add.sprite(0, tree.height + coords.tree.offset, 'lizard', 'bole', tree).anchor.set(0.5);
	}
	tree.scale.set(coords.tree.height/tree.height);
	this.add.sprite(tree.x - 40, tree.y + tree.height/tree.length, 'lizard', 'crown', this.gameGroup).anchor.set(0.5, 1);

	// The target is set up in the newFood function
	var target = this.add.sprite(0, 0, 'lizard', 'ant', this.gameGroup);
	target.anchor.set(0.5);
	target.visible = false;

	// Setup lizard
	var lizard = new LizardJungleLizard(575, 500);
	this.gameGroup.add(lizard);

	// Add HUD
	var buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		x: this.world.width-(this.representation.length*75)-25,
		y: tree.y - tree.height / tree.length / 2,
		vertical: true,
		size: tree.height,
		reversed: true,
		onClick: pushNumber
	});
	buttons.visible = false;
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.width-100,
		vertical: true,
		onClick: pushYesno
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
		lizard.followPointer(false);
		_this.agent.eyesFollowObject(lizard.tounge.world);

		var result = _this.tryNumber(number);
		var treePiece = tree.children[tree.length - number].world;
		var hit = { x: treePiece.x, y: treePiece.y };

		var t = new TimelineMax();
		if (!result) { // Correct :)
			t.add(lizard.shootObject(target));
			t.addCallback(function () { target.visible = true; });
			t.add(TweenMax.to(lizard, 1, { tint: target.tint }));
		} else { // Incorrect :(
			t.add(lizard.shoot(hit));
		}
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

		lizard.followPointer(true);
		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		_this.disable(true);
		yesnos.reset();
		fade(buttons, false);
		fade(yesnos, true).eventCallback('onComplete', _this.disable, false, _this);

		lizard.followPointer(true);
		if (_this.agent.visible) { _this.agent.eyesFollowPointer(); }
	}
	/* Hide the number and yes/no panel */
	function hideButtons () {
		_this.disable(true);
		fade(buttons, false);
		fade(yesnos, false);

		if (_this.agent.visible) { _this.agent.eyesStopFollow(); }
	}

	function newFood () {
		target.x = tree.x;
		target.y = game.world.height + target.height;
		target.tint = tint[_this.currentNumber];

		var t = new TimelineMax();
		t.addCallback(function () { target.visible = true; });
		t.add(new TweenMax(target, 1, { y: tree.children[tree.length - 1].world.y }));
		for (var i = 1; i < _this.currentNumber; i++) {
			t.add(new TweenMax(target, 0.8, { y: tree.children[tree.length - 1 - i].world.y }));
		}
		return t;
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
					_this.agent.say('lizardPlaceholder').play();
				},
				onComplete: function () {
					_this.agent.thought.guess = new NumberButton(_this.agent.lastGuess, _this.representation, {
						x: -60, y: -30, disabled: true
					});
					_this.agent.thought.add(_this.agent.thought.guess);
					// TODO: Agent should say something here based on how sure it is.
					showYesnos();
				}
			});
	}

	function pointAtBole (number) {
		var first = tree.children[tree.length - 1];
		var start = first.world;
		var offset = 70;
		var arrow = game.add.sprite(start.x + offset, start.y, 'lizardArrow', null, this.gameGroup);
		arrow.anchor.set(0, 0.5);
		arrow.visible = false;

		var t = new TimelineMax();
		t.addCallback(function () { arrow.visible = true; });
		for (var i = 0; i < number; i++) {
			var pos = tree.children[tree.length - 1 - i].world;
			if (i !== 0) { t.add(new TweenMax(arrow, 1, { x: '+=' + offset, y: pos.y })); }
			t.add(new TweenMax(arrow, 1, { x: '-=' + offset }));
		}
		t.addCallback(function () { arrow.destroy(); }, '+=0.5');
		return t;
	}

	function instructionIntro () {
		var t = new TimelineMax();
		//t.addSound(speech, bird, 'instruction1a');
		t.add(pointAtBole(_this.currentNumber));
		t.add(fade(buttons, true));
		t.add(buttons.highlight(1));
		//t.addSound(speech, bird, 'instruction1b');
		return t;
	}

	this.modeIntro = function () {
		// Most of the intro is in modePlayerDo. But we need a slight wait
		// so that the game world can set up.
		var t = new TimelineMax();
		t.addSound('lizardPlaceholder', lizard);
		t.addCallback(function () { _this.nextRound(); });
	};

	this.modePlayerDo = function (intro, tries) {
		if (tries > 0) {
			showNumbers();
		} else { // if intro or first try
			var t = new TimelineMax();
			if (intro) {
				t.skippable();
				t.add(newFood());
				//t.addSound('lizardPlaceholder', lizard);
				var hit;
				if (_this.currentNumber > 1) {
					hit = { x: tree.x, y: tree.children[tree.length + 1 - _this.currentNumber].world.y };
					t.add(lizard.shoot(hit));
				}
				if (_this.currentNumber < this.amount) {
					hit = { x: tree.x, y: tree.children[tree.length - 1 - _this.currentNumber].world.y };
					t.add(lizard.shoot(hit));
				}
				t.add(instructionIntro());
			} else {
				t.add(newFood());
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
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start());
				t.addLabel('agentIntro');
				//t.addSound('birdheroAgentShow', _this.agent);
				t.add(_this.agent.wave(3, 1), 'agentIntro');
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentShow'); });
			}
			t.add(newFood());
			t.addCallback(showNumbers);
		}
	};

	this.modeAgentTry = function (intro, tries) {
		var t = new TimelineMax();
		if (tries > 0) {
			_this.agent.eyesStopFollow();
			// TODO: Add more specified sounds?
			//t.addSound('birdheroAgentOops', _this.agent);
			t.add(agentGuess());
		} else { // if intro or first try
			if (intro) {
				t.skippable();
				t.eventCallback('onStart', function () { hideButtons(); });
				t.add(_this.agent.moveTo.start()); // Agent should be here already.
				//t.addSound('birdheroAgentTry', _this.agent);
				//t.eventCallback('onComplete', function () { _this.sound.removeByKey('birdheroAgentTry'); });
			}
			t.add(newFood());
			t.add(agentGuess());
		}
	};

	// Everything is set up! Blast off!
	this.startGame();
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