/* The super class for agent objects, see Panda for sub classing reference */
Agent.prototype = Object.create(Phaser.Group.prototype);
Agent.prototype.constructor = Agent;
function Agent () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this._knowledge = 0.5;

	this.lastGuess = null;

	/* Set up the following in the sub class (see Panda for reference) */
	// this.coords
	// this.leftEye
	// this.rightEye

	return this;
}

/* Called from the game when a minigame ends */
Agent.prototype.destroy = function () {
	// Do not remove the agent if it is in a group somewhere.
	if (this.parent) {
		this.parent.remove(this);
		this.eyesFollowObject(null, false);
	} else {
		Phaser.Group.prototype.destroy.call(this);
	}
};

/**
 * Have the agent guess a number.
 * @param {number} The correct number
 * @param {number} Minimum value to guess
 * @param {number} Maximum value to guess
 * @returns {number} The guess
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
 * @param {number} For how long
 * @returns {Object} The happiness tween (not started)
 */
Agent.prototype.happy = function(duration) {
	duration = duration || 3000;
	var times = parseInt(duration / 200);
	times += (times % 2 === 0) ? 1 : 0; // Agent will be strangely positioned if number is not odd.
	return game.add.tween(this).to({ y: this.y + 100 }, 200, Phaser.Easing.Linear.None, false, 0, times, true);
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