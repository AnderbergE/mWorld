var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var GeneralButton = require('../objects/buttons/GeneralButton.js');

module.exports = SuperState;

/**
 * The boot state will load the first parts of the game and common game assets.
 * Add assets that will be used by many states.
 * NOTE: Do not overshadow the update function! Use 'run' instead.
 */
function SuperState () {}

/**
 * Update will trigger after create. But sounds might not be decoded yet, so we wait for that.
 * NOTE: Do not overshadow the update function! Use 'run' instead.
 */
SuperState.prototype.update = function () {
	this.input.enabled = true;

	this.state.onUpdateCallback = function () {};

	var keys = [], key;
	for (var i = 0; i < this.sound._sounds.length; i++) {
		key = this.sound._sounds[i].key;
		if (keys.indexOf(key) < 0 && this.cache.checkSoundKey(key)) {
			this.sound.decode(key); // Make sure that decoding has begun.
			keys.push(key);
		}
	}

	document.querySelector('.loading').style.display = 'block';
	document.querySelector('.progress').innerHTML = LANG.TEXT.decoding;

	this.sound.setDecodedCallback(keys, soundsDecoded, this);
};

/**
 * This function runs when all sounds have been decoded.
 * @private
 */
function soundsDecoded () {
	document.querySelector('.loading').style.display = 'none';

	if (this.startGame) {
		this.startGame();
	}

	this.state.onUpdateCallback = this.run;
}

/**
 * Overshadow this function for use of the update loop.
 * This will be set when all sounds have been decoded.
 */
SuperState.prototype.run = function () {};

/**
 * Utility function: Call this upon state shutdown.
 * Publishes stateShutDown event.
 */
SuperState.prototype.shutdown = function () {
	this.input.enabled = false;

	TweenMax.killAll();
	EventSystem.publish(GLOBAL.EVENT.stateShutDown, this);
	EventSystem.clear();
	GeneralButton.prototype.buttonColor = GLOBAL.BUTTON_COLOR;

	clearBitmaps(this.world);

	// Purge all "this" variables.
	for (var key in this) {
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

	clearCache.call(this);

	this.state._clearCache = true;

	// Reset world and camera.
	this.world.width = this.game.width;
	this.world.height = this.game.height;
	this.camera.x = 0;
	this.camera.y = 0;
};

function clearBitmaps (group) {
	// TODO: This will hopefully be unnecessary when this is fixed:
	// https://github.com/photonstorm/phaser/issues/2261
	for (var i = 0; i < group.children.length; i++) {
		var child = group.children[i];
		if (child.children) {
			clearBitmaps(child);
		}

		if (child.key && child.key instanceof Phaser.BitmapData) {
			child.key.destroy();
		}
	}
}

// Purge cache.
// NOTE: Do not use built in cache clear since there is a need to keep some of them.
function clearCache () {
	// Purge sound
	var key = this.sound._sounds.length;
	while (key--) {
		this.sound._sounds[key].destroy(true);
	}

	for (var i = 0; i < this.cache._cacheMap.length; i++) {
		var cache = this.cache._cacheMap[i];
		for (key in cache) {
			if (key !== '__default' && key !== '__missing' && this.cache._doNotDelete.indexOf(key) < 0) {
				if (cache[key].destroy) {
					cache[key].destroy();
				}

				delete cache[key];
			}
		}
	}
}
