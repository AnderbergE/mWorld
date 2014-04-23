/* Bird Hero game */
BirdheroGame.prototype = Object.create(Minigame.prototype);
BirdheroGame.prototype.constructor = BirdheroGame;
function BirdheroGame () {
	Minigame.call(this); // Call parent constructor.
}

/* Phaser state function */
BirdheroGame.prototype.preload = function () {
	this.load.image('birdheroBg',      'assets/img/minigames/birdhero/bg.png');
	this.load.image('birdheroBird',    'assets/img/minigames/birdhero/bird.png');
	this.load.image('birdheroBole',    'assets/img/minigames/birdhero/bole.png');
	this.load.image('birdheroBranch0', 'assets/img/minigames/birdhero/branch1.png');
	this.load.image('birdheroBranch1', 'assets/img/minigames/birdhero/branch2.png');
	this.load.image('birdheroBranch2', 'assets/img/minigames/birdhero/branch2.png');
	this.load.image('birdheroBucket',  'assets/img/minigames/birdhero/bucket.png');
	this.load.image('birdheroChick',   'assets/img/minigames/birdhero/chick.png');
	this.load.image('birdheroCrown',   'assets/img/minigames/birdhero/crown.png');
	this.load.image('birdheroMother',  'assets/img/minigames/birdhero/mother.png');
	this.load.image('birdheroNest',    'assets/img/minigames/birdhero/nest.png');
	this.load.image('birdheroRope',    'assets/img/minigames/birdhero/rope.png');
	this.load.image('birdheroWhat',    'assets/img/minigames/birdhero/what.png');
	this.load.spritesheet('birdheroBeak', 'assets/img/minigames/birdhero/beak.png', 31, 33);
	this.load.audio('birdheroIntro', ['assets/audio/minigames/birdhero/bg.mp3', 'assets/audio/minigames/birdhero/bg.ogg']);
	this.load.audio('birdheroElevator', ['assets/audio/minigames/birdhero/elevator.mp3', 'assets/audio/minigames/birdhero/elevator.ogg']);
	this.load.audio('birdheroElevatorArrive', ['assets/audio/minigames/birdhero/elevator_arrive.mp3', 'assets/audio/minigames/birdhero/elevator_arrive.ogg']);
	this.load.audio('birdheroElevatorDown', ['assets/audio/minigames/birdhero/elevator_down.mp3', 'assets/audio/minigames/birdhero/elevator_down.ogg']);
};

