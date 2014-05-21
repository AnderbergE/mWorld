/**
 * Holds shared logic for subgames.
 *
 * How to use:
 * Number amount:        this.amount
 * Representation:       this.representation
 * The number to answer: this.currentNumber (updates automatically)
 *
 * Add game objects to:     this.gameGroup
 * Add buttons and HUD to:  this.hudGroup
 * Use agent with:          this.agent (default visibility = false)
 *
 * Start game:              this.startGame()
 * Disable/Enable input:    this.disable(true/false) - default = true = disabled
 * Run next round:          this.nextRound() - will change mode automatically when needed
 * Try a number:            this.tryNumber(number) - when testing a guess against this.currentNumber
 * Add water to the can:    this.addWater(fromX, fromY) - Adds a water drop to the can
 *
 *
 * These function _should_ be overshadowed by the subgame:
 * They are called with two parameters (ifFirstTime, triesSoFars).
 * modeIntro      // Introduce the game, call nextRound to start next mode.
 * modePlayerDo   // Player only
 * modePlayerShow // Player is showing the TA
 * modeAgentTry   // TA is guessing and the player is helping out
 * modeAgentDo    // TA only
 * modeOutro      // The game is finished, celebrate!
 *
 *
 * Typical game flow:
 * this.startGame();    // the first mode, this.modeIntro, will be called
 * this.nextRound();    // start next round (will automatically start next mode)
 * this.disable(false); // make it possible to interact with anything
 * this.tryNumber(x);   // try a number against the current one
 * this.nextRound();    // do this regardless if right or wrong,
 *                      // it takes care of mode switching and function calls for you
 * // Repeat last two functions until game is over.
 */
function Subgame () {}

Object.defineProperty(Subgame.prototype, 'skipper', {
	get: function() { return this._skipper; },
	set: function(value) {
		this._skipper = value;
		if (this._skipper) {
			this.skipGroup.visible = true;
			this._skipper.addCallback(function () {
				this.skipper = null;
			}, null, null, this);
		} else {
			this.skipGroup.visible = false;
		}
	}
});

/* Phaser state function */
Subgame.prototype.init = function (options) {
	/* "Private" variables */
	var _this = this; // Event subscriptions does not have access to this
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
	this._skipper = null;

	/* Public variables */
	this.representation = options.representation;
	this.amount = options.amount;
	/* The current number to answer */
	this.currentNumber = null;
	/* The current mode running */
	this.currentMode = null;
	/* Stores the offset of the last try, can be used to judge last try */
	/* Ex: -1 means that last try was one less than currentNumber */
	this.lastTry = 0;

	/* Setup game objects */
	this.gameGroup = game.add.group();
	this.agent = new user.agent();
	this.agent.visible = false;
	this.gameGroup.add(this.agent);

	this.hudGroup = game.add.group();

	//  TODO: Is there an easier way to disable all input, except the menu?
	var disabler = new Cover('#ffffff', 0);
	game.world.add(disabler);
	this.disable = function (value) { disabler.visible = value; };

	this.menuGroup = game.add.group();
	this.skipGroup = game.add.group(this.menuGroup);
	this.skipGroup.x = 75;
	this.skipGroup.y = 5;
	this.skipGroup.visible = false;
	game.add.button(0, 0, 'wood', this._skip, this, 0, 0, 1, 0, this.skipGroup);
	game.add.text(10, -5, '>>', {
		font: '30pt ' +  GLOBAL.FONT,
		stroke: '#000000',
		strokeThickness: 3
	}, this.skipGroup);
	this.waterCan = new WaterCan(this.game.width - 100, 10);
	this.menuGroup.add(this.waterCan);
	this.menuGroup.add(new Menu());
	this.menuGroup.visible = false;
};

/* Phaser state function */
Subgame.prototype.shutdown = onShutDown;


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

/** Change this.currentNumber to a new one (resets the tries). */
Subgame.prototype._nextNumber = function () {
	// Should we allow the same number again?
	this._totalTries += this._currentTries;
	this._currentTries = 0;
	this.currentNumber = parseInt(1+Math.random()*this.amount);
};

/* Skip a timeline. How to:
 * Set 'this.skipper' to a timeline (a skip button will appear next to the menu)
 * When the timeline is complete, make sure to set 'this.skipper' to null.
 * NOTE: You can not skip part of a timeline.
 */
Subgame.prototype._skip = function () {
	if (this._skipper) {
		this._skipper.totalProgress(1);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Public functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/**
 * Calls the current mode function (publishes modeChange event first time mode runs).
 * It will be called with two parameters:
 * 1) If it is the first time on this mode.
 * 2) How many tries that have been made on the current number.
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
		Event.publish(GLOBAL.EVENT.modeChange, [this._pendingMode]);
	}

	// Run mode and update properties
	this.currentMode = this._pendingMode;
	this._mode(this._first, this._currentTries);
	this._first = false;
};

/**
 * Try a number against this.currentNumber (publishes tryNumber event).
 * The offset of the last try is stored in this.lastTry.
 * @param {number} The number to try.
 * @returns {boolean} The offset of the last try (0 is correct, -x is too low, +x is too high).
 */
Subgame.prototype.tryNumber = function (number) {
	Event.publish(GLOBAL.EVENT.tryNumber, [number, this.currentNumber]);
	this._currentTries++;
	this.lastTry = number - this.currentNumber;

	if (!this.lastTry) {
		this._counter.value++; // This will trigger next mode if we loop.
		this._nextNumber();
	}
	return this.lastTry;
};

/**
 * Adds water to the water can.
 * Water will only be added in modes playerShow, agentTry and agentDo.
 * @param {number} The x position where the drop will begin.
 * @param {number} The y position where the drop will begin.
 * @param {boolean} Override mode restrictions and force drop to be added.
 * @returns {Object} The drop animation from x, y to water can.
 */
Subgame.prototype.addWater = function (x, y, force) {
	var t = new TimelineMax();
	if (this.currentMode === GLOBAL.MODE.playerShow ||
		this.currentMode === GLOBAL.MODE.agentTry ||
		this.currentMode === GLOBAL.MODE.agentDo ||
		force) {
		var drop = this.add.sprite(x, y, 'drop', 0, this.menuGroup);
		drop.anchor.set(0.5);
		drop.scale.y = 0;

		// Show drop
		t.to(drop.scale, 1.5, { y: 1, ease:Elastic.easeOut })
			// Move drop
			.to(drop, 1.5, { x: this.waterCan.x + 30, y: this.waterCan.y, ease:Power2.easeOut })
			// Hide drop and add water
			.to(drop, 0.5, { height: 0,
				onStart: function () { user.water++; },
				onComplete: function () { drop.destroy(); }
			});
	}
	return t;
};

/** Start the game! */
Subgame.prototype.startGame = function () {
	// TODO: Should we wait for sounds to be decoded here, or are there any easier way?
	this.menuGroup.visible = true;
	this._nextMode();
	this._nextNumber();
	this.nextRound();
};

/* End the game. */
Subgame.prototype.endGame = function () {
	this.state.start(GLOBAL.STATE.garden);
};


/* Overshadowing mode functions */
/* These functions should be overshadowed in the game object */
Subgame.prototype.modeIntro      = function () { this._nextMode(); };
Subgame.prototype.modePlayerDo   = function () { this._nextMode(); };
Subgame.prototype.modePlayerShow = function () { this._nextMode(); };
Subgame.prototype.modeAgentTry   = function () { this._nextMode(); };
Subgame.prototype.modeAgentDo    = function () { this._nextMode(); };
Subgame.prototype.modeOutro      = function () { this._nextMode(); };