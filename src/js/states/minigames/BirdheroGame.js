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
		0, this.world.height-100, this.world.width, 75, 'wood');
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(GLOBAL.NUMBER_REPRESENTATION.yesno, 2,
		0, this.world.height-100, this.world.width, 75, 'wood');
	this.hudGroup.add(yesnos);

	// When pushing a button in the HUD:
	var buttonFunction = null;
	this.addEvent(GLOBAL.EVENT.numberPress, function(value) {
		buttonFunction(value);
	});

	/* Function to trigger when a number button is pushed */
	function pushNumber (number) {
		_this.disable(true);

		// Alas, callback hell is upon us :(
		bird.moveTo.elevator(function () {
			bird.moveTo.peak(true, function () {
				elevator.moveTo.branch(number, function () {
					bird.moveTo.peak(false, function () {
						bird.moveTo.nest(number, function () {
							if (_this.tryNumber(number)) {
								bird.visible = false;
								elevator.moveTo.branch(0, function () {
									_this.nextRound();
								});
							} else {
								bird.moveTo.elevator(function () {
									bird.moveTo.peak(true, function () {
										elevator.moveTo.branch(0, function () {
											bird.moveTo.peak(false, function () {
												bird.moveTo.initial(function () {
													_this.nextRound();
												});
											});
										});
									});
								});
							}
						});
					});
				});
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
		buttonFunction = pushNumber;
		_this.hudGroup.visible = true;
		buttons.reset();
		buttons.visible = true;
		yesnos.visible = false;
		_this.disable(false);
	}
	/* Show the yes/no panel, hide the number panel and enable input */
	function showYesnos () {
		buttonFunction = pushYesno;
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
			_this.state.start(GLOBAL.VIEW.garden);
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

BirdheroBranch.prototype.celebrate = function () {
	game.add.tween(this.mother).to({ y: this.mother.y+10 }, 200, Phaser.Easing.Linear.None, true, 0, 11, true);
};