/* Phaser state function */
BirdheroGame.prototype.create = function () {
	var _this = this; // Subscriptions to not have access to 'this' object
	var coords = {
		tree: {
			x: 600, y: 10, center: 215,
			branch: { start: this.cache.getImage('birdheroBole').height - 150, end: 70 },
			elevator: -30
		},
		agent: {
			start: { x: 200, y: 800 },
			stop: { x: 290, y: 400 },
			scale: 0.25
		},
		bird: {
			start: { x: -100, y: 600 },
			stop: { x: 150, y: 500 }
		}
	};
	var tint = [
		0xffffff, 0xffcccc, 0xccffcc, 0xccccff, 0xffffcc,
		0xffccff, 0xccffff, 0x5555cc, 0x55cc55, 0xcc5555
	];
	this.music = this.add.audio('birdheroIntro', 1, true);

	// Add main game
	this.add.sprite(0, 0, 'birdheroBg', null, this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = coords.agent.start.x;
	this.agent.y = coords.agent.start.y;
	this.agent.scale.x = coords.agent.scale;
	this.agent.scale.y = coords.agent.scale;
	this.gameGroup.bringToTop(this.agent);
	var press = null; // TODO: Debug only, remove later.

	// Create bird, it is added to the elevator group below since we need it to be "in" the elevator.
	// Since the bird is in the elevator group, we need to offset for that when moving it.
	var bird = new BirdheroBird();
	bird.visible = false;
	bird.moveTo = {
		initial: function () {
			return bird.move({ x: coords.bird.stop.x, y: coords.bird.stop.y }, 2000, 1);
		},
		elevator: function () {
			return bird.move({ x: elevator.bucket.x+elevator.bucket.width/2, y: elevator.bucket.y+elevator.bucket.height/2 }, 2000, 0.1);
		},
		peak: function (up) {
			return bird.move({ y: (up ? '-22' : '+22') }, 500);
		},
		nest: function (target) {
			return bird.move({ x: tree.branch[target-1].visit().x + elevator.bucket.width/2 }, 1000);
		}
	};

	// Setup tree and its branches
	var tree = this.add.sprite(coords.tree.x, coords.tree.y, 'birdheroBole', null, this.gameGroup);
	tree.branch = [this.amount];
	var treeBottom = tree.y + coords.tree.branch.start;
	var treeCenter = tree.x + coords.tree.center;
	var heightPerBranch = (coords.tree.branch.start - coords.tree.branch.end)/this.amount;
	for (var i = 0; i < this.amount; i++) {
		tree.branch[i] = new BirdheroBranch(treeCenter, treeBottom - heightPerBranch*i, tint[i]);
		tree.branch[i].scale.x = i % 2 ? 1 : -1;
		this.gameGroup.add(tree.branch[i]);
	}
	tree.bringToTop();

	// Add the elevator, the bird is added to this group to be in the elevator when moving it.
	var elevator = this.add.group(this.gameGroup);
	elevator.rope = this.add.sprite(0, 0, 'birdheroRope', null, elevator);
	elevator.rope.y -= elevator.rope.height;
	elevator.add(bird);
	elevator.bucket = this.add.sprite(0, -5, 'birdheroBucket', null, elevator);
	elevator.text = this.add.text(0 + elevator.bucket.width/2, elevator.bucket.y + elevator.bucket.height/2, '0', {
		font: '30pt The Girl Next Door',
		fill: '#ffff00'
	}, elevator);
	elevator.text.anchor.setTo(0.5);
	elevator.origin = tree.y + tree.height + coords.tree.elevator;
	elevator.x = treeCenter - elevator.bucket.width/2;
	elevator.y = elevator.origin;
	coords.bird.start.x -= elevator.x;
	coords.bird.start.y -= elevator.y;
	coords.bird.stop.x -= elevator.x;
	coords.bird.stop.y -= elevator.y;

	var elevatorAudio = this.add.audio('birdheroElevator', 1);
	var elevatorAudioArrive = this.add.audio('birdheroElevatorArrive', 1);
	var elevatorAudioDown = this.add.audio('birdheroElevatorDown', 1);
	elevator.moveTo = {
		_direct: function (target, arrived) {
			var t = _this.add.tween(elevator).to({ y: tree.branch[target-1].y + tree.branch[target-1].visit().y }, 1000, Phaser.Easing.Quadratic.InOut);
			t.onComplete.addOnce(function() {
				elevator.text.text = target.toString();
				if (arrived) { elevatorAudioArrive.play(); }
				else { elevatorAudio.play(); }
			});
			return t;
		},
		bottom: function () {
			var t = _this.add.tween(elevator).to({ y: elevator.origin }, 1000, Phaser.Easing.Quadratic.InOut);
			t.onStart.addOnce(function () { elevatorAudioDown.play(); });
			t.onComplete.addOnce(function() { elevator.text.text = '0'; });
			return t;
		},
		branch: function (target) {
			if (target === 0) {
				return elevator.moveTo.bottom();
			}

			var first;
			var curr;
			var prev;
			for (var i = parseInt(elevator.text.text)+1; i <= target; i++) {
				curr = elevator.moveTo._direct(i, i === target);
				if (prev) { prev.then(curr); }
				else { first = curr; }
				prev = curr;
			}

			return first;
		}
	};
	// The tree crown is added last so that it is put "closest" to the user.
	this.add.sprite(tree.x, tree.y-100, 'birdheroCrown', null, this.gameGroup);

	// Add HUD
	var buttons = new ButtonPanel(this.representation, this.amount,
		0, this.world.height-100, this.world.width, 75, 'wood', '#000000', false, pushNumber);
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(GLOBAL.NUMBER_REPRESENTATION.yesno, 2,
		0, this.world.height-100, this.world.width, 75, 'wood', null, false, pushYesno);
	this.hudGroup.add(yesnos);

	/* Function to trigger when a number button is pushed */
	function pushNumber (number) {
		_this.disable(true);
		_this.agent.eyesFollowObject(bird.beak.world);

		bird.moveTo.elevator().start()
			.then(bird.moveTo.peak(true))
			.then(elevator.moveTo.branch(number))
			.then(bird.moveTo.peak(false))
			.then(bird.moveTo.nest(number))
			.onComplete.addOnce(function () {

				var result = _this.tryNumber(number);
				var branch = tree.branch[number-1];
				if (!result) { /* Correct :) */
					bird.visible = false;
					branch.celebrate(11);
					_this.addWater(branch.mother.world.x, branch.mother.world.y, function () {
						elevator.moveTo.bottom().start().onComplete.addOnce(function () {
							_this.nextRound();
						});
					});
				} else { /* Incorrect :( */
					if (result < 0) { publish('birdheroTooLow'); }
					else { publish('birdheroTooHigh'); }

					branch.confused();
					bird.moveTo.elevator().start()
						.then(bird.moveTo.peak(true))
						.then(elevator.moveTo.bottom())
						.then(bird.moveTo.peak(false))
						.then(bird.moveTo.initial())
						.onComplete.addOnce(function () {
							bird.turn(1).start();
							_this.nextRound();
						});
				}
			});
	}
	/* Function to trigger when a yes/no button is pushed */
	function pushYesno (value) {
		if (!value) { showNumbers(); }
		else { pushNumber(_this.agent.lastGuess); }
	}

	/* Show the number panel, hide the yes/no panel and enable input */
	function showNumbers () {
		_this.hudGroup.visible = true;
		buttons.reset();
		buttons.visible = true;
		yesnos.visible = false;
		_this.disable(false);
		_this.agent.eyesFollowMouse();
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		_this.hudGroup.visible = true;
		buttons.visible = false;
		yesnos.reset();
		yesnos.visible = true;
		_this.disable(false);
		_this.agent.eyesFollowMouse();
	}

	/* Introduce a new bird, aka: start a new round. */
	function newBird (onComplete) {
		bird.x = coords.bird.start.x;
		bird.y = coords.bird.start.y;
		bird.visible = true;
		bird.number = _this.currentNumber;
		bird.tint = tint[bird.number - 1];
		bird.moveTo.initial().start().onComplete.addOnce(onComplete);
	}

	/* Have the agent guess a number */
	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);
		if (press) { _this.hudGroup.remove(press); }
		press = new NumberButton(_this.agent.lastGuess, _this.representation, 200, 200);
		_this.hudGroup.add(press);
		showYesnos();
	}

	/* Overshadowing of the mode related functions */
	this.modeIntro = function () {
		this.music.play();
		_this.hudGroup.visible = false;

		setTimeout(function () {
			_this.nextMode();
			_this.nextRound();
		}, 1000);
	};

	this.modePlayerDo = function (intro, tries) {
		_this.disable(true);
		if (intro) {
			_this.hudGroup.visible = false;
			_this.agent.visible = false;
		}
		if (tries <= 0) { newBird(showNumbers); }
		else { showNumbers(); }
	};

	this.modePlayerShow = function (intro, tries) {
		_this.disable(true);
		if (intro) {
			_this.hudGroup.visible = false;
			_this.agent.visible = true;
			_this.add.tween(_this.agent).to({ x: coords.agent.stop.x, y: coords.agent.stop.y }, 3000, Phaser.Easing.Quadratic.Out, true).onComplete.addOnce(function () {
				newBird(showNumbers);
			});
		} else {
			if (tries <= 0) { newBird(showNumbers); }
			else { showNumbers(); }
		}
	};

	this.modeAgentTry = function (intro, tries) {
		_this.disable(true);
		if (intro) {
			_this.hudGroup.visible = false;
			_this.agent.visible = true;
		}

		if (intro || tries <= 0) { newBird(agentGuess); }
		else { agentGuess(); }
	};

	this.modeAgentDo = function (intro, tries) {
		_this.hudGroup.visible = false;

		if (intro || tries <= 0) {
			newBird(function () { pushNumber(_this.agent.guessNumber(_this.currentNumber, 1, _this.amount)); });
		}
		else { pushNumber(_this.agent.guessNumber(_this.currentNumber, 1, _this.amount)); }
	};

	this.modeOutro = function () {
		_this.hudGroup.visible = false;
		_this.agent.setHappy(true);
		for (var i = 0; i < tree.branch.length; i++) {
			tree.branch[i].celebrate();
		}
		setTimeout(function () {
			_this.state.start(GLOBAL.STATE.garden);
		}, 1000);
	};

	// Make sure the call this when everything is set up.
	this.startGame();
};

