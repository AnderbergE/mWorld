var user = new User();
var game;
window.onload = function () {
	game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('Boot', BootState);
	game.state.add(GLOBAL.VIEW.entry, EntryState);
	game.state.add(GLOBAL.VIEW.garden, GardenState);
	game.state.add(GLOBAL.VIEW.birdheroGame, BirdheroGame);

	game.state.start('Boot');
};

//  The Google WebFont Loader will look for this object, so create it before loading the script.
var WebFontConfig = {
	//  The Google Fonts we want to load (specify as many as you like in the array)
	active: function() {
		game.time.events.add(Phaser.Timer.SECOND, function () {
			game.state.start(GLOBAL.VIEW.entry);
		}, this);
	},

	google: { families: ['The Girl Next Door'] }
};
void(WebFontConfig); // workaround for jshint unused warning.

function BootState () {}
BootState.prototype.preload = function () {
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
	this.load.image('wood', 'assets/img/objects/wood.png');

	/* Load the entry state assets as well, no need to do two loaders. */
	this.load.image('entryJungle', 'assets/img/jungle.png');
	this.load.audio('yeah', ['assets/audio/yeah.mp3', 'assets/audio/yeah.ogg']);
};