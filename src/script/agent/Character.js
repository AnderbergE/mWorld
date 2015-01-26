var NumberButton = require('../objects/buttons/NumberButton.js');
var utils = require('../utils.js');

module.exports = Character;

Character.prototype = Object.create(Phaser.Group.prototype);
Character.prototype.constructor = Character;

/**
 * Superclass for characters.
 * @param {Object} game - A reference to the Phaser game.
 */
function Character (game) {
	Phaser.Group.call(this, game, null); // Parent constructor.
}

/**
 * When you want a sound to be said by a character.
 * NOTE: If the character has a this.talk TweenMax or TimelineMax it will be used.
 * @param {string|Object} what - Key to a sound file or the sound object.
 * @param {string} marker - If you want the speaker to only talk during a specific marker.
 * @returns {Object} The sound object (not started).
 */
Character.prototype.say = function (what, marker) {
	var a = (typeof what === 'string') ? this.game.add.audio(what) : what;

	/* Check if character has a talk animation. */
	if (this.talk) {
		var current;
		var signals = [];

		/* Functions to run on audio signals. */
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
 * NOTE: If this.turn property is true, it will turn according to direction.
 * NOTE: If the character has a this.walk TweenMax or TimelineMax it will be used.
 * @param {Object} properties - Properties to tween, set x and/or y to move.
 * @param {number} duration - Duration of the move.
 * @param {number} scale - If a scaling should happen during the move.
 * @returns {Object} The movement timeline.
 */
Character.prototype.move = function (properties, duration, scale) {
	properties.ease = properties.ease || Power1.easeInOut;

	var t = new TimelineMax();
	t.to(this, duration, properties);

	/* Check if character has a walk animation. */
	if (this.walk) {
		t.addCallback(function () { this.walk.play(); }, 0, null, this);
		t.addCallback(function () { this.walk.pause(0); }, '+=0', null, this);
	}

	/* Animate the scale if available. */
	/* Scaling is also how we turn the character, so it gets a bit complicated later... */
	var ts = null;
	if (scale) {
		ts = new TweenMax(this.scale, duration, { x: scale, y: scale, ease: properties.ease });
	}

	/* Check if the character should be turned when moving. */
	if (this.turn) {
		var _this = this;
		var turnDuration = 0.2;
		var percentDuration = turnDuration / duration;

		t.add(new TweenMax(this.scale, turnDuration, {
			ease: properties.ease,
			onStart: function () {
				// The turn tween needs to be updated in real time,
				// otherwise it won't work in Timelines.
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
				// If we do not change x and we are looking left, keep doing it.
				if (typeof properties.x === 'undefined' || properties.x === null ||
					_this.x === properties.x) {
					if (_this.scale.x < 0) {
						prop.x *= -1;
					}
				/* If we are going to a position to the left of the current, look left. */
				} else if (properties.x < _this.x) {
					prop.x *= -1;
				}

				/* Update the turn tween with new values */
				this.updateTo({ x: prop.x, y: prop.y });

				/* Make sure that a scaling tween has the correct direction */
				if (ts && prop.x < 0) {
					ts.updateTo({ x: -1 * ts.vars.x });
				}
			}
		}), 0);

		if (ts) {
			/* Update the duration of scaling and add it. */
			ts.duration(ts.duration() - turnDuration);
			t.add(ts, turnDuration);
		}

	} else if (ts) {
		/* No turning, just add the scaling. */
		t.add(ts, 0);
	}

	return t;
};

/**
 * Turn around! Every now and then I get a little bit lonely...
 * @param {number} direction - -1 = left, 1 = right, default: opposite of current.
 *                             NOTE: This only takes into account the state when the function is called.
 *                             Making a "opposite turn" inside a Timeline might not have the expected result.
 * @returns {Object} The turning tween.
 */
Character.prototype.moveTurn = function (direction) {
	// Turn by manipulating the scale.
	var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
	return new TweenMax(this.scale, 0.2, { x: newScale });
};


/**
 * Add a thought bubble to the agent. Must be called to use the "think" function.
 * NOTE: You can change the scale for the think function by setting the toScale property.
 * @param {number} x - The x position.
 * @param {number} y - The y position.
 * @param {number} representation - The representation of the guess.
 * @param {boolean} mirror - If the thought bubble should be to the right instead of left (default false).
 */
Character.prototype.addThought = function (x, y, representation, mirror) {
	this.thought = this.game.add.group(this);
	this.thought.x = x;
	this.thought.y = y;
	this.thought.visible = false;
	this.thought.toScale = 1;
	this.thought.bubble = this.thought.create(0, 0, 'objects', 'thought_bubble');
	this.thought.bubble.scale.x = 1;
	this.thought.bubble.anchor.set(0.5);
	this.thought.guess = new NumberButton(this.game, 1, representation, {
		x: -60,
		y: -55,
		size: 100,
		disabled: true
	});
	this.thought.add(this.thought.guess);
	if (mirror) {
		this.mirrorThought();
	}
};

/**
 * Mirror the thought bubble 180 degrees horizontally.
 */
Character.prototype.mirrorThought = function () {
	this.thought.guess.x += (this.thought.guess.x > -60) ? -20 : 20;
	this.thought.bubble.scale.x *= -1;
};

/**
 * Animation: Think about the guessed number!
 * NOTE: The addThought must have been called before this function.
 * @returns {Object} The animation timeline.
 */
Character.prototype.think = function () {
	if (typeof this.thought === 'undefined' || this.thought === null) {
		return;
	}

	var t = new TimelineMax();
	t.addCallback(function () { this.thought.guess.visible = false; }, null, null, this);
	t.add(utils.fade(this.thought, true));
	t.add(TweenMax.fromTo(this.thought.scale, 1.5,
		{ x: 0, y: 0 },
		{ x: this.thought.toScale, y: this.thought.toScale, ease: Elastic.easeOut }
	), 0);
	t.add(utils.fade(this.thought.guess, true, 1), 0.5);

	return t;
};