/* Bird Hero game objects */

BirdheroBranch.prototype = Object.create(Phaser.Group.prototype);
BirdheroBranch.prototype.constructor = BirdheroBranch;
function BirdheroBranch (x, y, tint) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;

	var branch = game.add.sprite(0, 0, 'birdheroBranch' + parseInt(Math.random()*3), null, this);
	branch.x -= branch.width;
	this.nest = game.add.sprite(branch.x + 60, branch.height * 0.4, 'birdheroNest', null, this);
	this.mother = game.add.sprite(this.nest.x + this.nest.width/5, this.nest.y, 'birdheroMother', null, this);
	this.mother.y -= this.mother.height*0.7;
	this.mother.tint = tint || 0xffffff;
	this.nest.bringToTop();

	return this;
}

/* Returns the x, y coordinates of where the bird should stop at the nest */
BirdheroBranch.prototype.visit = function () {
	return {
		x: (this.nest.x + this.nest.width) * this.scale.x,
		y: this.nest.y
	};
};

BirdheroBranch.prototype.celebrate = function (times) {
	times = times || 11;
	times += (times % 2 === 0) ? 1 : 0; // Bird will be strangely positioned if number is not odd.
	return game.add.tween(this.mother).to({ y: this.mother.y-5 }, 200, Phaser.Easing.Linear.None, true, 0, times, true);
};

