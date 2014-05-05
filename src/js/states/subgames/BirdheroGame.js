/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                             Bird Hero game                                */
/* Representations: All
/* Range:           1--9
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/
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
	this.load.image('birdheroArrow',   'assets/img/subgames/birdhero/arrow.png');
	this.load.spritesheet('birdheroBeak', 'assets/img/subgames/birdhero/beak.png', 31, 33);

	this.load.audio('birdheroMusic',          ['assets/audio/subgames/birdhero/bg.mp3', 'assets/audio/subgames/birdhero/bg.ogg']);
	this.load.audio('birdheroElevator',       ['assets/audio/subgames/birdhero/elevator.mp3', 'assets/audio/subgames/birdhero/elevator.ogg']);
	this.load.audio('birdheroElevatorArrive', ['assets/audio/subgames/birdhero/elevator_arrive.mp3', 'assets/audio/subgames/birdhero/elevator_arrive.ogg']);
	this.load.audio('birdheroElevatorDown',   ['assets/audio/subgames/birdhero/elevator_down.mp3', 'assets/audio/subgames/birdhero/elevator_down.ogg']);
	this.load.audio('birdheroCorrect',        ['assets/audio/subgames/birdhero/correct.mp3', 'assets/audio/subgames/birdhero/correct.ogg']);
	this.load.audio('birdheroIntro',          ['assets/audio/subgames/birdhero/intro.mp3', 'assets/audio/subgames/birdhero/intro.ogg']);
	this.load.audio('birdheroEnding',         ['assets/audio/subgames/birdhero/ending.mp3', 'assets/audio/subgames/birdhero/ending.ogg']);
	this.load.audio('birdheroInstruction1a',  ['assets/audio/subgames/birdhero/instruction_1a.mp3', 'assets/audio/subgames/birdhero/instruction_1a.ogg']);
	this.load.audio('birdheroInstruction1b',  ['assets/audio/subgames/birdhero/instruction_1b.mp3', 'assets/audio/subgames/birdhero/instruction_1b.ogg']);
	this.load.audio('birdheroInstruction2',   ['assets/audio/subgames/birdhero/instruction_2.mp3', 'assets/audio/subgames/birdhero/instruction_2.ogg']);
	this.load.audio('birdheroScream',         ['assets/audio/subgames/birdhero/scream.mp3', 'assets/audio/subgames/birdhero/scream.ogg']);
	this.load.audio('birdheroThisFloor',      ['assets/audio/subgames/birdhero/this_floor.mp3', 'assets/audio/subgames/birdhero/this_floor.ogg']);
	this.load.audio('birdheroWrongHigher',    ['assets/audio/subgames/birdhero/wrong_higher.mp3', 'assets/audio/subgames/birdhero/wrong_higher.ogg']);
	this.load.audio('birdheroWrongLower',     ['assets/audio/subgames/birdhero/wrong_lower.mp3', 'assets/audio/subgames/birdhero/wrong_lower.ogg']);
	this.load.audio('birdheroAgentShow',      ['assets/audio/agent/panda/hello.mp3', 'assets/audio/agent/panda/hello.ogg']);
	this.load.audio('birdheroAgentTry',       ['assets/audio/agent/panda/i_try.mp3', 'assets/audio/agent/panda/i_try.ogg']);
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
			stop: { x: 150, y: 500 },
			scale: 0.1
		}
	};
	var tint = [
		0xffffff, 0xffcccc, 0xccffcc, 0xccccff, 0xffffcc,
		0xffccff, 0xccffff, 0x5555cc, 0x55cc55, 0xcc5555
	];
	this.music = this.add.audio('birdheroMusic', 1, true);


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
	var buttons = new ButtonPanel(this.amount, this.representation, {
		y: this.world.height-(this.representation.length*75)-25, background: 'wood', onClick: pushNumber
	});
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		y: this.world.height-100, background: 'wood', onClick: pushYesno
	});
	this.hudGroup.add(yesnos);


	// Add Timeline/Tween functions
	bird.moveTo = {
		initial: function () {
			return bird.move({ x: coords.bird.stop.x, y: coords.bird.stop.y }, 2, 1);
		},
		elevator: function () {
			return bird.move({ x: elevator.bucket.x+elevator.bucket.width/2, y: elevator.bucket.y+elevator.bucket.height/2 }, 2, coords.bird.scale);
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

		var result = _this.tryNumber(number);
		var branch = tree.branch[number-1];

		var up = new TimelineMax();
		up.add(bird.moveTo.elevator());
		up.add(bird.moveTo.peak(true));
		up.add(elevator.moveTo.branch(number));
		up.add(bird.moveTo.peak(false));
		up.add(bird.moveTo.nest(number));

		if (!result) { /* Correct :) */
			up.addCallback(function () {
				bird.visible = false;
				branch.celebrate();
			});
			up.add(_this.addWater(branch.mother.world.x, branch.mother.world.y));
			up.add(elevator.moveTo.bottom());
			up.addCallback(function () {
				_this.nextRound();
			});
		} else { /* Incorrect :( */
			up.addCallback(function () {
				if (result < 0) { publish('birdheroTooLow'); }
				else { publish('birdheroTooHigh'); }
				branch.confused();
			});
			up.add(bird.moveTo.elevator());
			up.add(bird.moveTo.peak(true));
			up.add(elevator.moveTo.bottom());
			up.add(bird.moveTo.peak(false));
			up.add(bird.moveTo.initial());
			up.addCallback(function () {
				bird.turn(1);
				_this.nextRound();
			});
		}
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
		press = new NumberButton(_this.agent.lastGuess, _this.representation, { x: 200, y: 200 });
		_this.hudGroup.add(press);
		showYesnos();
	}

	function instructionIntro () {
		var t = new TimelineMax();
		t.addSound('birdheroInstruction1a', bird);
		t.add(bird.pointAtFeathers());
		t.addSound('birdheroInstruction1b', bird);
		return t;
	}


	/* Overshadowing of the mode related functions */
	this.modeIntro = function () {
		_this.hudGroup.visible = false;

		var sound = _this.add.audio('birdheroIntro');
		sound.play();
		var group = _this.add.group(_this.gameGroup);
		var t = new TimelineMax();

		// Create each chick that will be blown away
		var starter = function (chick, branch) {
			branch.chicks = 0;
			chick.visible = true;
		};
		for (var i = 0; i < tree.branch.length; i++) {
			tree.branch[i].chicks = 1;
			var chick = new BirdheroBird(tint[i]);
			chick.visible = false;
			for (var j in chick.children) {
				// Translate positions for rotation effect
				chick.children[j].x += 300;
				chick.children[j].y += 300;
			}
			var pos = tree.branch[i].chickPos();
			chick.x = pos.x - 35; // Counter-effect translate
			chick.y = pos.y - 20; // Counter-effect translate
			chick.scale.x = coords.bird.scale;
			chick.scale.y = coords.bird.scale;
			group.add(chick);
			t.add(new TweenMax(chick, 7, {
				x: -500,
				y: game.world.height - Math.random()*150,
				angle: 1080 + Math.random()*2160,
				ease: Power0.easeIn,
				onStart: starter,
				onStartParams: [chick, tree.branch[i]]
			}), 5.5);
		}

		var darkness = new Cover('#000077', 0);
		t.add(new TweenMax(darkness, 1.5, { alpha: 0.3 }), 3.5);
		t.add(new TweenMax(darkness, 1, { alpha: 0 }), 12);
		group.add(darkness);

		var emitter;
		t.addCallback(function () {
			// Make it rain!
			var bmd = new Phaser.BitmapData(game, '', 6, 6);
			var half = bmd.width/2;
			bmd.ctx.fillStyle = '#2266cc';
			bmd.ctx.beginPath();
			bmd.ctx.arc(half, half, half, 0, 2*Math.PI);
			bmd.ctx.closePath();
			bmd.ctx.fill();

			emitter = game.add.emitter(game.world.centerX, -10, 5000);
			emitter.width = game.world.width*1.5;
			emitter.makeParticles(bmd);
			emitter.setScale(0.5, 1, 0.5, 1);
			emitter.setYSpeed(500, 700);
			emitter.setXSpeed(-300, -400);
			emitter.setRotation(0, 0);
			emitter.start(false, 1000, 25, 200); // It will take 200*25 to reach 5000 = 5s
		}, 4);

		t.call(function () {
			sound.stop();
			emitter.destroy(true);
			darkness.destroy(true);
			group.destroy(true);
			_this.nextMode();
			_this.nextRound();
		});
	};

	this.modePlayerDo = function (intro, tries) {
		_this.disable(true);
		this.music.play();
		if (intro) {
			_this.hudGroup.visible = false;
			_this.agent.visible = false;
			newBird(function () {
				instructionIntro().addCallback(function () { showNumbers(); });
			});
		} else {
			if (tries <= 0) { newBird(showNumbers); }
			else { showNumbers(); }
		}
	};

	this.modePlayerShow = function (intro, tries) {
		_this.disable(true);
		if (intro) {
			_this.hudGroup.visible = false;
			_this.agent.visible = true;
			var t = new TimelineMax();
			t.add(new TweenMax(_this.agent, 3, { x: coords.agent.stop.x, y: coords.agent.stop.y }));
			t.addSound('birdheroAgentShow', _this.agent);
			t.addCallback(function () { newBird(showNumbers); });
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
			var t = new TimelineMax();
			t.addSound('birdheroAgentTry', _this.agent);
			t.addCallback(function () { newBird(agentGuess); });
		} else {
			if (intro || tries <= 0) { newBird(agentGuess); }
			else { agentGuess(); }
		}
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

	this._chicks = [];

	return this;
}
Object.defineProperty(BirdheroBranch.prototype, 'chicks', {
	get: function() { return this._chicks.length; },
	set: function(value) {
		var change = value - this._chicks.length;
		var dir = change > 0 ? -1 : 1;
		while (change !== 0) {
			if (dir < 0) {
				var chick = game.add.sprite(this.mother.x, this.nest.y, 'birdheroChick', null, this);
				chick.x += this._chicks.length * chick.width * 0.8;
				chick.y -= chick.height * 0.8;
				chick.tint = this.mother.tint;
				this._chicks.push(chick);
			} else {
				this._chicks.pop().destroy();
			}
			change += dir;
		}
		this.nest.bringToTop();
	}
});

