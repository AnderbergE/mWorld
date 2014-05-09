/**
 * Holds shared logic for subgames.
 * How to use:
 * Number amount:        this.amount
 * Representation:       this.representation
 * The number to answer: this.currentNumber
 *
 * Add game objects to:     this.gameGroup
 * Add buttons and HUD to:  this.hudGroup
 * Use agent with:          this.agent (default visibility = false)
 *
 *
 * Functions:
 * Disable/Enable input:    this.disable (default is disabled)
 * Add event subscriptions: this.addEvent
 * Start game:              this.startGame
 * Go to next mode:         this.nextMode (only use this in intro-mode, the others change automatically)
 * Run next round:          this.nextRound (this will call the appropriate mode function)
 * Try a number:            this.tryNumber
 * Add water to the can:    this.addWater
 *
 * These function should be overshadowed by the game:
 * modeIntro      // Introduce the game, call nextMode and nextRound to start next mode.
 * modePlayerDo   // Player only
 * modePlayerShow // Player is showing the TA
 * modeAgentTry   // TA is guessing and the player is helping out
 * modeAgentDo    // TA only
 * modeOutro      // The game is finished, celebrate!
 *
 *
 * Typical game flow:
 * this.startGame();    // the first mode, this.modeIntro, will be called
 * this.nextMode();     // change mode, now this.modePlayerDo will be called
 * this.nextRound();    // start the mode
 * this.disable(false); // Make it possible to press anything.
 * this.tryNumber(x);   // try a number against the current one, returns true or false
 * this.nextRound();    // do this regardless if right or wrong,
 *                      // it takes care of mode switching and function calls for you
 * // Do until game is done, then quit by using: this.state.start(GLOBAL.STATE.garden);
 */
function Subgame () {}

/* Phaser state function */
Subgame.prototype.init = function (options) {
	/* "Private" variables */
	var _this = this; // Event subscriptions does not have access to this
	this._modes = options.mode || [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerDo,
		GLOBAL.MODE.playerShow,
		GLOBAL.MODE.agentTry,
		GLOBAL.MODE.agentDo,
		GLOBAL.MODE.outro
	];
	this._mode = null;
	this._pendingMode = null;
	this._first = true;
	/* Keep track of how many rounds that have been played */
	this._counter = new Counter(options.roundsPerMode || 3, true);
	/* When enough rounds have been played, trigger a mode change */
	this._counter.onMax = function () {
		_this.nextMode();
	};
	this._currentTries = 0;
	this._totalTries = 0;
	this._events = [];
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
	disabler.inputEnabled = true;
	game.world.add(disabler);
	this.disable = function (value) { disabler.visible = value; };

	this.menuGroup = game.add.group();
	this.waterCan = new WaterCan(this.game.width - 100, 10);
	this.menuGroup.add(this.waterCan);
	this.menuGroup.add(new Menu());
	this.skipButton = game.add.button(75, 5, 'wood', this.skip, this, 0, 0, 1, 0, this.menuGroup);
	this.skipButton.visible = false;
	this.menuGroup.visible = false;
};

/* Phaser state function */
Subgame.prototype.shutdown = function () {
	TweenMax.killAll();
	this.sound.stopAll();

	for (var i = 0; i < this._events.length; i++) {
		unsubscribe(this._events[i]);
	}
};

Object.defineProperty(Subgame.prototype, 'skipper', {
	get: function() { return this._skipper; },
	set: function(value) {
		this._skipper = value;
		if (this._skipper){
			this.skipButton.visible = true;
			this._skipper.addCallback(function () {
				this.skipper = null;
			}, null, null, this);
		} else {
			this.skipButton.visible = false;
		}
	}
});

/* Skip a timeline. How to:
 * Set 'this.skipper' to a timeline (a skip button will appear next to the menu)
 * When the timeline is complete, make sure to set 'this.skipper' to null.
 */
Subgame.prototype.skip = function () {
	if (this.skipper) {
		this.skipper.totalProgress(1);
	}
};

/* Always add event subscriptions with these functions, they are then removed when shutting down */
/**
 * Subscribe to an event.
 * @param {*} The name of the event
 * @param {Function} The function to run when the event is published
 */
Subgame.prototype.addEvent = function (ev, func) {
	this._events.push(subscribe(ev, func));
};

/**
 * Unsubscribe to an event.
 * @param {*} The name of the event
 */
Subgame.prototype.removeEvent = function (ev) {
	for (var i = 0; i < this._events.length; i++) {
		if (this._events[i] === ev) {
			unsubscribe(this._events[i]);
			break;
		}
	}
};

/**
 * Calls the current mode function.
 * It will be called with two parameters:
 * 1) If it is the first time on this mode.
 * 2) How many tries that have been made on the current number.
 */
Subgame.prototype.nextRound = function () {
	this._mode(this._first, this._currentTries);
	this.currentMode = this._pendingMode;
	this._first = false;
};

/**
 * Translate from integer to mode function
 * @param {Number}
 */
Subgame.prototype.decideMode = function (mode) {
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
	} else { // mode === GLOBAL.MODE.outro
		this._mode = this.modeOutro;
	}
};

/** Change to the next mode in the queue (publishes modeChange event). */
Subgame.prototype.nextMode = function () {
	var newMode = this._modes.shift();
	this.decideMode(newMode);
	this._pendingMode = newMode;
	this._first = true;
	publish(GLOBAL.EVENT.modeChange, [newMode]);
};

/** Change this.currentNumber to a new one (resets the tries). */
Subgame.prototype.nextNumber = function () {
	// Should we allow the same number again?
	this._totalTries += this._currentTries;
	this._currentTries = 0;
	this.currentNumber = parseInt(1+Math.random()*this.amount);
};

/**
 * Try a number against this.currentNumber (publishes tryNumber event).
 * The offset of the last try is stored in this.lastTry.
 *
 * @param {Number} The number to try.
 * @returns {Boolean} The offset of the last try (0 is correct, -x is too low, +x is too high).
 */
Subgame.prototype.tryNumber = function (number) {
	this._currentTries++;
	this.lastTry = number - this.currentNumber;

	if (!this.lastTry) {
		this._counter.value++; // This will trigger next mode if we loop.
		this.nextNumber();
	}
	publish(GLOBAL.EVENT.tryNumber, [this.currentNumber, number]);
	return this.lastTry;
};

Subgame.prototype.addWater = function (x, y, force) {
	var t = new TimelineMax();
	if (this.currentMode === GLOBAL.MODE.playerShow ||
		this.currentMode === GLOBAL.MODE.agentTry ||
		this.currentMode === GLOBAL.MODE.agentDo ||
		force) {
		var drop = this.add.sprite(x, y, 'drop', 0, this.menuGroup);
		drop.anchor.setTo(0.5);
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
	this.nextMode();
	this.nextNumber();
	this.nextRound();
};

/* Overshadowing mode functions */
/* These functions should be overshadowed in the game object */
Subgame.prototype.modeIntro      = function () { this.nextMode(); };
Subgame.prototype.modePlayerDo   = function () { this.nextMode(); };
Subgame.prototype.modePlayerShow = function () { this.nextMode(); };
Subgame.prototype.modeAgentTry   = function () { this.nextMode(); };
Subgame.prototype.modeAgentDo    = function () { this.nextMode(); };
Subgame.prototype.modeOutro      = function () { this.nextMode(); };