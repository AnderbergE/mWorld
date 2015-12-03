var Agent = require('../Agent.js');
var LANG = require('../../language.js');

module.exports = Hedgehog;

Hedgehog.prototype = Object.create(Agent.prototype);
Hedgehog.prototype.constructor = Hedgehog;
Hedgehog.prototype.id = 'hedgehog'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 * @param {Boolean} noAudio - Set to true to not load audio.
 */
Hedgehog.load = function(noAudio) {
	this.game.load.atlasJSONHash(Hedgehog.prototype.id, 'img/characters/hedgehog/atlas.png', 'img/characters/hedgehog/atlas.json');
	if (!noAudio) {
		this.game.load.audio(Hedgehog.prototype.id + 'Speech', LANG.SPEECH.hedgehog.speech);
	}
};

/**
 * Unload the assets related to this character.
 * NOTE: Assets will not unload if this is the player's chosen agent.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Hedgehog.unload = function() {
	// Do not remove the assets if this is the player's agent.
	if (!this.game.player.agent || this.game.player.agent.prototype.id !== Hedgehog.prototype.id) {
		this.game.cache.removeSound(Hedgehog.prototype.id + 'Speech');
		this.game.cache.removeImage(Hedgehog.prototype.id);
	}
};

/**
 * The hedgehog agent.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Hedgehog (game, x, y) {
	this.coords = {
		arm: {
			left: { x: -100, y: -80 },
			right: { x: 100, y: -80 }
		},
		leg: {
			left: { x: -150, y: 300 },
			right: { x: 150, y: 300 }
		},
		eye: {
			left: { x: -53, y: -272 },
			right: { x: 35, y: -272 },
			depth: 20,
			maxMove: 7
		},
		mouth: {
			x: -6, y: -205
		}
	};

	Agent.call(this, game, x, y); // Call parent constructor.

	var leftEyeSocket = this.create(this.coords.eye.left.x + 1, this.coords.eye.left.y - 8, this.id, 'socket');
	leftEyeSocket.anchor.set(0.5);
	this.bringToTop(this.leftEye);

	var rightEyeSocket = this.create(this.coords.eye.right.x - 1, this.coords.eye.right.y - 8, this.id, 'socket');
	rightEyeSocket.anchor.set(0.5);
	rightEyeSocket.scale.set(-1, 1);
	this.bringToTop(this.rightEye);

	var nose = this.create(this.coords.mouth.x - 2, this.coords.mouth.y - 15, this.id, 'nose');
	nose.anchor.set(0.5);

	var back = this.create(0, 0, this.id, 'back');
	back.anchor.set(0.5);
	this.sendToBack(back);

	return this;
}
