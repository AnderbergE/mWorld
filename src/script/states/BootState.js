var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var Modal = require('../objects/Modal.js');
var Hedgehog = require('../agent/Hedgehog.js');
var Mouse = require('../agent/Mouse.js');
var Panda = require('../agent/Panda.js');

module.exports = BootState;

/**
 * The boot state will load the first parts of the game and common game assets.
 * Add assets that will be used by many states.
 */
function BootState () {}

/**
 * @property {boolean} _isLoaded - Used for loading all assets. See bootGame.
 * @default
 * @private
 */
BootState.prototype._fontLoaded = false;

/* Phaser state function */
BootState.prototype.preload = function () {
	var _this = this;

	GLOBAL.STATE_KEYS = Object.keys(this);
	GLOBAL.STATE_KEYS.push('loaded');

	/* Make sure tweens are stopped when pausing. */
	this.game.onPause.add(function () {
		TweenMax.globalTimeScale(0);
		this.game.sound.pauseAll();
	}, this);
	this.game.onResume.add(function () {
		TweenMax.globalTimeScale(1);
		this.game.sound.resumeAll();
	}, this);


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
		_this.game.world.add(new Modal(_this.game, LANG.TEXT.connectionLostMessage, 20, function () {
			document.querySelector('.loading').style.display = 'none';
			_this.game.state.start(GLOBAL.STATE.entry);
		}));
	}, true);


	/* Make sure the game scales according to resolution */
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;

	/* If volume has been changed, use the stored one. */
	if (typeof localStorage.mainVolume !== 'undefined') {
		this.sound.volume = localStorage.mainVolume;
	}

	/* Allow images to be served from external sites, e.g. amazon */
	this.load.crossOrigin = 'anonymous';

	/* Load the Google WebFont Loader script */
	// The Google WebFont Loader will look for this specific object.
	window.WebFontConfig = {
		active: function () { _this._fontLoaded = true; },
		google: { families: [GLOBAL.FONT] }
	};
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	/* Setup agent lookup globals */
	GLOBAL.AGENT = {
		0: Panda,
		1: Hedgehog,
		2: Mouse
	};

	/* Agent related assets */
	if (this.game.player.agent) {
		var name = this.game.player.agent.prototype.id;
		this.load.audio(name + 'Speech', LANG.SPEECH.AGENT.speech);
		if (name === Panda.prototype.id) {
			this.load.atlasJSONHash(name, 'img/agent/panda/atlas.png', 'img/agent/panda/atlas.json');
		} else if (name === Hedgehog.prototype.id) {
			this.load.atlasJSONHash(name, 'img/agent/hedgehog/atlas.png', 'img/agent/hedgehog/atlas.json');
		} else if (name === Mouse.prototype.id) {
			this.load.atlasJSONHash(name, 'img/agent/mouse/atlas.png', 'img/agent/mouse/atlas.json');
		}
	}

	/* Common game assets */
	this.load.audio('entryMusic', ['audio/music.m4a', 'audio/music.ogg', 'audio/music.mp3']);
	this.load.audio('click', ['audio/click.m4a', 'audio/click.ogg', 'audio/click.mp3']);
	this.load.atlasJSONHash('objects', 'img/objects/objects.png', 'img/objects/objects.json');

	/* Load the entry state assets as well, no need to do two loaders. */
	this.load.image('entryBg', 'img/jungle.png');
};

/* Phaser state function */
BootState.prototype.update = function () {
	/**
	 * The next state will be called when everything has been loaded.
	 * So we need to wait for the web font to set its loaded flag.
	 */
	if (this._fontLoaded) {

		if (typeof Routes === 'undefined' || Routes === null) {
			console.warn('You are missing a route to the server, no data will be fetched or sent.');
		}

		if (GLOBAL.debug) {
			console.log('You are running in debug mode, sneaking into choose scenario state :)');
			this.game.state.start(GLOBAL.STATE.scenario);

		} else {
			this.game.state.start(GLOBAL.STATE.entry);
		}

	}
};