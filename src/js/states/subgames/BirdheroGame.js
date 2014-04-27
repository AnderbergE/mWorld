/* Bird Hero game */
BirdheroGame.prototype = Object.create(Subgame.prototype);
BirdheroGame.prototype.constructor = BirdheroGame;
function BirdheroGame () {
	Subgame.call(this); // Call parent constructor.
}

/* Phaser state function */
BirdheroGame.prototype.preload = function () {
	this.load.image('birdheroBg',      'assets/img/subgames/birdhero/bg.png');
	this.load.image('birdheroBird',    'assets/img/subgames/birdhero/bird.png');
	this.load.image('birdheroBole',    'assets/img/subgames/birdhero/bole.png');
	this.load.image('birdheroBranch0', 'assets/img/subgames/birdhero/branch1.png');
	this.load.image('birdheroBranch1', 'assets/img/subgames/birdhero/branch2.png');
	this.load.image('birdheroBranch2', 'assets/img/subgames/birdhero/branch2.png');
	this.load.image('birdheroBucket',  'assets/img/subgames/birdhero/bucket.png');
	this.load.image('birdheroChick',   'assets/img/subgames/birdhero/chick.png');
	this.load.image('birdheroCrown',   'assets/img/subgames/birdhero/crown.png');
	this.load.image('birdheroMother',  'assets/img/subgames/birdhero/mother.png');
	this.load.image('birdheroNest',    'assets/img/subgames/birdhero/nest.png');
	this.load.image('birdheroRope',    'assets/img/subgames/birdhero/rope.png');
	this.load.image('birdheroWhat',    'assets/img/subgames/birdhero/what.png');
	this.load.spritesheet('birdheroBeak', 'assets/img/subgames/birdhero/beak.png', 31, 33);
	this.load.audio('birdheroIntro', ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
	this.load.audio('birdheroElevator', ['assets/audio/subgames/birdhero/elevator.mp3', 'assets/audio/subgames/birdhero/elevator.ogg']);
	this.load.audio('birdheroElevatorArrive', ['assets/audio/subgames/birdhero/elevator_arrive.mp3', 'assets/audio/subgames/birdhero/elevator_arrive.ogg']);
	this.load.audio('birdheroElevatorDown', ['assets/audio/subgames/birdhero/elevator_down.mp3', 'assets/audio/subgames/birdhero/elevator_down.ogg']);
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
			start: { x: 250, y: 850 },
			stop: { x: 390, y: 500 },
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
	var elevatorAudio = this.add.audio('birdheroElevator', 1);
	var elevatorAudioArrive = this.add.audio('birdheroElevatorArrive', 1);
	var elevatorAudioDown = this.add.audio('birdheroElevatorDown', 1);

	// Calculate positions for bird based on elevator.
	coords.bird.start.x -= elevator.x;
	coords.bird.start.y -= elevator.y;
	coords.bird.stop.x -= elevator.x;
	coords.bird.stop.y -= elevator.y;

	// The tree crown is added last so that it is put "closest" to the user.
	this.add.sprite(tree.x, tree.y-100, 'birdheroCrown', null, this.gameGroup);


	// Add HUD
	var buttons = new ButtonPanel(this.representation, this.amount,
		0, this.world.height-100, this.world.width, 75, 'wood', '#000000', false, pushNumber);
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(GLOBAL.NUMBER_REPRESENTATION.yesno, 2,
		0, this.world.height-100, this.world.width, 75, 'wood', null, false, pushYesno);
	this.hudGroup.add(yesnos);


	// Add Timeline/Tween functions
	bird.moveTo = {
		initial: function () {
			return bird.move({ x: coords.bird.stop.x, y: coords.bird.stop.y }, 2, 1);
		},
		elevator: function () {
			return bird.move({ x: elevator.bucket.x+elevator.bucket.width/2, y: elevator.bucket.y+elevator.bucket.height/2 }, 2, 0.1);
		},
		peak: function (up) {
			return bird.move({ y: (up ? '-=22' : '+=22') }, 0.5);
		},
		nest: function (target) {
			return bird.move({ x: tree.branch[target-1].visit().x + elevator.bucket.width/2 }, 1);
		}
	};

	elevator.moveTo = {
		_direct: function (target, arrived) {
			return new TweenMax(elevator, 1, {
				y: tree.branch[target-1].y + tree.branch[target-1].visit().y,
				ease: Power1.easeInOut,
				onComplete: function () {
					elevator.text.text = target.toString();
					if (arrived) { elevatorAudioArrive.play(); }
					else { elevatorAudio.play(); }
				}
			});
		},
		bottom: function () {
			return new TweenMax(elevator, 1, {
				y: elevator.origin,
				ease: Power1.easeInOut,
				onStart: function () { elevatorAudioDown.play(); },
				onComplete: function() { elevator.text.text = '0'; }
			});
		},
		branch: function (target) {
			if (target === 0) {
				return elevator.moveTo.bottom();
			}

			var t = new TimelineMax();
			for (var i = parseInt(elevator.text.text)+1; i <= target; i++) {
				t.add(elevator.moveTo._direct(i, i === target));
			}
			return t;
		}
	};

	/* Function to trigger when a number button is pushed */
	function pushNumber (number) {
		_this.disable(true);
		_this.agent.eyesFollowObject(bird.beak.world);

		var up = new TimelineMax();
		up.add(bird.moveTo.elevator());
		up.add(bird.moveTo.peak(true));
		up.add(elevator.moveTo.branch(number));
		up.add(bird.moveTo.peak(false));
		up.add(bird.moveTo.nest(number));
		up.eventCallback('onComplete', function () {
			var result = _this.tryNumber(number);
			var branch = tree.branch[number-1];

			if (!result) { /* Correct :) */
				bird.visible = false;
				branch.celebrate();
				_this.addWater(branch.mother.world.x, branch.mother.world.y, function () {
					var t = elevator.moveTo.bottom();
					var comp = t.vars.onComplete;
					t.eventCallback('onComplete', function () {
						comp();
						_this.nextRound();
					});
				});
			} else { /* Incorrect :( */
				if (result < 0) { publish('birdheroTooLow'); }
				else { publish('birdheroTooHigh'); }

				branch.confused();
				var down = new TimelineMax();
				down.add(bird.moveTo.elevator());
				down.add(bird.moveTo.peak(true));
				down.add(elevator.moveTo.bottom());
				down.add(bird.moveTo.peak(false));
				down.add(bird.moveTo.initial());
				down.eventCallback('onComplete', function () {
					bird.turn(1);
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
		_this.agent.eyesFollowPointer();
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		_this.hudGroup.visible = true;
		buttons.visible = false;
		yesnos.reset();
		yesnos.visible = true;
		_this.disable(false);
		_this.agent.eyesFollowPointer();
	}

	/* Introduce a new bird, aka: start a new round. */
	function newBird (onComplete) {
		bird.x = coords.bird.start.x;
		bird.y = coords.bird.start.y;
		bird.visible = true;
		bird.number = _this.currentNumber;
		bird.tint = tint[bird.number - 1];
		bird.moveTo.initial().eventCallback('onComplete', onComplete);
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
			TweenMax.to(_this.agent, 3, {
				x: coords.agent.stop.x,
				y: coords.agent.stop.y,
				onComplete: function () { newBird(showNumbers); }
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
		_this.agent.happy(1000);
		for (var i = 0; i < tree.branch.length; i++) {
			tree.branch[i].celebrate(1000);
		}
		setTimeout(function () {
			_this.state.start(GLOBAL.STATE.garden);
		}, 1000);
	};

	// Make sure the call this when everything is set up.
	this.startGame();
};



/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                          Bird Hero game objects                           */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/* A branch for the tree, holds: branch, nest, parent and chicks */
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

/** @returns {Object} The x, y coordinates of where the bird should stop at the nest */
BirdheroBranch.prototype.visit = function () {
	return {
		x: (this.nest.x + this.nest.width) * this.scale.x,
		y: this.nest.y
	};
};

/**
 * When the nest goes wild!
 * @param {number} The duration of the celebration, default: 3000
 * @returns {Object} The celebration tween
 */
BirdheroBranch.prototype.celebrate = function (duration) {
	duration = duration || 3000;
	var times = parseInt(duration / 200);
	times += (times % 2 === 0) ? 1 : 0; // Bird will be strangely positioned if number is not odd.
	return new TweenMax.to(this.mother, 0.2, { y: this.mother.y - 5, ease: Power0.easeInOut, repeat: times, yoyo: true });
};

/**
 * When something strange is happening.
 * @param {number} The duration of the confusion, default: 3000
 * @returns {Object} The confusion tween
 */
BirdheroBranch.prototype.confused = function (duration) {
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

	duration = duration || 3000;
	var times = parseInt(duration / 200);
	times += (times % 2 === 0) ? 1 : 0; // Group will be strangely positioned if number is not odd.

	this.confusing.visible = true;
	var _this = this;
	return new TweenMax.to(this.confusing, 0.2, { y: this.confusing.y - 5, repeat: times, yoyo: true,
		onComplete: function () { _this.confusing.visible = false; }
	});
};

/* The bird that you are helping home */
BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;
function BirdheroBird () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.visible = false;
	this.number = null;

	this.body = game.add.sprite(0, 0, 'birdheroBird', null, this);
	this.body.anchor.setTo(0.5);
	this.beak = game.add.sprite(75, -35, 'birdheroBeak', null, this);
	this.beak.anchor.setTo(0.5);
	this.beak.talk = this.beak.animations.add('talk', null, 4, true);

	return this;
}
Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() {
		return this.body.tint;
	},
	set: function(value) {
		this.body.tint = value;
	}
});

/**
 * It's a flying, talking birdie!
 * @param {string} The key to a sound file
 * @returns {Object} The sound object (not started)
 */
BirdheroBird.prototype.say = function (what) {
	this.beak.talk.play();
	var s = game.add.sound(what);
	s.onStop = function () { this.beak.talk.stop(); };
	return s;
};

/**
 * Turn around! Every now and then I get a little bit lonely...
 * @param {number} -1 = left, 1 = right, default: opposite of current
 * @returns {Object} The turning tween
 */
BirdheroBird.prototype.turn = function (direction) {
	// Turn by manipulating the scale.
	var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
	return new TweenMax(this.scale, 0.2, { x: newScale });
};

/**
 * Move around, turn according to move direction.
 * NOTE: turning takes 200ms, making a new move before that might give strange results.
 * @param {Object} Properties to tween
 * @param {number} Duration of the move
 * @param {number} If a scaling should happen during the move
 * @returns {Object} The movement tween
 */
BirdheroBird.prototype.move = function (properties, duration, scale) {
	var _this = this;
	properties.onStart = function () {
		if (properties.x &&                                   // Check if we should turn around
			(properties.x <= _this.x && 0 < _this.scale.x) || // Going left, scale should be -1
			(_this.x <= properties.x && 0 > _this.scale.x)) { // Going right, scale should be 1
			var turn = _this.turn();
			if (scale) {
				turn.eventCallback('onComplete', function () {
					TweenMax.to(_this.scale, duration - 0.2, { x: (_this.scale.x < 0 ? -1 * scale : scale), y: scale });
				});
			}
		} else if (scale) {
			TweenMax.to(_this.scale, duration, { x: (_this.scale.x < 0 ? -1 * scale : scale), y: scale });
		}
	};
	return new TweenMax(this, duration, properties);
};