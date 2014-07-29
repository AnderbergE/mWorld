/**
 * The player object.
 * Use this to do any player interaction.
 * @global
 */
var player;

/**
 * The Phaser game object.
 * NOTE: In game states, use 'this' instead.
 * @global
 */
var game;


//  The Google WebFont Loader will look for this specific object.
var WebFontConfig = {
	active: function() {
		game.time.events.add(Phaser.Timer.SECOND, function () {
			BootState.prototype.bootGame();
		}, this);
	},
	google: { families: [GLOBAL.FONT] }
};
void(WebFontConfig); // workaround for jshint unused warning.


/**
 * Create the game when the browser has loaded everything.
 * NOTE: This is where all the states should be added.
 */
window.onload = function () {
	if (document.querySelector('#game')) {
		// Do not start game if the element does not exist.

		player = new Player();

		game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');

		game.state.add('Boot', BootState);
		game.state.add(GLOBAL.STATE.entry,        EntryState);
		game.state.add(GLOBAL.STATE.agentSetup,   AgentSetupState);
		game.state.add(GLOBAL.STATE.garden,       GardenState);
		game.state.add(GLOBAL.STATE.lizardGame,   LizardJungleGame);
		game.state.add(GLOBAL.STATE.birdheroGame, BirdheroGame);
		game.state.add(GLOBAL.STATE.balloonGame,  BalloonGame);
		game.state.add(GLOBAL.STATE.beeGame,      BeeFlightGame);
		game.state.add(GLOBAL.STATE.debug,        DebugState);

		game.state.start('Boot');
	}
};


/**
 * The boot state will load the first parts of the game and common game assets.
 * Add assets that will be used by many states.
 */
function BootState () {}

/* Phaser state function */
BootState.prototype.preload = function () {
	/* Make sure tweens are stopped when pausing. */
	game.onPause.add(function () {
		TweenMax.globalTimeScale(0);
		game.sound.pauseAll();
	});
	game.onResume.add(function () {
		TweenMax.globalTimeScale(1);
		game.sound.resumeAll();
	});


	/* Show loading progress accordingly */
	this.load.onFileComplete.add(function (progress) {
		document.querySelector('.progress').innerHTML = progress + '%';
		if (progress >= 100) {
			document.querySelector('.loading').style.display = 'none';
		} else {
			document.querySelector('.loading').style.display = 'block';
		}
	});

	/* Respond to connection problems */
	EventSystem.subscribe(GLOBAL.EVENT.connection, function (status) {
		if (status) {
			document.querySelector('.loading').style.display = 'none';
		} else {
			document.querySelector('.progress').innerHTML = LANG.TEXT.connectionLost;
			document.querySelector('.loading').style.display = 'block';
		}
	}, true);

	EventSystem.subscribe(GLOBAL.EVENT.connectionLost, function () {
		game.world.add(new Modal(LANG.TEXT.connectionLost, 40, function () {
			document.querySelector('.loading').style.display = 'none';
			game.state.start(GLOBAL.STATE.entry);
		}));
	}, true);


	/* Make sure the game scales according to resolution */
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.scale.setScreenSize(true);

	/* If volume has been changed, use the stored one. */
	if (typeof localStorage.mainVolume !== 'undefined') {
		this.sound.volume = localStorage.mainVolume;
	}

	/* Allow images to be served from external sites, e.g. amazon */
	this.load.crossOrigin = 'anonymous';

	/* Load the Google WebFont Loader script */
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	/* Agent related assets */
	this.load.atlasJSONHash(Panda.prototype.id, 'assets/img/agent/panda/panda.png', 'assets/img/agent/panda/panda.json');

	/* Common game assets */
	this.load.image('thought',    'assets/img/agent/thoughtbubble.png');
	this.load.image('watercan',   'assets/img/objects/wateringcan.png');
	this.load.spritesheet('drop', 'assets/img/objects/drop.png', 35, 70, 2);
	this.load.spritesheet('wood', 'assets/img/objects/wood.png', 58, 56, 2);
	this.load.audio('click', ['assets/audio/click.ogg', 'assets/audio/click.mp3']);

	/* Load the entry state assets as well, no need to do two loaders. */
	this.load.image('entryBg', 'assets/img/jungle.png');
};

/* Phaser state function */
BootState.prototype.create = function () {
	this.bootGame();
};

/**
 * @property {boolean} _isLoaded - Used for loading all assets. See bootGame.
 * @default
 * @private
 */
BootState.prototype._isLoaded = false;

/**
 * The next state will be called when everything has been loaded.
 * So we need to wait for both the web font and all the assets.
 * When one of them is loaded the "_isLoaded" is set to true.
 * The other one will then boot the real game when finished.
 */
BootState.prototype.bootGame = function () {
	if (this._isLoaded) {

		if (typeof Routes === 'undefined' || Routes === null) {
			console.warn('You are missing a route to the server, no data will be fetched or sent.');
		}

		if (window.location.hostname.toLowerCase() === 'localhost' ||
			window.location.hostname === '127.0.0.1') {
			console.log('You are running on localhost, entering debug mode :)');
			game.state.start(GLOBAL.STATE.debug);

		} else {
			game.state.start(GLOBAL.STATE.entry);
		}

	} else {
		BootState.prototype._isLoaded = true;
	}
};