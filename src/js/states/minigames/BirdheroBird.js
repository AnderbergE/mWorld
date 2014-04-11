BirdheroBird.prototype = Object.create(Phaser.Group.prototype);
BirdheroBird.prototype.constructor = BirdheroBird;

function BirdheroBird () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.visible = false;
	this.number = null;

	var body = game.add.sprite(0, 0, 'birdheroBird', null, this);
	body.anchor.setTo(0.5);
	var beak = game.add.sprite(75, -35, 'birdheroBeak', null, this);
	beak.anchor.setTo(0.5);
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

	this.turn = function (direction) {
		// Turn by manipulating the scale.
		var newScale = (direction ? direction * Math.abs(this.scale.x) : -1 * this.scale.x);
		return game.add.tween(this.scale).to({ x: newScale }, 200, Phaser.Easing.Linear.None, true);
	};
	this.move = function (properties, duration, onComplete, scale) {
		var t = game.add.tween(this).to(properties, duration, Phaser.Easing.Quadratic.Out);
		if (onComplete) { t.onComplete.add(onComplete); }
		if (scale) {
			t.onStart.addOnce(function () {
				game.add.tween(this.scale).to({ x: (this.scale.x < 0 ? -1 * scale : scale), y: scale }, 2000, Phaser.Easing.Quadratic.Out, true);
			}, this);
		}

		if (properties.x &&                                 // Check if we should turn around
			(properties.x <= this.x && 0 < this.scale.x) || // Going left, scale should be -1
			(this.x <= properties.x && 0 > this.scale.x)) { // Going right, scale should be 1
			this.turn().onComplete.addOnce(function () { t.start(); }, game);
		} else {
			t.start();
		}

		return t;
	};

	return this;
}

Object.defineProperty(BirdheroBird.prototype, 'tint', {
	get: function() {
		return this.children[0].tint;
	},
	set: function(value) {
		this.setAllChildren('tint', value);
	}
});