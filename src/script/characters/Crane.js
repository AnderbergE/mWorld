var Character = require('./Character.js');

module.exports = Crane;

Crane.prototype = Object.create(Character.prototype);
Crane.prototype.constructor = Crane;
Crane.prototype.id = 'crane'; // Reference for LANG files and asset files

/**
 * Load the assets related to this character.
 * NOTE: You have to call this function with .call(this). (Where this has this.game).
 */
Crane.load = function() {
	this.game.load.atlasJSONHash(Crane.prototype.id, 'img/characters/crane/atlas.png', 'img/characters/crane/atlas.json');
};

Crane.prototype.pos = {
	craneArmHeight: 540,
	craneTrolleyStart: 310,
	hookDefaultPos: 300,
	hookTravelPos: 360,
	hookHeight: 69,
	hookThickness: 13,
	cargonetHeight: 109,
	eyeNeutralPos: { x: 179, y: -362 },
	eyeTractorPos: { x: 183, y: -362 }
};

/**
 * The crane that you are helping to move to the right spot on the trailer.
 * @constructor
 * @param {Object} game - The game object.
 * @param {number} x - The x position.
 * @param {number} y - The y position.
 * @param {number} amount - The range of numbers.
 * @return {Object} Itself.
 */
function Crane (game, x, y, amount) {
	Character.call(this, game, x, y, true); // Parent constructor.

	this.hookPos = this.pos.hookDefaultPos;
	this.trolleyPos = this.pos.craneTrolleyStart;
	this.numberRange = amount;

	this.body = this.game.add.sprite(0, 0, this.id, 'crane', this);
	this.body.anchor.set(0, 1);
	this.eyes = this.game.add.sprite(this.pos.eyeNeutralPos.x, this.pos.eyeNeutralPos.y, this.id, 'crane_eyes', this);
	this.eyes.anchor.set(0.5, 0.5);
	this.mouth = this.game.add.sprite(180, -310, this.id, 'crane_happy', this);
	this.mouth.anchor.set(0.5, 0);

	this.wire = this.game.add.sprite(this.trolleyPos, (this.pos.craneArmHeight) * -1, this.id, 'crane_wire', this);
	this.wire.height = this.pos.craneArmHeight - this.hookPos - this.pos.hookHeight;
	this.wire.anchor.set(0.5, 0);

	this.trolley = this.game.add.sprite(this.trolleyPos, -545, this.id, 'crane_trolley', this);
	this.trolley.anchor.set(0.5, 0);

	this.hook = this.game.add.sprite(this.trolleyPos, this.hookPos * -1, this.id, 'hook', this);
	this.hook.anchor.set(0.5, 1);

 	this.adjustedCargonetHeight = amount < 9 ? this.pos.cargonetHeight : this.pos.cargonetHeight * 0.66;
	this.adjustedCargonetHeight -= this.pos.hookThickness;

	this.cargo = this.game.add.sprite(this.trolleyPos, (this.hookPos - this.adjustedCargonetHeight) * -1, this.id, 'cargobox', this);
	this.cargo.anchor.set(0.5, 1);
	this.cargo.scale.set(amount < 9 ? 1 : 0.66);
	this.cargo.visible = false;

	this.cargonet = this.game.add.sprite(this.trolleyPos, (this.hookPos + this.pos.hookThickness) * -1, this.id, 'cargonet', this);
	this.cargonet.anchor.set(0.5, 0);
	this.cargonet.scale.set(amount < 9 ? 1 : 0.66);
	this.cargonet.visible = false;

	// Animation for mouth when talking.
	var talkProps =
	{
		frame: this.mouth.frame + 1,
		roundProps: 'frame',
		ease: Power0.easeInOut,
		repeat: -1,
		yoyo: true,
		paused: true
	};
	this.talk = TweenMax.to(this.mouth, 0.2, talkProps);//{
		//frame: this.mouth.frame+1, roundProps: 'frame', ease: Power0.easeInOut, repeat: -1, yoyo: true, paused: true
	//});

	var _this = this; // Subscriptions to not have access to 'this' object
	this.cargonet.hide = function(visibility) { _this.cargonet.visible = visibility; };   // For testing

	return this;
}