/** @returns {Object} The x, y coordinates of where the chick is */
BirdheroBranch.prototype.chickPos = function () {
	return {
		x: this.x + this._chicks[0].x * this.scale.x,
		y: this.y + this._chicks[0].y
	};
};

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
	return new TweenMax(this.mother, 0.2, { y: this.mother.y - 5, ease: Power0.easeInOut, repeat: times, yoyo: true });
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
	return new TweenMax(this.confusing, 0.2, { y: this.confusing.y - 5, repeat: times, yoyo: true,
		onComplete: function () { _this.confusing.visible = false; }
	});
};


/* The bird that you are helping home */
BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;
function BirdheroBird (tint) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.number = null;

	this.body = game.add.sprite(0, 0, 'birdheroBird', null, this);
	this.body.anchor.setTo(0.5);
	this.beak = game.add.sprite(75, -35, 'birdheroBeak', null, this);
	this.beak.anchor.setTo(0.5);
	this.beak.talk = this.beak.animations.add('talk', null, 4, true);

	this.tint = tint || 0xffffff;

	/* For instructions */
	this.arrow = game.add.sprite(0, 0, 'birdheroArrow', null, this);
	this.arrow.visible = false;

	return this;
}
Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() { return this.body.tint; },
	set: function(value) { this.body.tint = value; }
});

