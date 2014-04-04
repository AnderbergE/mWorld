/*
 * Inherits Phaser.Group
 * A NumberButton is used in the minigames to interact with.
 */
function BirdheroBird () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.visible = false;
	this.number = null;

	game.add.sprite(0, 0, 'birdheroBird', null, this);
	var beak = game.add.sprite(172, 46, 'birdheroBeak', null, this);
	beak.talk = beak.animations.add('talk', null, 4, true);

	this.say = function (what, onComplete) {
		beak.talk.play();
		var s = game.add.sound(what);
		s.onStop = function () {
			beak.talk.stop();
			if (onComplete) { onComplete(); }
		};
		s.play();
	};

	return this;
}

// inheritance
BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;

Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() {
		return this.children[0].tint;
	},
	set: function(value) {
		this.setAllChildren('tint', value);
	}
});