/**
 * Hides or shows the cargo net.
 * @param {boolean} visibility - True if the net should be visible and false if it should be hidden.
 */
Crane.prototype.setCargoNetVisibility = function(visibility) {
	this.cargonet.visible = visibility;
};

/**
 * Hides or shows the cargo net.
 * @param {boolean} visibility - True if the net should be visible and false if it should be hidden.
 */
Crane.prototype.pickUpCargo = function(cargo) {
	this.cargo = cargo;
};

/**
 * Hides or shows the cargo net.
 * @param {boolean} visibility - True if the net should be visible and false if it should be hidden.
 */
Crane.prototype.dropCargo = function() {
	this.cargo = null;
	console.log('drop');
};

Crane.prototype.moveCrane = function(newCranePos) {
	var t = new TimelineMax();
	t.addLabel('moving');
	t.to(this, 2, { x: newCranePos, ease: Power1.easeInOut }, 'moving');

	return t;
};


/**
 * Move the hook up and down.
 * @param {number} hookPos - The new position to move the hook to.
 * @return {Object} The animation timeline. An empty timeline if the new position is out of bounds.
 */
Crane.prototype.moveHook = function (newHookPos) {
	this.hookPos = this.y - newHookPos;

	var t = new TimelineMax();
	t.addLabel('moveHook');

	// Lift the hook.
	t.to(this.hook, 1, { y: this.hookPos * -1, ease: Power1.easeInOut }, 'moveHook');

	// Adjust the wire to fit the new distance between the hook and the trolley.
	var newHeight = this.pos.craneArmHeight - this.hookPos - this.pos.hookHeight;
	t.to(this.wire, 1, { height: newHeight, ease: Power1.easeInOut }, 'moveHook');

	// Move the cargo net with the hook.
	var newCargonetPos = (this.hookPos + this.pos.hookThickness) * -1;
	t.to(this.cargonet, 1, { y: newCargonetPos, ease: Power1.easeInOut }, 'moveHook');

	// Move the cargo.
	var newCargoPos = (this.hookPos - this.adjustedCargonetHeight) * -1;
	t.to(this.cargo, 1, { y: newCargoPos, ease: Power1.easeInOut }, 'moveHook');

	return t;
};

/**
 * Move the trolley back and forth.
 * @param {number} trolleyPos - The new position to move the trolley to.
 * @return {Object} The animation timeline. An empty timeline if the new position is out of bounds.
 */
Crane.prototype.moveTrolley = function (trolleyPos)
{
	this.trolleyPos = trolleyPos;

	var t = new TimelineMax();
	t.addLabel('moveTrolley');

	// Move the trolley, hook, wire, cargo net and cargo.
	t.to(this.trolley, 1, { x: this.trolleyPos, ease: Power1.easeInOut }, 'moveTrolley');
	t.to(this.hook, 1, { x: this.trolleyPos, ease: Power1.easeInOut }, 'moveTrolley');
	t.to(this.wire, 1, { x: this.trolleyPos, ease: Power1.easeInOut }, 'moveTrolley');
	t.to(this.cargonet, 1, { x: this.trolleyPos, ease: Power1.easeInOut }, 'moveTrolley');
	t.to(this.cargo, 1, { x: this.trolleyPos, ease: Power1.easeInOut }, 'moveTrolley');

	return t;
};

/**
 * Set the cranes eyes to look at the tractor.
 * @return {Object} The animation timeline.
 */
Crane.prototype.lookAtTractor = function ()
{
	var t = new TimelineMax();

	t.to(this.eyes, 0.4, { x: this.pos.eyeTractorPos.x, y: this.pos.eyeTractorPos.y, ease: Power1.easeInOut });

	return t;
};

/**
 * Set the cranes eyes to look at the user.
 * @return {Object} The animation timeline.
 */
Crane.prototype.lookAtUser = function ()
{
	var t = new TimelineMax();

	t.to(this.eyes, 0.4, { x: this.pos.eyeNeutralPos.x, y: this.pos.eyeNeutralPos.y, ease: Power1.easeInOut });

	return t;
};
