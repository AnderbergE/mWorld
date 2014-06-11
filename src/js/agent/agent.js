/*
 * The super class for agent objects.
 * Set up: .prototype.id = string, for reference in LANG files.
 * 
 * Set up the following in the sub class:
 * this.name
 * this.coords
 * this.body
 * this.leftEye
 * this.rightEye
 *
 * Add sprites to the following:
 * this.leftArm
 * this.rightArm
 * this.leftLeg
 * this.rightLeg
 *
 *
 * See Panda for sub classing inspiration.
 */
Agent.prototype = Object.create(Phaser.Group.prototype);
Agent.prototype.constructor = Agent;
function Agent () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this._knowledge = 0.5;

	this.lastGuess = null;

	this.coords = {
		anim: {
			arm: {
				origin: -0.8,
				wave: { from: -0.1, to: 0.2, durUp: 0.3, dur: 0.2 },
				pump: { angle: 0.5, move: 50, durUp: 0.5, dur: 0.25 },
				water: { angle: 0, back: -2, canAngle: -0.5, durBack: 0.2, durUp: 0.5, durCan: 0.5 }
			}
		}
	};

	this.leftArm = game.add.group(this);
	this.leftArm.rotation = this.coords.anim.arm.origin;
	this.rightArm = game.add.group(this);
	this.rightArm.rotation = -this.coords.anim.arm.origin;
	this.leftLeg = game.add.group(this);
	this.rightLeg = game.add.group(this);

	// TODO: Fix up when agent has a face.
	this.talk = TweenMax.to(this, 0.2, {
		y: '+=5', repeat: -1, yoyo: true, paused: true
	});

	this.walk = new TimelineMax({ repeat: -1, paused: true })
		.to(this.leftLeg, 0.12, { y: '-=50' , ease: Power1.easeInOut, yoyo: true, repeat: 1 }, 0)
		.to(this.rightLeg, 0.12, { y: '-=50' , ease: Power1.easeInOut, yoyo: true, repeat: 1 }, 0.24);

	return this;
}

/**
 * Have the agent guess a number.
 * @param {number} The correct number
 * @param {number} Minimum value to guess
 * @param {number} Maximum value to guess
 * @returns {number} The guess (also available in this.lastGuess)
 */
Agent.prototype.guessNumber = function (correct, min, max) {
	// TODO: How should the AI behave?
	// TODO: Copy player's amount of right and wrongs and some randomized element.
	var range = (max - min);
	var errorRange = parseInt(range - range * this._knowledge);
	var guessRangeMin = correct - errorRange;
	var guessRangeMax = correct + errorRange;
	if (guessRangeMin < min) {
		guessRangeMax += Math.abs(guessRangeMin + min);
		guessRangeMin = min;
	} else if (guessRangeMax > max) {
		guessRangeMin += (guessRangeMax - max);
		guessRangeMax = max;
	}
	this.lastGuess = parseInt(guessRangeMin + Math.random()*(guessRangeMax - guessRangeMin));
	Event.publish(GLOBAL.EVENT.agentGuess, [this.lastGuess, correct]);
	return this.lastGuess;
};

/**
 * Animation: Pump it up yeah!
 * @param {number} Duration in seconds (default 3)
 * @param {number} -1 = left arm, 0 = both, 1 = right arm (default 0)
 * @returns {Object} The animation timeline
 */
Agent.prototype.fistPump = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;

	var origin = this.coords.anim.arm.origin;
	var pump = this.coords.anim.arm.pump;
	var upDown = duration / 4;
	if (upDown > pump.durUp) { upDown = pump.durUp; }
	var times = parseInt((duration - upDown * 2) / pump.dur);
	times += (times % 2 === 0) ? 1 : 0; // Even numbers do not loop back to origin.

	var t = new TimelineMax();
	if (arm <= 0) {
		t.add(new TweenMax(this.leftArm, upDown, { rotation: pump.angle, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.leftArm, pump.dur, { x: '+=' + pump.move, y: '+=' + pump.move, ease: Power1.easeIn, repeat: times, yoyo: true }), 0);
		t.add(new TweenMax(this.leftArm, upDown, { rotation: origin, ease: Power1.easeOut }), pump.dur * times);
	}
	if (arm >= 0) {
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -pump.angle, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.rightArm, pump.dur, { x: '-=' + pump.move, y: '+=' + pump.move, ease: Power1.easeIn, repeat: times, yoyo: true }), 0);
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -origin, ease: Power1.easeOut }), pump.dur * times);
	}
	return t;
};

/**
 * Animation: Put you hand up in the air and wave it around like you care.
 * @param {number} Duration in seconds (default 3)
 * @param {number} -1 = left arm, 0 = both, 1 = right arm (default 0)
 * @returns {Object} The animation timeline
 */
