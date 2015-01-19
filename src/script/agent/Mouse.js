var Agent = require('./Agent.js');
var LANG = require('../language.js');

module.exports = Mouse;

Mouse.prototype = Object.create(Agent.prototype);
Mouse.prototype.constructor = Mouse;

Mouse.prototype.id = 'mouse'; // Reference for LANG files and asset files
Mouse.prototype.agentName = LANG.TEXT.mouseName;

/**
 * The mouse agent.
 * The asset files are loaded in the boot state using key: *.prototype.id.
 * @param {Object} game - A reference to the Phaser game.
 * @return Itself
 */
function Mouse (game) {
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
		}
	};

	Agent.call(this, game); // Call parent constructor.

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