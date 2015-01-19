var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var GeneralButton = require('../objects/buttons/GeneralButton.js');

module.exports = SuperState;

/**
 * The boot state will load the first parts of the game and common game assets.
 * Add assets that will be used by many states.
 */
function SuperState () {}

/**
 * Check if all sound files have been decoded.
 * NOTE: This will not start decoding. So if you turn off autodecode you
 * need to start it yourself.
 * @return {Object} True if all sounds are decoded, otherwise false.
 */
SuperState.prototype.checkSoundsDecoded = function () {
	for (var key in this.game.cache._sounds) {
		if (!this.game.cache.isSoundDecoded(key)) {
			this.sound.decode(key);
			return false;
		}
	}
	return true;
};

/**
 * Run a function when all sounds have been decoded.
 * NOTE: If you debug between loading audio and decoding, this function does
 * not work. Reason is unknown.
 */
SuperState.prototype.update = function () {
	var loader = document.querySelector('.loading').style;

	if (this.checkSoundsDecoded()) {
		this.state.onUpdateCallback = this.run;
		loader.display = 'none';
		if (this.startGame) {
			this.startGame();
		}

	} else {
		loader.display = 'block';
		document.querySelector('.progress').innerHTML = LANG.TEXT.decoding;
	}
};

/**
 * Run a function when all sounds have been decoded.
 * NOTE: If you debug between loading audio and decoding, this function does
 * not work. Reason is unknown.
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