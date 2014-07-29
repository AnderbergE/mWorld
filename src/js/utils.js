/** 
 * An easy-to-use counter with a max value.
 *
 * @constructor
 * @param {integer} The max value for the counter.
 * @param {boolean} If the counter should loop back to 0 when reaching max value (default is false).
 * @param {integer} The start value the first loop (default is 0).
 */
function Counter (max, loop, start) {
	/**
	 * @property {boolean} _loop - If the counter should loop.
	 * @default false
	 * @private
	 */
	this._loop = loop || false;

	/**
	 * @property {number} _value - The value of the counter.
	 * @default 0
	 * @private
	 */
	this._value = start || 0;


	/**
	 * @property {number} max - The max value of the counter.
	 */
	this.max = max;

	/**
	 * @property {function} onAdd - A function to run when adding water.
	 */
	this.onAdd = null;

	/**
	 * @property {function} onMax - A function to run when water is at max.
	 */
	this.onMax = null;

	return this;
}

/**
 * @property {number} left - Value left until max.
 */
Object.defineProperty(Counter.prototype, 'left', {
	get: function() { return this.max - this._value; },
});

/**
 * @property {number} value - The value of the counter.
 *                            This will fire onAdd and onMax when applicable.
 */
Object.defineProperty(Counter.prototype, 'value', {
	get: function() { return this._value; },

	set: function(value) {
		var diff = value - this._value;
		this._value = value;

		if (this.onAdd) { this.onAdd(this._value, diff, this.left); }

		if (this._value >= this.max) {
			if (this._loop) { this._value = 0; }
			if (this.onMax) { this.onMax(this._value); }
		}
	}
});

/** Calls the onAdd function with current values. */
Counter.prototype.update = function () {
	if (this.onAdd) { this.onAdd(this._value, 0, this.left); }
};


/**
 * Fade in or out an object.
 * @param {Object} The object to fade, needs to have an alpha property.
 * @param {boolean} Fade in = true, out = false, toggle = undefined (default: toggle).
 *                  NOTE: The returned tween has both an onStart and onComplete function.
 * @param {number} Fade duration in seconds (default: 0.5).
 *                 NOTE: The tween will have 0 duration if fade state is correct.
 * @returns {Object} The animation TweenMax.
 */
function fade (what, typ, duration) {
	var toggle = (typeof typ === 'undefined' || typ === null);
	duration = duration || 0.5;

	return TweenMax.to(what, duration, {
		onStart: function () {
			if (toggle) {
				typ = !what.visible || what.alpha === 0;
			}

			if (typ) {
				if (!what.visible) {
					what.alpha = 0;
					what.visible = true;
				} else if (what.alpha === 1) {
					this.duration(0);
					return;
				}
				what.visible = true;
				this.updateTo({ alpha: 1 });

			} else {
				if (what.visible || what.alpha > 0) {
					this.updateTo({ alpha: 0});
				} else {
					this.duration(0);
				}
			}
		},
		onComplete: function () {
			if (!typ) {
				what.visible = false;
			}
		}
	});
}

/**
 * Utility function: Call this upon state shutdown.
 * Publishes stateShutDown event.
 */
function onShutDown () {
	TweenMax.killAll();
	this.sound.stopAll();
	this.sound.onSoundDecode.removeAll();
	EventSystem.publish(GLOBAL.EVENT.stateShutDown, this);
	EventSystem.clear();
}

/**
 * Check if all sound files have been decoded.
 * NOTE: This will not start decoding. So if you turn off autodecode you
 * need to start it yourself.
 * @returns {Object} True if all sounds are decoded, otherwise false.
 */
Phaser.SoundManager.prototype.checkSoundsDecoded = function () {
	for (var key in this.game.cache._sounds) {
		if (!this.game.cache.isSoundDecoded(key)) {
			return false;
		}
	}
	return true;
};

/**
 * Run a function when all sounds have been decoded.
 * @param {function} The function to run.
 */
Phaser.SoundManager.prototype.whenSoundsDecoded = function (func) {
	if (this.checkSoundsDecoded()) {
		func();

	} else {
		var loader = document.querySelector('.loading').style;
		loader.display = 'block';
		document.querySelector('.progress').innerHTML = 'Decoding';

		var c = function () {
			if (this.checkSoundsDecoded()) {
				this.onSoundDecode.remove(c);
				func();
				loader.display = 'none';
			}
		};
		this.onSoundDecode.add(c, this);
	}
};

/**
 * A function to easily add sound to a tween timeline.
 * @param {string|Object} The name of the sound file, or the sound object, to play.
 * @param {Object} If someone should say it (object must have "say" function).
 * @param {string} For playing a specific marker in a sound file.
 * @returns {Object} The TimelineMax object.
 */
TimelineMax.prototype.addSound = function (what, who, marker, position) {
	var a = (who && who.say) ? who.say(what, marker) :
		((typeof what === 'string') ? game.add.audio(what) : what);

	if (typeof position === 'undefined' || position === null) {
		position = '+=0';
	}

	var end;
	if (marker) {
		this.addCallback(function () { a.play(marker); }, position);
		end = a.markers[marker].duration;
	} else {
		this.addCallback(function () { a.play(); }, position);
		end = game.cache.getSound(a.key).data.duration;
	}

	if (isNaN(position)) {
		end = '+=' + (parseFloat(position.substr(2)) + end);
	} else {
		end += position;
	}
	this.addCallback(function () { a.stop(); }, end);

	return this;
};

/**
 * Skip a timeline.
 * Publishes skippable event.
 * NOTE: You can not skip part of a timeline.
 * NOTE: See menu object for more information about skipping.
 */
TimelineMax.prototype.skippable = function () {
	this.addCallback(function () {
		EventSystem.publish(GLOBAL.EVENT.skippable, [this]);
		this.addCallback(function () { EventSystem.publish(GLOBAL.EVENT.skippable); });
	}, 0, null, this);
	return this;
};

/**
 * When you want a yoyo animation to go back to the beginning.
 * @param {number} The total duration for the animation.
 * @param {number} The duration of one direction (half of the loop from start back to start).
 * @return {number} The amount of times to repeat the animation
 */
TweenMax.prototype.calcYoyo = function (total, each) {
	var times = parseInt(total / each);
	return times + (times % 2 === 0 ? 1 : 0); // Odd number will make the animation return to origin.
};

/**
 * Make an animation loop from start back to the origin.
 * @param {number} The total duration of the animation.
 *                 NOTE: This is not exact time, depending on how well animation duration and total match.
 * @return {Object} The TweenMax object.
 */
TweenMax.prototype.backForth = function (total) {
	this.yoyo(true);
	this.repeat(this.calcYoyo(total, this.duration()));
	return this;
};

/**
 * Adds a rounded rectangle to the built-in rendering context.
 * @param {number} The x position
 * @param {number} The y position
 * @param {number} The width
 * @param {number} The height
 * @param {number} The radius
 * @returns {Object} The CanvasRenderingContext2D object
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) { r = w / 2; }
	if (h < 2 * r) { r = h / 2; }
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y,   x+w, y+h, r);
	this.arcTo(x+w, y+h, x,   y+h, r);
	this.arcTo(x,   y+h, x,   y,   r);
	this.arcTo(x,   y,   x+w, y,   r);
	this.closePath();
	return this;
};

/**
 * @property {number} PI2 - Math.PI * 2.
 */
Math.PI2 = Math.PI*2;