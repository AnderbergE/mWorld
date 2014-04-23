Agent.prototype = Object.create(Phaser.Group.prototype);
Agent.prototype.constructor = Agent;

function Agent () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.knowledge = 0.5;
	this.lastGuess = null;
	this.tweens = {};

	/* Set up the following in the sub class (see Panda for reference) */
	// this.coords
	// this.leftEye
	// this.rightEye

	return this;
}

Agent.prototype.destroy = function () {
	// Do not remove the agent if it is in a group somewhere.
	if (this.parent) {
		this.parent.remove(this);
		for (var tween in this.tweens) {
			this.tweens[tween].stop();
			delete this.tweens[tween];
		}
	} else {
		Phaser.Group.prototype.destroy.call(this);
	}
};

Agent.prototype.guessNumber = function (correct, min, max) {
	var range = (max - min);
	var errorRange = parseInt(range - range * this.knowledge);
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

Agent.prototype.setHappy = function (on) {
	if (on) {
		if (!this.tweens.happy) {
			this.tweens.happy = game.add.tween(this);
			this.tweens.happy.to({ y: this.y + 100 }, 200, Phaser.Easing.Linear.None, true, 0, 1111, true);
		}
	} else if (this.tweens.happy) {
		// This will stop the tween where it started and remove it from the Tween manager.
		this.tweens.happy.repeat(this.tweens.happy._repeat%2);
	}
};

Agent.prototype._eyeFollow = function (eye, targ) {
	var origin = { x: eye.x, y: eye.y };
	var depth = this.coords.eye.depth;
	var maxMove = this.coords.eye.maxMove;
	var agent = this;
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

Agent.prototype.eyesFollowMouse = function (off) {
	this.eyesFollowObject(game.input.activePointer, off);
};