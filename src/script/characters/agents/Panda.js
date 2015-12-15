var Agent = require('../Agent.js');
var LANG = require('../../language.js');

module.exports = Panda;

Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;
Panda.prototype.id = 'panda'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 * @param {Boolean} noAudio - Set to true to not load audio.
 */
Panda.load = function(noAudio) {
	this.game.load.atlasJSONHash(Panda.prototype.id, 'img/characters/panda/atlas.png', 'img/characters/panda/atlas.json');
	if (!noAudio) {
		this.game.load.audio(Panda.prototype.id + 'Speech', LANG.SPEECH.panda.speech);
	}
};

/**
 * Unload the assets related to this character.
 * NOTE: Assets will not unload if this is the player's chosen agent.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Panda.unload = function() {
	// Do not remove the assets if this is the player's agent.
	if (!this.game.player.agent || this.game.player.agent.prototype.id !== Panda.prototype.id) {
		this.game.cache.removeSound(Panda.prototype.id + 'Speech');
		this.game.cache.removeImage(Panda.prototype.id);
	}
};

/**
 * The panda agent.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Panda (game, x, y) {
	this.coords = {
		arm: {
			left: { x: -150, y: -20 },
			right: { x: 150, y: -20 }
		},
		leg: {
			left: { x: -130, y: 320 },
			right: { x: 130, y: 320 }
		},
		eye: {
			left: { x: -65, y: -238 },
			right: { x: 65, y: -238 },
			depth: 20,
			maxMove: 9
		},
		mouth: {
			x: 0, y: -142
		},
		hat: { x: 0, y: -380 }
	};

	Agent.call(this, game, x, y); // Call parent constructor.
	return this;
}
