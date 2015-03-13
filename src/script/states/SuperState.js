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
	this.state.onUpdateCallback = function () {};

	var keys = [], key;
	for (var i = 0; i < this.sound._sounds.length; i++) {
		key = this.sound._sounds[i].key;
		if (keys.indexOf(key) < 0 && this.cache._sounds[key]) {
			this.sound.decode(key); // Make sure that decoding has begun.
			keys.push(key);
		}
	}

	document.querySelector('.loading').style.display = 'block';
	document.querySelector('.progress').innerHTML = LANG.TEXT.decoding;

	this.sound.setDecodedCallback(keys, this._soundsDecoded, this);
};

/** This function runs when all sounds have been decoded. */
SuperState.prototype._soundsDecoded = function () {
	document.querySelector('.loading').style.display = 'none';

	if (this.startGame) {
		this.startGame();
	}

	this.state.onUpdateCallback = this.run;
};

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
};