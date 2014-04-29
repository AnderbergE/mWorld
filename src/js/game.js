/**
 * The user object.
 * Use this to do any user interaction.
 */
var user;

/**
 * The Phaser game object.
 * Use this to add objects to the game engine.
 * Note: In game states, use 'this' instead.
 */
var game;

/**
 * Create the game when the browser has loaded everything.
 * Note: This is where all the states should be added.
 */
window.onload = function () {
	user = new User();
	game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');

	game.state.add('Boot', BootState);
	game.state.add(GLOBAL.STATE.entry, EntryState);
	game.state.add(GLOBAL.STATE.playerSetup, PlayerSetupState);
	game.state.add(GLOBAL.STATE.garden, GardenState);
	game.state.add(GLOBAL.STATE.birdheroGame, BirdheroGame);
	game.state.add(GLOBAL.STATE.balloonGame, BalloonGame);

	game.state.start('Boot');
};

//  The Google WebFont Loader will look for this object, so create it before loading the script.
var WebFontConfig = {
	active: function() {
		game.time.events.add(Phaser.Timer.SECOND, function () {
			// TODO: What if this is loaded faster than the images?
			game.state.start(GLOBAL.STATE.entry);
		}, this);
	},
	google: { families: ['The Girl Next Door'] }
};
void(WebFontConfig); // workaround for jshint unused warning.

/**
 * The boot state will load the first parts of the game and common game assets.
 * Add assets that will be used by many states in this section.
 * The next state will be called when the web font has been loaded.
 */
function BootState () {}
/* Phaser state function */
BootState.prototype.preload = function () {
	/* Make sure tweens are stopped when pausing. */
	game.onPause.add(function () { TweenMax.globalTimeScale(0); });
	game.onResume.add(function () { TweenMax.globalTimeScale(1); });

	/* Show loading progress accordingly */
	this.load.onFileComplete.add(function (progress) {
		document.querySelector('.progress').innerHTML = progress + '%';
		if (progress >= 100) {
			document.querySelector('.loading').style.display = 'none';
		} else {
			document.querySelector('.loading').style.display = 'block';
		}
	});

	/* Make sure the game scales according to resolution */
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.scale.setScreenSize(true);

	/* Load the Google WebFont Loader script */
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	/* Agent related */
	this.load.image('panda',      'assets/img/agent/panda/standard.png');
	this.load.image('pandaTalk',  'assets/img/agent/panda/talking.png');
	this.load.image('pandaWalk1', 'assets/img/agent/panda/walking1.png');
	this.load.image('pandaWalk2', 'assets/img/agent/panda/walking2.png');
	this.load.image('pandaWave',  'assets/img/agent/panda/waving.png');
	this.load.image('pandaEye',   'assets/img/agent/panda/eye.png');
	this.load.image('pandaFlare', 'assets/img/agent/panda/flare.png');

	/* Common game elements */
	this.load.spritesheet('drop', 'assets/img/objects/drop.png', 35, 70, 2);
	this.load.spritesheet('wood', 'assets/img/objects/wood.png', 58, 56, 2);
	this.load.image('watercan', 'assets/img/objects/wateringcan.png');
	this.load.image('balloon', 'assets/img/subgames/balloon/balloon.png');

	/* Load the entry state assets as well, no need to do two loaders. */
	this.load.image('entryBg', 'assets/img/jungle.png');
	this.load.audio('yeah', ['assets/audio/yeah.mp3', 'assets/audio/yeah.ogg']);
};