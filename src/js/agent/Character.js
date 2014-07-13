Character.prototype = Object.create(Phaser.Group.prototype);
Character.prototype.constructor = Character;
function Character () {
	Phaser.Group.call(this, game, null); // Parent constructor.
}

/**
 * When you want a sound to be said by a character.
 * If the character has a say talk animation it will be used.
 * @param {String|Object} The sound file or the key to a sound file
 * @param {Object} The speaker, needs to have a '.talk' property of TweenMax or TimelineMax
 * @param {String} If you want the speaker to only talk during a specific marker.
 * @returns {Object} The sound object (not started)
 */
Character.prototype.say = function (what, marker) {
	var a = (typeof what === 'string') ? game.add.audio(what) : what;

	if (this.talk) {
		var current;
		var signals = [];

		var play = function () {
			if (a.currentMarker) {
				current = a.currentMarker;
			}
			if (!marker || current === marker) {
				this.talk.play();
			}
		};

		var pause = function () {
			if (!marker || current === marker) {
				this.talk.pause(0);
			}
		};

		var stop = function () {
			if (!marker || current === marker) {
				this.talk.pause(0);
				while (signals.length > 0) {
					signals[0].detach();
					signals[0]._destroy();
					signals.splice(0, 1);
				}
			}
		};

		signals.push(a.onPlay.add(play, this));
		signals.push(a.onResume.add(play, this));
		signals.push(a.onPause.add(pause, this));
		signals.push(a.onStop.add(stop, this));
	}

	return a;
};