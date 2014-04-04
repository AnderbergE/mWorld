var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var backend = new Backend();
var viewHandler = new ViewHandler();
var user = new User();

void(viewHandler); // TODO: This should be removed

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
	game.load.onFileComplete.add(function (progress) {
		document.querySelector('.progress').innerHTML = progress + '%';
		if (progress >= 100) {
			document.querySelector('.loading').style.display = 'none';
		} else {
			document.querySelector('.loading').style.display = 'block';
		}
	});

	//  Load the Google WebFont Loader script
	game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	game.load.image('jungle', 'assets/img/jungle.png');
	game.load.image('lizardBg', 'assets/img/minigames/lizard/bg.png');
	game.load.image('wood', 'assets/img/objects/wood.png');

	/* Bird Hero game */
	game.load.image('birdheroBg',      'assets/img/minigames/birdhero/bg.png');
	game.load.image('birdheroBird',    'assets/img/minigames/birdhero/bird.png');
	game.load.image('birdheroBole',    'assets/img/minigames/birdhero/bole.png');
	game.load.image('birdheroBranch0', 'assets/img/minigames/birdhero/branch1.png');
	game.load.image('birdheroBranch1', 'assets/img/minigames/birdhero/branch2.png');
	game.load.image('birdheroBranch2', 'assets/img/minigames/birdhero/branch2.png');
	game.load.image('birdheroBucket',  'assets/img/minigames/birdhero/bucket.png');
	game.load.image('birdheroChick',   'assets/img/minigames/birdhero/chick.png');
	game.load.image('birdheroCrown',   'assets/img/minigames/birdhero/crown.png');
	game.load.image('birdheroMother',  'assets/img/minigames/birdhero/mother.png');
	game.load.image('birdheroNest',    'assets/img/minigames/birdhero/nest.png');
	game.load.image('birdheroRope',    'assets/img/minigames/birdhero/rope.png');
	game.load.image('birdheroWhat',    'assets/img/minigames/birdhero/what.png');
	game.load.spritesheet('birdheroBeak', 'assets/img/minigames/birdhero/beak.png', 31, 33);
	game.load.audio('birdheroIntro', ['assets/audio/minigames/birdhero/bg.mp3', 'assets/audio/minigames/birdhero/bg.ogg']);

	/* Agent related */
	game.load.image('panda',      'assets/img/agent/panda/standard.png');
	game.load.image('pandaTalk',  'assets/img/agent/panda/talking.png');
	game.load.image('pandaWalk1', 'assets/img/agent/panda/walking1.png');
	game.load.image('pandaWalk2', 'assets/img/agent/panda/walking2.png');
	game.load.image('pandaWave',  'assets/img/agent/panda/waving.png');
	game.load.image('pandaEye',   'assets/img/agent/panda/eye.png');
	game.load.image('pandaFlare', 'assets/img/agent/panda/flare.png');

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
	// viewHandler.currentView.update();
}