Agent.prototype.wave = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;

	var origin = this.coords.anim.arm.origin;
	var wave = this.coords.anim.arm.wave;
	var upDown = duration / 4;
	if (upDown > wave.durUp) { upDown = wave.durUp; }
	var times = parseInt((duration - upDown * 2) / wave.dur);
	times += (times % 2 === 0) ? 1 : 0; // Even numbers do not loop back to origin.

	var t = new TimelineMax();
	if (arm <= 0) {
		t.add(new TweenMax(this.leftArm, upDown, { rotation: wave.from, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.leftArm, wave.dur, { rotation: wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }), upDown);
		t.add(new TweenMax(this.leftArm, upDown, { rotation: origin, ease: Power1.easeOut }), wave.dur * times + upDown);
	}
	if (arm >= 0) {
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -wave.from, ease: Power1.easeIn }), 0);
		t.add(new TweenMax(this.rightArm, wave.dur, { rotation: -wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }), upDown);
		t.add(new TweenMax(this.rightArm, upDown, { rotation: -origin, ease: Power1.easeOut }), wave.dur * times + upDown);
	}
	return t;
};

Agent.prototype.water = function (duration, arm) {
	duration = duration || 3;
	arm = arm || 0;

	var origin = this.coords.anim.arm.origin;
	var water = this.coords.anim.arm.water;

	var t = new TimelineMax();
	if (arm <= 0) {
		var w1 = new WaterCan(-this.leftArm.children[0].width+60, -100);
		w1.scale.set(-3, 3);
		w1.rotation = 0;
		w1.visible = false;
		this.leftArm.add(w1);
		t.add(new TweenMax(this.leftArm, water.durBack, { rotation: water.back, ease: Power1.easeIn }));
		t.addCallback(function () { w1.visible = true; });
		t.add(new TweenMax(this.leftArm, water.durUp, { rotation: water.angle, ease: Power1.easeOut }));
		t.add(new TweenMax(w1, water.durCan, { rotation: water.canAngle }));
		t.addCallback(this.eyesFollowObject, null, [w1.can], this);
		t.addLabel('watering');
		t.add(w1.pour(duration));
		t.addCallback(this.eyesFollowObject, null, [null], this);
		t.add(new TweenMax(this.leftArm, water.durUp, { rotation: water.back, ease: Power1.easeIn }));
		t.addCallback(function () { w1.destroy(); });
		t.add(new TweenMax(this.leftArm, water.durBack, { rotation: origin, ease: Power1.easeOut }));
	}
	if (arm >= 0) {
		var w2 = new WaterCan(-this.rightArm.children[0].width-60, -100);
		w2.scale.set(3, 3);
		w2.rotation = 0;
		w2.visible = false;
		this.rightArm.add(w2);
		t.add(new TweenMax(this.rightArm, water.durBack, { rotation: -water.back, ease: Power1.easeIn }));
		t.addCallback(function () { w2.visible = true; });
		t.add(new TweenMax(this.rightArm, water.durUp, { rotation: -water.angle, ease: Power1.easeOut }));
		t.add(new TweenMax(w2, water.durCan, { rotation: -water.canAngle }));
		t.addCallback(this.eyesFollowObject, null, [w2.can], this);
		t.addLabel('watering');
		t.add(w2.pour(duration));
		t.addCallback(this.eyesFollowObject, null, [null], this);
		t.add(new TweenMax(this.rightArm, water.durUp, { rotation: -water.back, ease: Power1.easeIn }));
		t.addCallback(function () { w2.destroy(); });
		t.add(new TweenMax(this.rightArm, water.durBack, { rotation: -origin, ease: Power1.easeOut }));
	}
	return t;
};

Agent.prototype.move = function (properties, duration, scale) {
	properties.ease = properties.ease || Power1.easeInOut;
	var t = new TimelineMax({
		onStart: function () { this.walk.play(); }, onStartScope: this,
		onComplete: function () { this.walk.pause(0); }, onCompleteScope: this
	});
	t.to(this, duration, properties);
	if (scale) { t.to(this.scale, duration, { x: scale, y: scale, ease: properties.ease }, 0); }
	return t;
};

/* Private. Have an eye follow a target. */
Agent.prototype._eyeFollow = function (eye, targ) {
	var origin = { x: eye.x, y: eye.y };
	var depth = this.coords.eye.depth;
	var maxMove = this.coords.eye.maxMove;
	var agent = this;

	/* Update functions trigger on every game loop */
	eye.update = function () {
		if (!agent.visible) { return; }

		var o = this.world;
		var a = game.physics.arcade.angleBetween(o, targ.world ? targ.world : targ);
		var d = game.physics.arcade.distanceBetween(o, targ.world ? targ.world : targ) / depth;
		if (d > maxMove) { d = maxMove; }
		this.x = Math.cos(a) * d + origin.x;
		this.y = Math.sin(a) * d + origin.y;
	};
};

/**
 * Make the agent's eyes follow an object.
 * @param {Object} The target to follow
 * @param {boolean} true to turn off following object
 */
Agent.prototype.eyesFollowObject = function (targ, off) {
	this.leftEye.x = this.coords.eye.left.x;
	this.leftEye.y = this.coords.eye.left.y;
	this.rightEye.x = this.coords.eye.right.x;
	this.rightEye.y = this.coords.eye.right.y;

	if (off || !targ) {
		this.leftEye.update = function () {};
		this.rightEye.update = function () {};
	} else {
		this._eyeFollow(this.leftEye, targ);
		this._eyeFollow(this.rightEye, targ);
	}
};

/**
 * Make the agent's eyes follow the input pointer.
 * @param {boolean} true to turn off following pointer
 */
Agent.prototype.eyesFollowPointer = function (off) {
	this.eyesFollowObject(game.input.activePointer, off);
};