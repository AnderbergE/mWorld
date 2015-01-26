var SuperState = require('../SuperState.js');
var GLOBAL = require('../../global.js');
var LANG = require('../../language.js');
var EventSystem = require('../../pubsub.js');
var Counter = require('../../objects/Counter.js');
var Cover = require('../../objects/Cover.js');
var Menu = require('../../objects/Menu.js');
var WaterCan = require('../../objects/WaterCan.js');

module.exports = Subgame;

/**
 * Superclass for all games.
 * Holds shared logic for mode and round handling. Also some graphic setups.
 * Also see subclass NumberGame.
 *
 * SETUP THESE IN THE SUBCLASS:
 * They are called with two parameters (ifFirstTime, triesSoFar).
 * modeIntro:      Introduce the game, call nextRound to start next mode.
 * modePlayerDo:   Player only
 * modePlayerShow: Player is showing the TA
 * modeAgentTry:   TA is guessing and the player is helping out
 * modeAgentDo:    TA only
 * modeOutro:      The game is finished, celebrate!
 *
 * VARIABLES THE SUBCLASS CAN USE:
 * Add game objects to:     this.gameGroup
 * Add buttons and HUD to:  this.hudGroup
 * Use agent with:          this.agent (default visibility = false)
 *
 * FUNCTIONS THE SUBCLASS CAN USE:
 * Disable/Enable input:    this.disable(true/false) - default = true = disabled (publishes disabled event)
 * Run next round:          this.nextRound() - will change mode automatically when needed
 * Add water to the can:    this.addWater(fromX, fromY) - Adds a water drop to the can
 */
Subgame.prototype = Object.create(SuperState.prototype);
Subgame.prototype.constructor = Subgame;
function Subgame () {}

/* 
 * Phaser state function.
 */
Subgame.prototype.init = function (options) {
	/* "Private" variables */
	var _this = this; // Event subscriptions does not have access to this
	this._token = options.token || Date.now();
	this._modes = options.mode || [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerDo,
		GLOBAL.MODE.playerShow,
		GLOBAL.MODE.agentTry,
		// GLOBAL.MODE.agentDo,
		GLOBAL.MODE.outro
	];
	this._mode = null;
	this._pendingMode = null;
	this._first = true;
	/* Keep track of how many rounds that have been played */
	this._counter = new Counter(options.roundsPerMode || 3, true);
	/* When enough rounds have been played, trigger a mode change */
	this._counter.onMax = function () {
		_this._nextMode();
	};
	this._currentTries = 0;
	this._totalTries = 0;

	/* Public variables */
	this.currentMode = null; // The current mode running

	/* Setup game objects */
	this.gameGroup = this.add.group();
	this.agent = this.game.player.createAgent();
	this.agent.visible = false;
	this.gameGroup.add(this.agent);

	this.hudGroup = this.add.group();

	var disabler = new Cover(this.game, '#ffffff', 0);
	this.world.add(disabler);
	this.disable = function (value) {
		if (disabler.visible !== value) {
			EventSystem.publish(GLOBAL.EVENT.disabled, [value]);
		}
		disabler.visible = value;
	};

	/* Setup menu objects */
	this._menuGroup = this.add.group();
	this._menuGroup.visible = false;
	this._waterCan = new WaterCan(this.game);
	this._menuGroup.add(this._waterCan);
	this.menuBack = { state: GLOBAL.STATE.garden, text: LANG.TEXT.gotoGarden };
	this._menuGroup.add(new Menu(this.game));

	/* For cleanup when shutting down state */
	this._origAudio = Object.keys(this.game.cache._sounds);
	this._origImages = Object.keys(this.game.cache._images);
};

