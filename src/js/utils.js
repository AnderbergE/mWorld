/** 
 * An easy-to-use counter with a max value.
 *
 * @constructor
 * @param {integer} max - The max value for the counter.
 * @param {boolean} loop - If the counter should loop back to 0 when reaching max value (default is false).
 * @param {integer} start - The start value the first loop (default is 0).
 * @return {Counter} This object.
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
 * @readonly
 */
Object.defineProperty(Counter.prototype, 'left', {
	get: function() {
		return this.max - this._value;
	}
});

/**
 * @property {number} value - The value of the counter.
 *                            This will fire onAdd and onMax when applicable.
 */
Object.defineProperty(Counter.prototype, 'value', {
	get: function() {
		return this._value;
	},
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
 * NOTE: The returned tween has both an onStart and onComplete function.
 * @param {Object} what - The object to fade, needs to have an alpha property.
 * @param {boolean} typ - Fade in = true, out = false, toggle = undefined (default: toggle).
 * @param {number} duration - Fade duration in seconds (default: 0.5).
 *                            NOTE: The tween will have 0 duration if state is correct.
 * @param {number} to - The alpha to fade to (only used when fading in) (default: 1).
 *                      NOTE: You can fade to a lower alpha using fade in.
 * @return {Object} The animation TweenMax.
 */
function fade (what, typ, duration, to) {
	duration = duration || 0.5;

	return TweenMax.to(what, duration, {
		onStart: function () {
			/* If this object is fading, stop it! */
			if (what.isFading) {
				what.isFading.kill();
			}

			/* No specified type: Toggle the current one. */
			if (typeof typ === 'undefined' || typ === null) {
				typ = !what.visible || what.alpha === 0;
			}

			/* Not visible? Set alpha to 0 and make it visible if it should be. */
			if (!what.visible) {
				what.alpha = 0;
				if (typ) {
					what.visible = true;
				}
			}

			/* If we are fading in, fade to the specified alpha, otherwise 0. */
			to = typ > 0 ? (to || 1) : 0;
			if (what.alpha !== to) {
				this.updateTo({ alpha: to });
			} else {
				/* We are already at correct state, cut the duration. */
				this.duration(0);
			}

			what.isFading = this;
		},
		onComplete: function () {
			if (!typ) {
				what.visible = false;
			}
			delete what.isFading;
		}
	});
}

/**
 * Easily tween an objects tint. It tweens from the current tint value.
 * @param {Object} what - The object to fade, needs to have an alpha property.
 * @param {number} toColor - The color to fade to.
 * @param {number} duration - Tween duration in seconds (default: 1).
 * @return {Object} The animation TweenMax.
 */
function tweenTint (what, toColor, duration) {
	duration = duration || 1;

	return TweenMax.to(what, duration, {
		onUpdate: function (start, end) {
			what.tint = Phaser.Color.interpolateColor(start, end, 255, Math.floor(255*this.progress()));
		},
		onUpdateParams: [what.tint, toColor]
	});
}

/**
 * Easily create an audio sheet.
 * @param {string} key - The key of the audio object.
 * @param {Object} markers - The Markers of the audio object.
 * @return {Object} The audio object.
 */
function createAudioSheet (key, markers) {
	var a = game.add.audio(key);
	for (var marker in markers) {
		a.addMarker(marker, markers[marker][0], markers[marker][1]);
	}
	return a;
}

/**
 * Utility function: Call this upon state shutdown.
 * Publishes stateShutDown event.
 */
function onShutDown () {
	TweenMax.killAll();
	EventSystem.publish(GLOBAL.EVENT.stateShutDown, this);
	EventSystem.clear();
	GeneralButton.prototype.buttonColor = GLOBAL.BUTTON_COLOR;

	var key = this.sound._sounds.length;
	while (key--) {
		this.sound._sounds[key].destroy(true);
	}
	for (key in this) {
		if (GLOBAL.STATE_KEYS.indexOf(key) < 0) {
			if (this[key] && this[key].destroy) {
				try {
					this[key].destroy(true);
				}
				catch (e) {
					// Don't care about errors here.
					// console.log(e);
				}
			}
			delete this[key];
		}
	}
	this.world.removeAll(true);
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * @param {Array} The array to shuffle. (Use .splice(0) if you need to copy an array.)
 */
Phaser.RandomDataGenerator.prototype.shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

/**
 * Check if all sound files have been decoded.
 * NOTE: This will not start decoding. So if you turn off autodecode you
 * need to start it yourself.
 * @return {Object} True if all sounds are decoded, otherwise false.
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
 * NOTE: If you debug between loading audio and decoding, this function does
 * not work. Reason is unknown.
 * @param {function} func - The function to run.
 */
Phaser.SoundManager.prototype.whenSoundsDecoded = function (func) {
	if (this.checkSoundsDecoded()) {
		func();

	} else {
		var loader = document.querySelector('.loading').style;
		loader.display = 'block';
		document.querySelector('.progress').innerHTML = LANG.TEXT.decoding;

		var c = function () {
			if (this.checkSoundsDecoded()) {
				this.onSoundDecode.remove(c, this);
				func();
				loader.display = 'none';
			}
		};
		this.onSoundDecode.add(c, this);
	}
};

/**
 * A function to easily add sound to a tween timeline.
 * @param {string|Object} what - The name of the sound file, or the sound object, to play.
 * @param {Object} who - If someone should say it (object must have "say" function) (optional).
 * @param {string} marker - For playing a specific marker in a sound file (optional).
 * @param {number} position - The position to put the sound (default is '+=0').
 * @return {Object} The TimelineMax object.
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
		// The position might be a label. Try to get its position.
		var label = this.getLabelTime(position);
		if (label >= 0) {
			// Label present, add to its time.
			end = label + end;
		} else {
			// Relative position.
			var time = parseFloat(position.substr(0, 1) + position.substr(2)) + end;
			end = (time < 0 ? '-=' : '+=') + Math.abs(time);
		}
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
 * @param {number} total - The total duration for the animation.
 * @param {number} each - The duration of one direction (half of the loop from start back to start).
 * @return {number} The amount of times to repeat the animation
 */
TweenMax.prototype.calcYoyo = function (total, each) {
	var times = parseInt(total / each);
	return times + (times % 2 === 0 ? 1 : 0); // Odd number will make the animation return to origin.
};

/**
 * Make an animation loop from start back to the origin.
 * @param {number} total - The total duration of the animation.
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
 * @param {number} x - The x position
 * @param {number} y - The y position
 * @param {number} w - The width
 * @param {number} h - The height
 * @param {number} r - The radius
 * @return {Object} The CanvasRenderingContext2D object
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