BirdheroBird.prototype.featherPositions = [
	{ x: 140, y: 0 }, // 1
	{ x: 130, y: 10 }, // 2
	{ x: 120, y: 20 }, // 3
	{ x: 110, y: 30 }, // 4
	{ x: 100, y: 40 }, // 5
	{ x: -50,  y: 0 }, // 6
	{ x: -40,  y: 10 }, // 7
	{ x: -30,  y: 20 }, // 8
	{ x: -20,  y: 30 }  // 9
];

/**
 * It's a flying, talking birdie!
 * @param {string} The key to a sound file
 * @returns {Object} The sound object (not started)
 */
BirdheroBird.prototype.say = function (what) {
	this.beak.talk.play();
	var s = game.add.sound(what);
	s.onStop.add(function () {
		this.beak.talk.stop(true); // TODO: This should set frame to 0, but it does not.
		this.beak.frame = 0;
	}, this);
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
	var t = new TimelineMax();
	t.addLabel('mover'); // Add a label in beginning, use it for simultaneous tweening.
	t.to(this, duration, properties, 'mover');
	t.addCallback(function () {
		var dir = this.scale.x < 0;
		if (properties.x &&                                 // Check if we should turn around
			(properties.x <= this.x && 0 < this.scale.x) || // Going left, scale should be -1
			(this.x <= properties.x && 0 > this.scale.x)) { // Going right, scale should be 1
			dir = !dir;
			t.add(this.turn(), 'mover');
		}
		if (scale) {
			t.to(this.scale, duration,
				{ x: (dir ? -1 * scale : scale), y: scale },
				'-=' + (duration - 0.2));
		}
	}, 'mover', null, this);

	return t;
};

BirdheroBird.prototype.pointAtFeathers = function () {
	var t = new TimelineMax();
	var arrow = this.arrow;
	var offset = 30;
	t.addCallback(function () { arrow.visible = true; });

	arrow.x = this.featherPositions[0].x + offset; // Set start position
	arrow.y = this.featherPositions[0].y;
	// TODO: solve for > 5
	for (var i = 0; i < this.number; i++) {
		if (i !== 0) { t.add(new TweenMax(arrow, 0.3, { x: '+=' + offset, y: '+=5' })); }
		t.add(new TweenMax(arrow, 0.7, { x: this.featherPositions[i].x, y: this.featherPositions[i].y }));
	}

	t.addCallback(function () { arrow.visible = false; });
	return t;
};