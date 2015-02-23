var GLOBAL = require('./global.js');
var EventSystem = require('./pubsub.js');

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
exports.fade = function (what, typ, duration, to) {
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
};

/**
 * Easily tween an objects tint. It tweens from the current tint value.
 * @param {Object} what - The object to fade, needs to have an alpha property.
 * @param {number} toColor - The color to fade to.
 * @param {number} duration - Tween duration in seconds (default: 1).
 * @return {Object} The animation TweenMax.
 */
exports.tweenTint = function (what, toColor, duration) {
	duration = duration || 1;
	var color = Phaser.Color.getRGB(what.tint);
	var endColor =  Phaser.Color.getRGB(toColor);

	return TweenMax.to(color, duration, {
		r: endColor.r,
		g: endColor.g,
		b: endColor.b,
		onUpdate: function () {
			what.tint = Phaser.Color.getColor(color.r, color.g, color.b);
		}
	});
};

/**
 * Easily create an audio sheet.
 * @param {string} key - The key of the audio object.
 * @param {Object} markers - The Markers of the audio object.
 * @return {Object} The audio object.
 */
exports.createAudioSheet = function (key, markers) {
	var a = GLOBAL.game.add.audio(key);
	for (var marker in markers) {
		a.addMarker(marker, markers[marker][0], markers[marker][1]);
	}
	return a;
};

/**
* Creates a new Sound object as background music
*
* @method Phaser.GameObjectFactory#music
* @param {string} key - The Game.cache key of the sound that this object will use.
* @param {number} [volume=1] - The volume at which the sound will be played.
* @param {boolean} [loop=false] - Whether or not the sound will loop.
* @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
* @return {Phaser.Sound} The newly created text object.
*/
Phaser.GameObjectFactory.prototype.music = function (key, volume, loop, connect) {
	var music = this.game.sound.add(key, volume, loop, connect);
	music.volume = music.maxVolume * this.game.sound.bgVolume;
	this.game.sound._music.push(music);
	return music;
};

/**
* @name Phaser.SoundManager#fgVolume
* @property {number} fgVolume - Gets or sets the foreground volume of the SoundManager, a value between 0 and 1.
*/
Object.defineProperty(Phaser.SoundManager.prototype, 'fgVolume', {
	get: function () {
		return this._fgVolume;
	},
	set: function (value) {
		this._fgVolume = value;
		for (var i = 0; i < this._sounds.length; i++) {
			if (this._music.indexOf(this._sounds[i]) < 0) {
				this._sounds[i].volume = this._sounds[i].maxVolume * value;
			}
		}
	}
});

/**
* @name Phaser.SoundManager#bgVolume
* @property {number} bgVolume - Gets or sets the background volume of the SoundManager, a value between 0 and 1.
*/
Object.defineProperty(Phaser.SoundManager.prototype, 'bgVolume', {
	get: function () {
		return this._bgVolume;
	},
	set: function (value) {
		this._bgVolume = value;
		for (var i = 0; i < this._sounds.length; i++) {
			if (this._music.indexOf(this._sounds[i]) >= 0) {
				this._sounds[i].volume = this._sounds[i].maxVolume * value;
			}
		}
	}
});

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * @param {Array} The array to shuffle. (Use .splice(0) if you need to copy an array.)
 * @returns {Array} The input array in shuffled order.
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
 * A function to easily add sound to a tween timeline.
 * @param {string|Object} what - The name of the sound file, or the sound object, to play.
 * @param {Object} who - If someone should say it (object must have "say" function) (optional).
 * @param {string} marker - For playing a specific marker in a sound file (optional).
 * @param {number} position - The position to put the sound (default is '+=0').
 * @return {Object} The TimelineMax object.
 */
TimelineMax.prototype.addSound = function (what, who, marker, position) {
	var a = (who && who.say) ? who.say(what, marker) :
		((typeof what === 'string') ? GLOBAL.game.add.audio(what) : what);

	if (typeof position === 'undefined' || position === null) {
		position = '+=0';
	}

	var end;
	if (marker) {
		this.addCallback(function () { a.play(marker); }, position);
		end = a.markers[marker].duration;
	} else {
		this.addCallback(function () { a.play(); }, position);
		end = GLOBAL.game.cache.getSound(a.key).data.duration;
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
 * @returns: 'this' TimelineMax object, enables chaining.
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