var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create });

function preload () {
	game.load.image('drop', 'drop.png', 35, 70);
	game.load.audio('ding', ['ding.mp3', 'ding.ogg']);
};

/* Phaser state function */
function create () {
	// A tween's 'to' function looks like this:
	// to(properties, duration, ease, autoStart, delay, repeat, yoyo)


	// Normal tween:
	var normal = game.add.sprite(100, 0, 'drop');
	game.add.tween(normal).to({ x: 500 }, 1000, null, true);


	// Yoyo tween (goes to end and back to start):
	// NOTE: Repeat is incremented in both directions.
	// => odd value stop at end point, even value at start point.
	var yoyo = game.add.sprite(100, 100, 'drop');
	game.add.tween(yoyo).to({ x: 500 }, 1000, null, true, 0, 1, true);
	//                     Try experimenting with this value ^


	// Chained tween (one tween after another):
	var chain = game.add.sprite(100, 200, 'drop');
	game.add.tween(chain)
		.to({ x: 500 }, 1000, null, true)
		.to({ x: 250 }, 1000, null, true);
		// Chain as many as you like.


	// Chained tween 2:
	var chain2 = game.add.sprite(100, 300, 'drop');
	var chain2tween1 = game.add.tween(chain2).to({ x: 500 }, 1000, null, true);
	var chain2tween2 = game.add.tween(chain2).to({ x: 300 }, 1000);
	var chain2tween3 = game.add.tween(chain2).to({ x: 100 }, 500);
	chain2tween1.chain(chain2tween2);
	chain2tween2.chain(chain2tween3); // Note the different tween source.


	// Chained tween 3:
	// Here we need to add a function to the prototype.
	Phaser.Tween.prototype.then = function (tween) {
		this._chainedTweens = [tween];
		return tween; // Returning 'tween' instead of 'this' (as in .chain()).
	};
	var chain3 = game.add.sprite(100, 400, 'drop');
	game.add.tween(chain3).to({ x: 500 }, 1000, null, true)
		.then(game.add.tween(chain3).to({ x: 400 }, 1000))
		.then(game.add.tween(chain3).to({ x: 100 }, 500));


	// Play sound on tween events:
	var soundDrop = game.add.sprite(100, 500, 'drop');
	var sound = game.add.audio('ding', 1);
	var tween = game.add.tween(soundDrop).to({ x: 200 }, 1000, null, true, 2000);
	tween.onStart.add(function () { sound.play(); });
	tween.onComplete.add(function () { sound.play(); });
	// There is also an 'onLoop' you can add to.


	// Advanced course, chain tweens and sound:
	Phaser.Sound.prototype.then = function (what) {
		this.onStop.add(function () { what.start(); });
		return what;
	};
	Phaser.Sound.prototype.start = function () {
		return this.play();
	};
	// We also use the added prototype function from 'Chained tween 3'.
	var chain4 = game.add.sprite(100, 600, 'drop');
	var sound2 = game.add.audio('ding', 1);
	game.add.tween(chain4).to({ x: 500 }, 1000, null, true, 4000)
		.then(game.add.tween(chain4).to({ x: 400 }, 1000))
		.then(sound2)
		.then(game.add.tween(chain4).to({ x: 100 }, 500));


	// Explanatory texts, not part of the examples.
	var fontStyle = { font: '15pt Arial', fill: '#ffffff' };
	game.add.text(0, 0,   'Normal',   fontStyle);
	game.add.text(0, 100, 'Yoyo',     fontStyle);
	game.add.text(0, 200, 'Chain1',   fontStyle);
	game.add.text(0, 300, 'Chain2',   fontStyle);
	game.add.text(0, 400, 'Chain3',   fontStyle);
	game.add.text(0, 500, 'Events',   fontStyle);
	game.add.text(0, 600, 'Advanced', fontStyle);
}