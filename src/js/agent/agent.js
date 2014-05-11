/*
 * The super class for agent objects, see Panda for sub classing reference
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
				wave: { from: -0.1, to: 0.2 }
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
	/*
	this.talk = TweenMax.fromTo({}, 0.2, { frame: 0 }, {
		frame: 1, ease: SteppedEase.config(1), repeat: -1, yoyo: true, paused: true
	});
	*/

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
	// TODO: Copy user's amount of right and wrongs and some randomized element.
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
	return this.lastGuess;
};

/**
 * Make agent happy.
 * @param {number} For how long in seconds (default 3)
 * @returns {Object} The happiness tween
 */
Agent.prototype.happy = function(duration) {
	var dur = 0.2;
	var times = parseInt((duration || 3) / dur);
	times += (times % 2 === 0) ? 1 : 0; // Agent will be strangely positioned if number is not odd.
	return new TweenMax(this, dur, { y: this.y - 100, ease: Power0.easeInOut, repeat: times, yoyo: true });
};

/**
 * Put you hand up in the air and wave it around like you care.
 * @param {number} For how long in seconds (default 3)
 * @param {boolean} If left arm should wave (default false => right arm waves)
 * @returns {Object} The happiness timeline
 */
Agent.prototype.wave = function (duration, waveLeftArm) {
	var dur = 0.5;
	var times = parseInt((duration || 3) / dur) - 2; // -2 for start and stop moves
	times += (times % 2 === 0) ? 1 : 0; // Agent will be strangely positioned if number is not odd.
	var t = new TimelineMax();
	if (waveLeftArm) {
		t.add(new TweenMax(this.leftArm, dur, { rotation: this.coords.anim.arm.wave.from, ease: Power1.easeIn }));
		t.add(new TweenMax(this.leftArm, dur, { rotation: this.coords.anim.arm.wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }));
		t.add(new TweenMax(this.leftArm, dur, { rotation: this.coords.anim.arm.origin, ease: Power1.easeOut }));
	} else {
		t.add(new TweenMax(this.rightArm, dur, { rotation: -this.coords.anim.arm.wave.from, ease: Power1.easeIn }));
		t.add(new TweenMax(this.rightArm, dur, { rotation: -this.coords.anim.arm.wave.to, ease: Power0.easeOut, repeat: times, yoyo: true }));
		t.add(new TweenMax(this.rightArm, dur, { rotation: -this.coords.anim.arm.origin, ease: Power1.easeOut }));
	}
	
	return t;
};

Agent.prototype.walk = function (duration) {
	var dur = 0.2;
	var times = parseInt((duration || 3) / dur);
	times += (times % 2 === 0) ? 1 : 0; // Agent will be strangely positioned if number is not odd.
	var t = new TimelineMax();
	t.add(new TweenMax(this.leftLeg, dur, { y: '-=50', repeat: times-2, yoyo: true }));
	t.add(new TweenMax(this.rightLeg, dur, { y: '-=50', repeat: times-2, yoyo: true }), dur);
	return t;
};

Agent.prototype.move = function (properties, duration, scale) {
	var t = new TimelineMax();
	t.to(this, duration, properties);
	t.add(this.walk(duration), 0);
	if (scale) { t.to(this.scale, duration, { x: scale, y: scale }, 0); }
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
		var a = game.physics.arcade.angleBetween(o, targ);
		var d = game.physics.arcade.distanceBetween(o, targ) / depth;
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

	if (off) {
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