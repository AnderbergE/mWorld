Character.prototype = Object.create(Phaser.Group.prototype);
Character.prototype.constructor = Character;
function Character () {
	Phaser.Group.call(this, game, null); // Parent constructor.
}

/**
 * When you want a sound to be said by a character.
 * If the character has a say talk animation it will be used.
 * @param {String|Object} The sound file or the key to a sound file
 * @param {Object} The speaker, needs to have a '.talk' property of TweenMax or TimelineMax
 * @param {String} If you want the speaker to only talk during a specific marker.
 * @returns {Object} The sound object (not started)
 */
Character.prototype.say = function (what, marker) {
	var a = (typeof what === 'string') ? game.add.audio(what) : what;

	if (this.talk) {
		var current;
		var signals = [];

		var play = function () {
			if (a.currentMarker) {
				current = a.currentMarker;
			}
			if (!marker || current === marker) {
				this.talk.play();
			}
		};

		var pause = function () {
			if (!marker || current === marker) {
				this.talk.pause(0);
			}
		};

		var stop = function () {
			if (!marker || current === marker) {
				this.talk.pause(0);
				while (signals.length > 0) {
					signals[0].detach();
					signals[0]._destroy();
					signals.splice(0, 1);
				}
			}
		};

		signals.push(a.onPlay.add(play, this));
		signals.push(a.onResume.add(play, this));
		signals.push(a.onPause.add(pause, this));
		signals.push(a.onStop.add(stop, this));
	}

	return a;
};

/**
 * Move a character.
 * If the character has the turn property set to true, it will turn according to direction.
 * @param {Object} Properties to tween, set x and/or y to move
 * @param {number} Duration of the move
 * @param {number} If a scaling should happen during the move
 * @returns {Object} The movement timeline
 */
Character.prototype.move = function (properties, duration, scale) {
	properties.ease = properties.ease || Power1.easeInOut;

	var t = new TimelineMax();
	t.to(this, duration, properties);

	if (this.walk) {
		t.addCallback(function () { this.walk.play(); }, 0, null, this);
		t.addCallback(function () { this.walk.pause(0); }, '+=0', null, this);
	}


	var ts = null;
	if (scale) {
		ts = new TweenMax(this.scale, duration, { x: scale, y: scale, ease: properties.ease });
	}

	if (this.turn) {
		var _this = this;
		var turnDuration = 0.2;
		var percentDuration = turnDuration / duration;

		t.add(new TweenMax(this.scale, turnDuration, {
			ease: properties.ease,
			onStart: function () {
				var prop = { x: Math.abs(_this.scale.x), y: Math.abs(_this.scale.y) };

				// Check if we are scaling along with the movement.
				// In that case we scale the turning as well
				if (ts) {
					if (ts.vars.x > _this.scale.x) { // Scaling up
						prop.x += ts.vars.x * percentDuration;
					} else { // Scaling down
						prop.x -= ts.vars.x * percentDuration;
					}
					if (ts.vars.x > _this.scale.x) { // Scaling up
						prop.y += ts.vars.y * percentDuration;
					} else { // Scaling down
						prop.y -= ts.vars.y * percentDuration;
					}
				}

				// Set the scale direction
				// If we do note change x and we are looking left, keep doing it.
				if (typeof properties.x === 'undefined' || properties.x === null ||
					_this.x === properties.x) {
					if (_this.scale.x < 0) {
						prop.x *= -1;
					}
				// If we are going to a position to the left of the current, look left.
				} else if (properties.x < _this.x) {
					prop.x *= -1;
				}

				// Update the turn tween with new values
				this.updateTo({ x: prop.x, y: prop.y });

				// Make sure that a scaling tween has the correct direction
				if (ts && prop.x < 0) {
					ts.updateTo({ x: -1 * ts.vars.x });
				}
			}
		}), 0);

		if (ts) {
			ts.duration(ts.duration() - turnDuration);
			t.add(ts, turnDuration);
		}
	} else if (ts) {
		t.add(ts, 0);
	}

	return t;
};

/**
 * Turn around! Every now and then I get a little bit lonely...
 * NOTE: This only takes into account the state when the function is called.
 *       Making a "toggle turn" inside a Timeline might not have the expected result.
 * @param {number} -1 = left, 1 = right, default: opposite of current
 * @returns {Object} The turning tween
 */
Character.prototype.moveTurn = function (direction) {
	// Turn by manipulating the scale.
	var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
	return new TweenMax(this.scale, 0.2, { x: newScale });
};