BirdheroBranch.prototype.confused = function (times) {
	if (!this.confusing) {
		this.confusing = game.add.text(this.mother.x+10, this.mother.y-40, '?!?', {
			font: '20pt The Girl Next Door',
			fill: '#000',
			stroke: '#000',
			strokeThickness: 3
		}, this);
		if (this.scale.x < 0) { // Always show the text in the correct way.
			this.confusing.x += this.confusing.width;
			this.confusing.scale.x = -1;
		}
	}

	times = times || 11;
	times += (times % 2 === 0) ? 1 : 0; // Group will be strangely positioned if number is not odd.
	this.confusing.visible = true;
	var anim = game.add.tween(this.confusing).to({ y: this.confusing.y-5 }, 200, Phaser.Easing.Linear.None, true, 0, times, true);
	anim.onComplete.add(function () { this.confusing.visible = false; }, this);
	return anim;
};


BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;
function BirdheroBird () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.visible = false;
	this.number = null;

	var body = game.add.sprite(0, 0, 'birdheroBird', null, this);
	body.anchor.setTo(0.5);
	this.beak = game.add.sprite(75, -35, 'birdheroBeak', null, this);
	this.beak.anchor.setTo(0.5);
	this.beak.talk = this.beak.animations.add('talk', null, 4, true);

	return this;
}
Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() {
		return this.children[0].tint;
	},
	set: function(value) {
		this.setAllChildren('tint', value);
	}
});

BirdheroBird.prototype.say = function (what, onComplete) {
	this.beak.talk.play();
	var s = game.add.sound(what);
	s.onStop = function () {
		this.beak.talk.stop();
		if (onComplete) { onComplete(); }
	};
	return s;
};

BirdheroBird.prototype.turn = function (direction) {
	// Turn by manipulating the scale.
	var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
	return game.add.tween(this.scale).to({ x: newScale }, 200, Phaser.Easing.Linear.None);
};

BirdheroBird.prototype.move = function (properties, duration, scale) {
	var t = game.add.tween(this).to(properties, duration, Phaser.Easing.Quadratic.Out);
	
	t.onStart.addOnce(function () {
		if (properties.x &&                          // Check if we should turn around
			(properties.x <= this.x && 0 < this.scale.x) || // Going left, scale should be -1
			(this.x <= properties.x && 0 > this.scale.x)) { // Going right, scale should be 1
			var turn = this.turn().start();
			if (scale) {
				turn.onComplete.add(function () {
					game.add.tween(this.scale).to({ x: (this.scale.x < 0 ? -1 * scale : scale), y: scale }, duration - 200, Phaser.Easing.Quadratic.Out, true);
				}, this);
			}
		} else if (scale) {
			game.add.tween(this.scale).to({ x: (this.scale.x < 0 ? -1 * scale : scale), y: scale }, duration, Phaser.Easing.Quadratic.Out, true);
		}
	}, this);

	return t;
};