/* Phaser state function */
Subgame.prototype.shutdown = function () {
	var key;
	for (key in this.game.cache._sounds) {
		if (this._origAudio.indexOf(key) < 0) {
			this.game.cache.removeSound(key);
		}
	}

	for (key in this.game.cache._images) {
		if (this._origImages.indexOf(key) < 0) {
			this.game.cache.removeImage(key);
		}
	}

	SuperState.prototype.shutdown.call(this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Private functions                              */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/** Change to the next mode in the queue. */
Subgame.prototype._nextMode = function () {
	var newMode = this._modes.shift();
	this._decideMode(newMode);
	this._pendingMode = newMode;
	this._first = true;
};

/**
 * Translate from integer to mode function
 * @param {number}
 */
Subgame.prototype._decideMode = function (mode) {
	if (mode === GLOBAL.MODE.intro) {
		this._mode = this.modeIntro;
	} else if (mode === GLOBAL.MODE.playerDo) {
		this._mode = this.modePlayerDo;
	} else if (mode === GLOBAL.MODE.playerShow) {
		this._mode = this.modePlayerShow;
	} else if (mode === GLOBAL.MODE.agentTry) {
		this._mode = this.modeAgentTry;
	} else if (mode === GLOBAL.MODE.agentDo) {
		this._mode = this.modeAgentDo;
	} else if (mode === GLOBAL.MODE.outro) {
		this._mode = this.modeOutro;
	} else {
		this._mode = this.endGame;
	}
};

/** Skip the current mode. */
Subgame.prototype._skipMode = function () {
	this._nextMode();
	this.nextRound();
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Public functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/**
 * Calls the current mode function. It will be called with two parameters:
 * 1) If it is the first time on this mode.
 * 2) How many tries that have been made on the current number.
 * Publishes modeChange event (first time a mode runs).
 */
Subgame.prototype.nextRound = function () {
	// Special case: intro and outro only have one round
	if ((this.currentMode === GLOBAL.MODE.intro ||
		this.currentMode === GLOBAL.MODE.outro) &&
		this.currentMode === this._pendingMode) {
		this._nextMode();
	}

	// Publish event when it it is the first time it runs
	if (this._first) {
		EventSystem.publish(GLOBAL.EVENT.modeChange, [this._pendingMode]);
	}

	// Run mode and update properties
	this.currentMode = this._pendingMode;
	this._mode(this._first, this._currentTries);
	this._first = false;
};

/**
 * Adds water to the water can.
 * Water will only be added in modes playerShow, agentTry and agentDo.
 * @param {number} The x position where the drop will begin.
 * @param {number} The y position where the drop will begin.
 * @param {boolean} Override mode restrictions and force drop to be added.
 * @return {Object} The drop animation from x, y to water can.
 */
Subgame.prototype.addWater = function (x, y) {
	var drop = this.add.sprite(x, y, 'objects', 'drop', this._menuGroup);
	drop.anchor.set(0.5);
	drop.scale.set(0.7, 0);

	// Show drop
	return new TimelineMax().to(drop.scale, 1.5, { y: 0.7, ease:Elastic.easeOut })
		// Move drop
		.to(drop, 1.5, { x: this._waterCan.x + 50, y: this._waterCan.y + 30, ease:Power2.easeOut })
		// Hide drop and add water
		.to(drop, 0.5, { height: 0,
			onStart: function () { this.game.player.water++; },
			onStartScope: this,
			onComplete: function () { drop.destroy(); }
		});
};

/**
 * Start the game!
 * Publishes subgameStarted event.
 */
Subgame.prototype.startGame = function () {
	/* Send event that subgame is started. */
	EventSystem.publish(GLOBAL.EVENT.subgameStarted, [this.game.state.current, this._token]);

	this._menuGroup.visible = true;
	this._nextMode();
	this.nextRound();
};

/** End the game. */
Subgame.prototype.endGame = function () {
	this.state.start(GLOBAL.STATE.garden);
};


/* The following functions should be overshadowed in the game object. */
Subgame.prototype.modeIntro      = Subgame.prototype._skipMode;
Subgame.prototype.modePlayerDo   = Subgame.prototype._skipMode;
Subgame.prototype.modePlayerShow = Subgame.prototype._skipMode;
Subgame.prototype.modeAgentTry   = Subgame.prototype._skipMode;
Subgame.prototype.modeAgentDo    = Subgame.prototype._skipMode;
Subgame.prototype.modeOutro      = Subgame.prototype._skipMode;