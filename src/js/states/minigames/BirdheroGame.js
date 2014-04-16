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
		tree: { x: 600, y: 10, elevator: -30 },
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
	var agent = this.agent.gfx;
	agent.x = coords.agent.start.x;
	agent.y = coords.agent.start.y;
	agent.scale.x = coords.agent.scale;
	agent.scale.y = coords.agent.scale;
	this.gameGroup.bringToTop(agent);
	var press = null; // TODO: Debug only, remove later.

	// Create bird, it is added to the elevator group below since we need it to be "in" the elevator.
	// Since the bird is in the elevator group, we need to offset for that when moving it.
	var bird = new BirdheroBird();
	bird.visible = false;
	bird.moveTo = {
		initial: function (onComplete) {
			bird.move({ x: coords.bird.stop.x-elevator.x, y: coords.bird.stop.y-elevator.y }, 2000, function () { bird.turn(1).onComplete.addOnce(onComplete); }, 1);
		},
		elevator: function (onComplete) {
			bird.move({ x: elevator.bucket.world.x+elevator.bucket.width/2-elevator.x, y: elevator.bucket.world.y+elevator.bucket.height/2-elevator.y }, 2000, onComplete, 0.1);
		},
		peak: function (up, onComplete) {
			bird.move({ y: (up ? '-22' : '+22') }, 500, onComplete);
		},
		nest: function (target, onComplete) {
			var pos = tree.branch[target-1].visit();
			bird.move({ x: pos.x-elevator.x, y: pos.y-elevator.y }, 1000, onComplete);
		},
		longElevator: function (target, onComplete) {
			bird.moveTo.elevator(function () {
				bird.moveTo.peak(true, function () {
					elevator.moveTo.branch(target, function () {
						bird.moveTo.peak(false, onComplete);
					});
				});
			});
		}
	};

	// Setup tree and its branches
	var tree = this.add.sprite(coords.tree.x, coords.tree.y, 'birdheroBole', null, this.gameGroup);
	tree.branch = [this.amount];
	var treeBottom = tree.y + tree.height - 150;
	var treeCenter = tree.x + 215;
	var heightPerBranch = (tree.height - 220)/this.amount;
	for (var i = 0; i < this.amount; i++) {
		tree.branch[i] = new BirdheroBranch(treeCenter, treeBottom - heightPerBranch*i, tint[i]);
		tree.branch[i].scale.x = i % 2 ? 1 : -1;
		this.gameGroup.add(tree.branch[i]);
	}
	tree.bringToTop();

	// Add the elevator, the bird is added to this group.
	var elevator = this.add.group(this.gameGroup);
	elevator.x = treeCenter - this.cache.getImage('birdheroBucket').width/2;
	elevator.y = coords.tree.elevator;
	elevator.number = 0;
	elevator.rope = this.add.sprite(0, 0, 'birdheroRope', null, elevator);
	elevator.add(bird);
	elevator.bucket = this.add.sprite(0, elevator.rope.y + elevator.rope.height - 5, 'birdheroBucket', null, elevator);
	elevator.text = this.add.text(0 + elevator.bucket.width/2, elevator.bucket.y + elevator.bucket.height/2, elevator.number.toString(), {
		font: '30pt The Girl Next Door',
		fill: '#ffff00'
	}, elevator);
	elevator.text.anchor.setTo(0.5);
	var elevatorAudio = this.add.audio('birdheroElevator', 1);
	var elevatorAudioArrive = this.add.audio('birdheroElevatorArrive', 1);
	var elevatorAudioDown = this.add.audio('birdheroElevatorDown', 1);
	elevator.moveTo = {
		branch: function (target, onComplete) {
			var yPos;
			if (target === 0) {
				elevator.number = 0;
				yPos = coords.tree.elevator;
				elevatorAudioDown.play();
			} else {
				elevator.number += (elevator.number < target) ? 1 : -1;
				yPos = tree.branch[elevator.number-1].visit().y - elevator.rope.height - coords.tree.elevator - elevator.bucket.height;
			}

			_this.add.tween(elevator).to({ y: yPos }, 1000, Phaser.Easing.Quadratic.InOut, true).onComplete.addOnce(function() {
				elevator.text.text = elevator.number.toString();
				if (elevator.number === target) {
					if (target !== 0) { elevatorAudioArrive.play(); }
					if (onComplete) { onComplete(); }
				} else {
					elevatorAudio.play();
					elevator.moveTo.branch(target, onComplete);
				}
			});
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

		bird.moveTo.longElevator(number, function () {
			bird.moveTo.nest(number, function () {

				var result = _this.tryNumber(number);
				if (!result) { /* Correct :) */
					bird.visible = false;
					tree.branch[number-1].celebrate(5).onComplete.add(function () {
						elevator.moveTo.branch(0, function () {
							_this.nextRound();
						});
					});
				} else { /* Incorrect :( */
					if (result < 0) { publish('birdheroTooLow'); }
					else { publish('birdheroTooHigh'); }

					tree.branch[number-1].confused();
					bird.moveTo.longElevator(0, function () {
						bird.moveTo.initial(function () {
							_this.nextRound();
						});
					});
				}
			});
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
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		_this.hudGroup.visible = true;
		buttons.visible = false;
		yesnos.reset();
		yesnos.visible = true;
		_this.disable(false);
	}

	/* Introduce a new bird, aka: start a new round. */
	function newBird (onComplete) {
		bird.x = coords.bird.start.x-elevator.x;
		bird.y = coords.bird.start.y-elevator.y;
		bird.visible = true;
		bird.number = _this.currentNumber;
		bird.tint = tint[bird.number - 1];
		bird.moveTo.initial(function () {
			if (onComplete) { onComplete(); }
		});
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
			agent.visible = false;
		}
		if (tries <= 0) { newBird(showNumbers); }
		else { showNumbers(); }
	};

	this.modePlayerShow = function (intro, tries) {
		_this.disable(true);
		if (intro) {
			_this.hudGroup.visible = false;
			agent.visible = true;
			_this.add.tween(agent).to({ x: coords.agent.stop.x, y: coords.agent.stop.y }, 3000, Phaser.Easing.Quadratic.Out, true).onComplete.addOnce(function () {
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
			agent.visible = true;
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
		x: this.nest.world.x + this.nest.width * this.scale.x,
		y: this.nest.world.y
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
	var beak = game.add.sprite(75, -35, 'birdheroBeak', null, this);
	beak.anchor.setTo(0.5);
	beak.talk = beak.animations.add('talk', null, 4, true);

	this.say = function (what, onComplete) {
		beak.talk.play();
		var s = game.add.sound(what);
		s.onStop = function () {
			beak.talk.stop();
			if (onComplete) { onComplete(); }
		};
		s.play();
	};

	this.turn = function (direction) {
		// Turn by manipulating the scale.
		var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
		return game.add.tween(this.scale).to({ x: newScale }, 200, Phaser.Easing.Linear.None, true);
	};
	this.move = function (properties, duration, onComplete, scale) {
		var t = game.add.tween(this).to(properties, duration, Phaser.Easing.Quadratic.Out);
		if (onComplete) { t.onComplete.add(onComplete); }
		if (scale) {
			t.onStart.addOnce(function () {
				game.add.tween(this.scale).to({ x: (this.scale.x < 0 ? -1 * scale : scale), y: scale }, 2000, Phaser.Easing.Quadratic.Out, true);
			}, this);
		}

		if (properties.x &&                                 // Check if we should turn around
			(properties.x <= this.x && 0 < this.scale.x) || // Going left, scale should be -1
			(this.x <= properties.x && 0 > this.scale.x)) { // Going right, scale should be 1
			this.turn().onComplete.addOnce(function () { t.start(); }, game);
		} else {
			t.start();
		}

		return t;
	};

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