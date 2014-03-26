var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var backend = new Backend();
var viewHandler = new ViewHandler();

//  The Google WebFont Loader will look for this object, so create it before loading the script.
var WebFontConfig = {
	//  The Google Fonts we want to load (specify as many as you like in the array)
	active: function() {
		game.time.events.add(Phaser.Timer.SECOND, function () {
			publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.entry]);
			menu();
		}, this);
	},

	google: {
		families: ['The Girl Next Door']
	}
};
void(WebFontConfig); // workaround for jshint unused warning.


function preload() {
	//  Load the Google WebFont Loader script
	game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	game.load.image('jungle', 'assets/img/jungle.png');
	game.load.image('panders', 'assets/img/agent/panders.png');
	game.load.image('lizardBg', 'assets/img/minigames/lizard/bg.png');
	game.load.image('wood', 'assets/img/objects/wood.png');

	game.load.audio('yeah', ['assets/audio/yeah.mp3', 'assets/audio/yeah.ogg']);

	/* Make sure the game scales according to resolution */
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.setScreenSize(true);
}

function create() {
	// The view will wait for the web font to load. See WebFontConfig.
}

function update() {
	viewHandler.currentView.update();
}
