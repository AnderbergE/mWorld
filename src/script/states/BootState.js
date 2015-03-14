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

	/* Setup sound manager */
	// Array to hold music objects, needed to change bg-volume
	this.sound._music = [];

	/* Use stored volumes, if any. */
	this.sound._fgVolume = 1;
	if (typeof localStorage.fgVolume !== 'undefined') {
		this.sound.fgVolume = localStorage.fgVolume;
	}
	this.sound._bgVolume = 1;
	if (typeof localStorage.bgVolume !== 'undefined') {
		this.sound.bgVolume = localStorage.bgVolume;
	}

	// Overshadow the original sound managers add function.
	// To save maxVolume for the sound and setup actual volume according to fg.
	this.sound.add = function (key, volume, loop, connect) {
		var sound = Phaser.SoundManager.prototype.add.call(this, key, volume, loop, connect);
		sound.maxVolume = sound.volume;
		sound.volume = sound.maxVolume * this.fgVolume;
		return sound;
	};
	// Overshadow the original sound managers remove function.
	// To make sure that object is removed from music array.
	this.sound.remove = function (sound) {
		var success = Phaser.SoundManager.prototype.remove.call(this, sound);
		if (this._music.indexOf(sound) >= 0) {
			this._music.splice(this._music.indexOf(sound), 1);
		}
		return success;
	};
	// Overshadow the original sound objects play function.
	// To set volume according to fg/bg.
	var soundFunction = Phaser.Sound.prototype.play;
	Phaser.Sound.prototype.play = function (marker, position, volume, loop, forceRestart) {
		var container = this.game.sound[this.game.sound._music.indexOf(this) >= 0 ? 'bgVolume' : 'fgVolume'];
		volume = (typeof volume !== 'number' ? this.maxVolume : volume) * container;
		return soundFunction.call(this, marker, position, volume, loop, forceRestart);
	};

	/* Allow images to be served from external sites, e.g. amazon */
	this.load.crossOrigin = 'anonymous';

	/* Load the Google WebFont Loader script */
	// The Google WebFont Loader will look for this specific object.
	window.WebFontConfig = {
		active: function () { _this._fontLoaded = true; },
		google: { families: [GLOBAL.FONT] }
	};
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

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
	this.load.audio('click', ['audio/click.m4a', 'audio/click.ogg', 'audio/click.mp3']);
	this.load.atlasJSONHash('objects', 'img/objects/objects.png', 'img/objects/objects.json');
	/* All sounds are purged from cache when switching state (memory issues), set this to not delete a sound. */
	this.sound._doNotDelete = ['click', Panda.prototype.id + 'Speech', Hedgehog.prototype.id + 'Speech', Mouse.prototype.id + 'Speech'];

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