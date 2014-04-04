/* Bird Hero game */
BirdheroGame.prototype = Object.create(Minigame.prototype);
BirdheroGame.prototype.constructor = BirdheroGame;

function BirdheroGame () {
	Minigame.call(this); // Call parent constructor.
}

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
};

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
			stop: { x: 50, y: 500 }
		}
	};
	var tint = [
		0xffffff, 0xffcccc, 0xccffcc, 0xccccff, 0xffffcc,
		0xffccff, 0xccffff, 0x5555cc, 0x55cc55, 0xcc5555
	];
	var bgMusic = this.add.audio('birdheroIntro', 1, true);

	// Add main game
	this.add.sprite(0, 0, 'birdheroBg', null, this.gameGroup);

	// Agent is added to the game in the superclass, so set up correct start point.
	var agent = this.agent.gfx;
	agent.x = coords.agent.start.x;
	agent.y = coords.agent.start.y;
	agent.scale.x = coords.agent.scale;
	agent.scale.y = coords.agent.scale;
	this.gameGroup.bringToTop(agent);

	// Create bird, it is added to the elevator group below since we need it to be "in" the elevator.
	// Since the bird is in the elevator group, we need to offset for that when moving it.
	var bird = new BirdheroBird();
	bird.visible = false;
	bird.moveTo = {
		initial: function (onComplete) {
			var t = _this.add.tween(bird).to({ x: coords.agent.stop.x-elevator.x, y: coords.agent.stop.y-elevator.y }, 2000, Phaser.Easing.Quadratic.Out, true);
			_this.add.tween(bird.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Quadratic.Out, true);
			if (onComplete) { t.onComplete.add(onComplete); }
		},
		elevator: function (onComplete) {
			var t = _this.add.tween(bird).to({ x: elevator.bucket.world.x-elevator.x+5, y: elevator.bucket.world.y-elevator.y }, 2000, Phaser.Easing.Quadratic.Out, true);
			_this.add.tween(bird.scale).to({ x: 0.1, y: 0.1 }, 2000, Phaser.Easing.Quadratic.Out, true);
			if (onComplete) { t.onComplete.add(onComplete); }
		},
		peak: function (up, onComplete) {
			var t = _this.add.tween(bird).to({ y: (up ? '-18' : '+18') }, 500, Phaser.Easing.Quadratic.Out, true);
			if (onComplete) { t.onComplete.add(onComplete); }
		},
		nest: function (target, onComplete) {
			var t = _this.add.tween(bird).to({ x: tree.branch[target-1].nest.world.x-elevator.x, y: tree.branch[target-1].nest.world.y-elevator.y }, 1000, Phaser.Easing.Quadratic.Out, true);
			if (onComplete) { t.onComplete.add(onComplete); }
		}
	};

	// Setup tree and its branches
	var tree = this.add.sprite(coords.tree.x, coords.tree.y, 'birdheroBole', null, this.gameGroup);
	tree.branch = [this.amount];
	var treeBottom = tree.y + tree.height - 150;
	var treeCenter = tree.x + 215;
	var heightPerBranch = (tree.height - 220)/this.amount;
	for (var i = 0; i < this.amount; i++) {
		var branchGroup = this.add.group(this.gameGroup);
		branchGroup.x = treeCenter;
		branchGroup.y = (treeBottom - heightPerBranch*i);
		tree.branch[i] = this.add.sprite(0, 0, 'birdheroBranch' + i%3, null, branchGroup);
		tree.branch[i].x -= tree.branch[i].width;
		tree.branch[i].nest = this.add.sprite(tree.branch[i].x + 60, tree.branch[i].y + tree.branch[i].height * 0.4, 'birdheroNest', null, branchGroup);
		tree.branch[i].nest.bird = this.add.sprite(tree.branch[i].nest.x + tree.branch[i].nest.width/5, tree.branch[i].nest.y, 'birdheroMother', null, branchGroup);
		tree.branch[i].nest.bird.tint = tint[i];
		tree.branch[i].nest.bird.y -= tree.branch[i].nest.bird.height*0.7;
		tree.branch[i].nest.bringToTop();
		branchGroup.scale.x = i % 2 ? 1 : -1;
	}
	tree.bringToTop();

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
	elevator.moveTo = {
		branch: function (target, onComplete) {
			if (elevator.number === target) {
				if (onComplete) { onComplete(); }
				return;
			}

			var yPos;
			if (target === 0) {
				elevator.number = 0;
				yPos = coords.tree.elevator;
			} else {
				elevator.number += (elevator.number < target) ? 1 : -1;
				yPos = tree.branch[elevator.number-1].world.y - elevator.rope.height - coords.tree.elevator;
			}
			_this.add.tween(elevator).to({ y: yPos }, 1000, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function() {
				elevator.text.text = elevator.number.toString();
				elevator.moveTo.branch(target, onComplete);
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
	var buttonFunction = null;

	// Game related functions
	function pushNumber (number) {
		_this.input.disabled = true;
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
											bird.moveTo.initial(function () {
												_this.nextRound();
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
	function pushYesno (value) {
		if (!value) { showNumbers(); }
		else { pushNumber(_this.agent.lastGuess); }
	}

	function showNumbers () {
		buttonFunction = pushNumber;
		_this.hudGroup.visible = true;
		buttons.visible = true;
		yesnos.visible = false;
		_this.input.disabled = false;
	}
	function showYesnos () {
		buttonFunction = pushYesno;
		_this.hudGroup.visible = true;
		buttons.visible = false;
		yesnos.visible = true;
		_this.input.disabled = false;
	}

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

	function agentGuess () {
		_this.agent.guessNumber(_this.currentNumber, 1, _this.amount);
		if (press) { _this.hudGroup.remove(press); }
		press = new NumberButton(_this.agent.lastGuess, _this.representation, 200, 200);
		_this.hudGroup.add(press);
		showYesnos();
	}

	// Minigame related functions
	this.modeIntro = function () {
		bgMusic.play();
		_this.input.disabled = true;
		_this.hudGroup.visible = false;

		setTimeout(function () {
			_this.nextMode();
			_this.nextRound();
		}, 1000);
	};

	this.modePlayerOnly = function () {
		_this.input.disabled = true;
		if (_this.introduceMode) {
			_this.hudGroup.visible = false;
			agent.visible = false;
		}
		if (_this.currentTries <= 0) { newBird(showNumbers); }
		else { showNumbers(); }
	};
	this.modeAgentWatch = function () {
		_this.input.disabled = true;
		if (_this.introduceMode) {
			_this.hudGroup.visible = false;
			agent.visible = true;
			this.add.tween(agent).to({ x: coords.agent.stop.x, y: coords.agent.stop.y }, 3000, Phaser.Easing.Quadratic.Out, true).onComplete.add(function () {
				newBird(showNumbers);
			});
		} else {
			if (_this.currentTries <= 0) { newBird(showNumbers); }
			else { showNumbers(); }
		}
	};
	// TODO: Debug section begin, remove later.
	var press = null;
	// TODO: Debug section stop, remove later.
	this.modeAgentTrying = function () {
		_this.input.disabled = true;
		if (_this.introduceMode) {
			_this.hudGroup.visible = false;
			agent.visible = true;
		}

		if (_this.introduceMode || _this.currentTries <= 0) { newBird(agentGuess); }
		else { agentGuess(); }
	};
	this.modeAgentOnly = function () {
		_this.input.disabled = true;
		_this.hudGroup.visible = false;
		buttons.visible = false;
		yesnos.visible = false;

		if (_this.introduceMode || _this.currentTries <= 0) {
			newBird(function () { pushNumber(_this.agent.guessNumber(_this.currentNumber, 1, _this.amount)); });
		}
		else { pushNumber(_this.agent.guessNumber(_this.currentNumber, 1, _this.amount)); }
	};

	this.modeOutro = function () {
		_this.input.disabled = true;
		_this.hudGroup.visible = false;
		_this.agent.setHappy(true);
		setTimeout(function () {
			bgMusic.stop();
			publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.home]);
		}, 1000);
	};

	// Event subscriptions
	this.addEvent(GLOBAL.EVENT.numberPress, function(value) {
		buttonFunction(value);
	});

	// Start up!
	this.startGame();
};