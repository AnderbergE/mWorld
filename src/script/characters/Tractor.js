var Character = require('./Character.js');

module.exports = Tractor;

Tractor.prototype = Object.create(Character.prototype);
Tractor.prototype.constructor = Tractor;
Tractor.prototype.id = 'tractor'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Tractor.load = function() {
	this.game.load.atlasJSONHash(Tractor.prototype.id, 'img/characters/tractor/atlas.png', 'img/characters/tractor/atlas.json');
};

Tractor.prototype.pos = {
	eyeNeutralPos: { x: 55, y: -103 },
	eyeAgentPos: { x: 54, y: -108 },
	eyeCranePos: { x: 52, y: -105 }
};

/**
 * The tractor that you are helping to load the trailer.
 * @constructor
 * @param {Object} game - The game object.
 * @param {number} x - The x position.
 * @param {number} y - The y position.
 * @return {Object} Itself.
 */
function Tractor (game, x, y) {
	Character.call(this, game, x, y, true); // Parent constructor.

	this.body = this.game.add.sprite(0, 0, this.id, 'tractor', this);
	this.body.anchor.set(0, 1);
	this.eyes = this.game.add.sprite(this.pos.eyeNeutralPos.x, this.pos.eyeNeutralPos.y, this.id, 'tractor_eyes', this);
	this.eyes.anchor.set(0.5, 0.5);
	this.mouth = this.game.add.sprite(52, -70, this.id, 'tractor_happy', this);
	this.mouth.anchor.set(0.5, 0);

	this.talk = TweenMax.to(this.mouth, 0.2, {
		frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	});

	return this;
}

/**
 * Set the tractors eyes to look at the crane.
 * @return {Object} The animation timeline.
 */
Tractor.prototype.lookAtCrane = function ()
{
	var t = new TimelineMax();

	t.to(this.eyes, 0.6, { x: this.pos.eyeCranePos.x, y: this.pos.eyeCranePos.y, ease: Power1.easeInOut });

	return t;
};

/**
 * Set the tractors eyes to look at the agent.
 * @return {Object} The animation timeline.
 */
Tractor.prototype.lookAtAgent = function ()
{
	var t = new TimelineMax();

	t.to(this.eyes, 0.4, { x: this.pos.eyeAgentPos.x, y: this.pos.eyeAgentPos.y, ease: Power1.easeInOut });

	return t;
};

/**
 * Set the cranes eyes to look at the user.
 * @return {Object} The animation timeline.
 */
Tractor.prototype.lookAtUser = function ()
{
	var t = new TimelineMax();

	t.to(this.eyes, 0.4, { x: this.pos.eyeNeutralPos.x, y: this.pos.eyeNeutralPos.y, ease: Power1.easeInOut });

	return t;
};
