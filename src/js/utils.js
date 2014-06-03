/** 
 * A utility object to create counter with a max value.
 * Properties:
 * max:   What the max value is.
 * value: The current value of the counter. Setting it triggers onAdd function and possibly onMax.
 * left:  How much is left to max.

 * @param {integer} The max value for the counter.
 * @param {boolean} If the counter should loop back to 0 when reaching max value.
 * @param {integer} The start value the first loop.
 */
function Counter (max, loop, start) {
	this._loop = loop || false;

	this.max = max;
	this._value = start || 0;

	this.onAdd = null;
	this.onMax = null;

	return this;
}
Object.defineProperty(Counter.prototype, 'left', {
	get: function() { return this.max - this._value; },
});
Object.defineProperty(Counter.prototype, 'value', {
	get: function() { return this._value; },
	set: function(value) {
		this._value = value;
		if (this.onAdd) { this.onAdd(this._value, this.left); }

		if (this._value >= this.max) {
			if (this._loop) { this._value = 0; }
			if (this.onMax) { this.onMax(this._value); }
		}
	}
});

/** Calls the onAdd function. */
Counter.prototype.update = function () {
	if (this.onAdd) { this.onAdd(this._value, this.left); }
};


/**
 * Utility function: When you want a sound to be said by a character.
 * @param {Object|string} The sound file or the key to a sound file
 * @param {Object} The speaker, needs to have a '.talk' property of TweenMax or TimelineMax
 * @param {String} If you want the speaker to only talk during a specific marker.
 * @returns {Object} The sound object (not started)
 */
function say (what, who, marker) {
	var a = (typeof what === 'string') ? game.add.audio(what) : what;
	if (who && who.talk) {
		var play = function () {
			if (!marker || a.currentMarker === marker) {
				who.talk.play();
			}
		};
		var stop = function () {
			if (!marker || a.currentMarker === marker) {
				who.talk.pause(0);
				// TODO: this is always false, framework issue:
				// https://github.com/photonstorm/phaser/issues/868
				if (!a.paused) {
					a.onPlay.remove(play);
					a.onResume.remove(play);
					if (marker) {
						a.onMarkerComplete.remove(stop);
					} else {
						a.onStop.remove(stop);
					}
				}
			}
		};

		a.onPlay.add(play);
		a.onResume.add(play);
		if (marker) {
			/* We need to use this to get correct currentMarker in stop function */
			a.onMarkerComplete.add(stop);
		} else {
			a.onStop.add(stop);
		}
	}
	return a;
}


/**
 * Utility function: Fade in or out an object.
 * @param {Object} The object to fade, needs to have an alpha property
 * @param {boolean} Fade in = true, out = false, toggle = undefined (default: toggle)
 *                  NOTE: When false, the returned tween has an onComplete function.
 * @param {number} Fade duration in seconds (default: 0.5)
 * @returns {Object} The TweenMax object
 *                   NOTE: If the object is already in correct fade state,
 *                         no animation will be made, an "empty" tween is returned.
 */
function fade (what, typ, duration) {
	typ = (typeof typ === 'undefined' || typ === null) ? !what.visible : typ;
	duration = duration || 0.5;

	if (typ) {
		if (!what.visible || what.alpha < 1) {
			what.visible = true;
			return TweenMax.fromTo(what, duration, { alpha: 0 }, { alpha: 1 });
		}
	} else if (what.visible || what.alpha > 0) {
		return TweenMax.to(what, duration,
			{ alpha: 0, onComplete: function () { what.visible = false; } });
	}
	return new TweenMax(what);
}

/**
 * Utility function: Call this upon state shutdown.
 */
function onShutDown () {
	TweenMax.killAll();
	this.sound.stopAll();
	Event.clear();
}


/**
 * A function to easily add sound to a tween timeline.
 * @param {String|Object} The name of the sound file, or the sound object, to play
 * @param {Object} If someone should say it (object must have "say" function)
 * @param {String} For playing a specific marker in a sound file
 */
TimelineMax.prototype.addSound = function (what, who, marker) {
	var a = say(what, who, marker);
	if (marker) {
		this.addCallback(function () { a.play(marker); });
		this.addCallback(function () { a.stop(); }, '+=' + a.markers[marker].duration);
	} else {
		this.addCallback(function () { a.play(); });
		this.addCallback(function () { a.stop(); }, '+=' + game.cache.getSound(what).data.duration);
	}
	return this;
};


/** Adds a rounded rectangle to the built-in rendering context. */
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