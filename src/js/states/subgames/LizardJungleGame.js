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

	this.load.image('lizardBg',      'assets/img/subgames/lizardjungle/bg.jpg');
	this.load.image('lizardBody',    'assets/img/subgames/lizardjungle/body.png');
	this.load.image('lizardHead',    'assets/img/subgames/lizardjungle/head.png');
	this.load.image('lizardMouth',   'assets/img/subgames/lizardjungle/mouth.png');
	this.load.image('lizardTounge',  'assets/img/subgames/lizardjungle/tounge.png');
	this.load.image('lizardTree',    'assets/img/subgames/lizardjungle/tree.png');
	this.load.image('lizardTreeTop', 'assets/img/subgames/lizardjungle/top.png');
	this.load.image('lizardAnt',     'assets/img/subgames/lizardjungle/ant.png');
	this.load.image('lizardArrow',   'assets/img/objects/arrow.png');
};

/* Phaser state function */
LizardJungleGame.prototype.create = function () {
	var _this = this; // Subscriptions do not have access to 'this' object
	var coords = {
		tree: {
			x: 600, y: 10
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
	this.add.sprite(0, 0, 'lizardBg', null, this.gameGroup);

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
	tree.x = 200;
	tree.y = 700;
	tree.boleHeight = 0;
	tree.pieces = [];
	for (var i = 1; i <= this.amount; i++) {
		tree.pieces.push(this.add.sprite(0, tree.boleHeight, 'lizardTree', null, tree));
		tree.pieces[i-1].anchor.set(0.5, 1);
		tree.boleHeight -= 78;
	}
	this.add.sprite(0, tree.boleHeight + 5, 'lizardTreeTop', null, tree).anchor.set(0.5, 1);
	tree.scale.set(500/-tree.boleHeight);
	tree.boleHeight = -tree.boleHeight * tree.scale.y;
	var shootOffset = 78 * tree.scale.y / 2;

	// Setup lizard
	var lizard = new LizardJungleLizard(575, 500);
	this.gameGroup.add(lizard);

	// The target is set up in the newFood function
	var target;

	// Add HUD
	var buttons = new ButtonPanel(this.amount, this.representation, {
		method: this.method,
		x: this.world.width-(this.representation.length*75)-25,
		y: tree.y - tree.boleHeight,
		vertical: true,
		size: tree.boleHeight,
		reversed: true,
		background: 'wood',
		onClick: pushNumber
	});
	buttons.visible = false;
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.width-100,
		vertical: true,
		background: 'wood',
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
		var treePiece = tree.pieces[number-1].world;
		var hit = { x: treePiece.x, y: treePiece.y - shootOffset };

		var t = new TimelineMax();
		if (!result) { // Correct :)
			t.add(lizard.shootObject(target));
			t.add(TweenMax.to(lizard, 1, { tint: target.tint }));
			t.addCallback(function () { target.destroy(); });
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

		if (_this.agent.visible) { _this.agent.eyesFollowPointer(true); }
	}

	function newFood () {
		target = _this.add.sprite(tree.x, 750, 'lizardAnt', null, _this.gameGroup);
		target.tint = tint[_this.currentNumber];
		target.visible = false;
		target.anchor.set(0.5);
		target.scale.set(0.25);
		_this.gameGroup.bringToTop(lizard);

		var t = new TimelineMax();
		t.addCallback(function () { target.visible = true; });
		t.add(new TweenMax(target, 1, { y: tree.pieces[0].world.y - shootOffset }));
		for (var i = 1; i < _this.currentNumber; i++) {
			t.add(new TweenMax(target, 0.8, { y: tree.pieces[i].world.y - shootOffset }));
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
					say('birdheroAgentHmm', _this.agent).play();
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

	function pointAtBole (number) {
		var first = tree.pieces[0];
		var center = { x: first.width*tree.scale.x/2, y: first.height*tree.scale.y/2*1.3 }; // 1.2 is a offset
		var start = first.world;
		var offset = 70;
		var arrow = game.add.sprite(start.x + center.x + offset, start.y - center.y, 'lizardArrow', null, this.gameGroup);
		arrow.visible = false;

		var t = new TimelineMax();
		t.addCallback(function () { arrow.visible = true; });
		for (var i = 0; i < number; i++) {
			var pos = tree.pieces[i].world;
			if (i !== 0) { t.add(new TweenMax(arrow, 1, { x: '+=' + offset, y: pos.y - center.y })); }
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
				_this.currentNumber = 3;
				t.skippable();
				t.add(newFood());
				//t.addSound('lizardPlaceholder', lizard);
				var hit1 = { x: tree.x, y: tree.pieces[1].world.y - shootOffset };
				t.add(lizard.shoot(hit1));
				var hit2 = { x: tree.x, y: tree.pieces[3].world.y- shootOffset };
				t.add(lizard.shoot(hit2));
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
			_this.agent.eyesFollowPointer(true);
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
LizardJungleLizard.prototype = Object.create(Phaser.Group.prototype);
LizardJungleLizard.prototype.constructor = LizardJungleLizard;
function LizardJungleLizard (x, y) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x || 0;
	this.y = y || 0;

	this.body = game.add.sprite(48, 0, 'lizardBody', null, this);
	this.head = game.add.group(this);
	this.head.x = 70;
	this.head.y = 55;

	this.tounge = game.add.sprite(10, 15, 'lizardTounge', null, this.head);
	this.tounge.anchor.set(1, 0);
	this.tounge.width = 1;
	this.tounge.height = 5;
	this.forehead = game.add.sprite(17, 29, 'lizardHead', null, this.head);
	this.forehead.anchor.set(1, 1);
	this.mouth = game.add.sprite(16, 15, 'lizardMouth', null, this.head);
	this.mouth.anchor.set(1, 0);

	this.talk = new TimelineMax({ repeat: -1, yoyo: true, paused: true });
	this.talk.to(this.mouth, 0.2, { angle: -2 });
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
		this.mouth.tint = value;
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
	t.to(this.mouth, 0.5, { angle: -5 }, '-=0.5');
	t.to(this.tounge, 0.5, {
		width: game.physics.arcade.distanceBetween(hit, this.tounge.world),
		height: 18
	});
	t.addLabel('stretched');
	t.to(this.tounge, 0.5, { width: 1, height: 5 });
	t.to(this.forehead, 0.2, { angle: 0 });
	t.to(this.mouth, 0.2, { angle: 0 }, '-=0.2');
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