function Agent () {
	var _this = this;
	this.knowledge = 0.5;
	this.lastGuess = null;
	this.tweens = {};
	this.gfx = new Phaser.Group(game, null, 'agent');
	this.gfx.destroy = function () {
		// Do not remove the agent if it is in a group somewhere.
		if (this.parent) {
			this.parent.remove(this);
			for (var tween in _this.tweens) {
				_this.tweens[tween].stop();
				delete _this.tweens[tween];
			}
		} else {
			Phaser.Group.prototype.destroy.call(this);
		}
	};

	return this;
}

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
			this.tweens.happy = game.add.tween(this.gfx);
			this.tweens.happy.to({ y: this.gfx.y + 100 }, 200, Phaser.Easing.Linear.None, true, 0, 1111, true);
			// Make sure that we remove the tween when it is complete.
			var _this = this;
			this.tweens.happy.onComplete.add(function () {
				delete _this.tweens.happy;
			}, true);
		}
	} else if (this.tweens.happy) {
		// This will stop the tween where it started and remove it from the Tween manager.
		this.tweens.happy.repeat(this.tweens.happy._repeat%2);
	}
};

Agent.prototype._eyeFollow = function (eye, targ) {
	var origin = { x: eye.x, y: eye.y };
	eye.update = function () {
		var o = this.world;
		var a = game.physics.arcade.angleBetween(o, targ);
		var d = game.physics.arcade.distanceBetween(o, targ)/eye.depth;
		if (d > eye.maxMove) { d = eye.maxMove; }
		this.x = Math.cos(a) * d + origin.x;
		this.y = Math.sin(a) * d + origin.y;
	};
};

Agent.prototype.eyesFollowObject = function (targ, off) {
	if (off) {
		this.gfx.leftEye.update = function () {};
		this.gfx.rightEye.update = function () {};
	} else {
		this._eyeFollow(this.gfx.leftEye, targ);
		this._eyeFollow(this.gfx.rightEye, targ);
	}
};

Agent.prototype.eyesFollowMouse = function (off) {
	this.eyesFollowObject(game.input.activePointer, off);
};