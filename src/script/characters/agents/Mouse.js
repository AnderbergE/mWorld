var Agent = require('../Agent.js');
var LANG = require('../../language.js');

module.exports = Mouse;

Mouse.prototype = Object.create(Agent.prototype);
Mouse.prototype.constructor = Mouse;
Mouse.prototype.id = 'mouse'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 * @param {Boolean} noAudio - Set to true to not load audio.
 */
Mouse.load = function(noAudio) {
	this.game.load.atlasJSONHash(Mouse.prototype.id, 'img/characters/mouse/atlas.png', 'img/characters/mouse/atlas.json');
	if (!noAudio) {
		this.game.load.audio(Mouse.prototype.id + 'Speech', LANG.SPEECH.mouse.speech);
	}
};

/**
 * Unload the assets related to this character.
 * NOTE: Assets will not unload if this is the player's chosen agent.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Mouse.unload = function() {
	// Do not remove the assets if this is the player's agent.
	if (!this.game.player.agent || this.game.player.agent.prototype.id !== Mouse.prototype.id) {
		this.game.cache.removeSound(Mouse.prototype.id + 'Speech');
		this.game.cache.removeImage(Mouse.prototype.id);
	}
};

/**
 * The mouse agent.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Mouse (game, x, y) {
	this.coords = {
		arm: {
			left: { x: -110, y: -40 },
			right: { x: 110, y: -40 }
		},
		leg: {
			left: { x: -150, y: 350 },
			right: { x: 150, y: 350 }
		},
		eye: {
			left: { x: -50, y: -240 },
			right: { x: 50, y: -240 },
			depth: 20,
			maxMove: 9
		},
		mouth: {
			x: 0, y: -150
		},
		hat: { x: 0, y: -330 }
	};

	Agent.call(this, game, x, y); // Call parent constructor.
	this.name = LANG.TEXT.mouseName;

	var leftEyeSocket = this.create(this.coords.eye.left.x + 1, this.coords.eye.left.y - 8, this.id, 'socket');
	leftEyeSocket.anchor.set(0.5);
	this.bringToTop(this.leftEye);

	var rightEyeSocket = this.create(this.coords.eye.right.x - 1, this.coords.eye.right.y - 8, this.id, 'socket');
	rightEyeSocket.anchor.set(0.5);
	rightEyeSocket.scale.set(-1, 1);
	this.bringToTop(this.rightEye);

	var nose = this.create(this.coords.mouth.x - 1, this.coords.mouth.y - 17, this.id, 'nose');
	nose.anchor.set(0.5);

	return this;
}
