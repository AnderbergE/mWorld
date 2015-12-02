var Agent = require('../Agent.js');
var LANG = require('../../language.js');

module.exports = Panda;

Panda.prototype = Object.create(Agent.prototype);
Panda.prototype.constructor = Panda;

Panda.prototype.id = 'panda'; // Reference for LANG files and asset files

/**
 * The panda agent.
 * The asset files are loaded in the boot state using key: *.prototype.id.
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
		}
	};

	Agent.call(this, game, x, y); // Call parent constructor.
	this.name = LANG.TEXT.pandaName;

	return this;
}
