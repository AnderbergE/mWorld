/* Holds shared logic for minigames */
/* How to use:
 * Representation: this.representation
 * Amount:         this.amount
 * Current number: this.currentNumber
 *
 * Add game objects to:     this.gameGroup
 * Add buttons and HUD to:  this.hudGroup
 * Add background music to: this.music
 * Use agent with:          this.agent, (its visibility = false)
 *
 * Functions:
 * Add event subscriptions: this.addEvent
 * Start game:              this.startGame
 * Go to next mode:         this.nextMode (only use this in intro-mode, the others change automatically)
 * Run next round:          this.nextRound (this will call the appropriate mode function)
 * Try a number:            this.tryNumber
 *
 * Typical game flow:
 * this.startGame();  // the first mode, intro, will be called
 * this.nextMode();   // change mode, now player only is called
 * this.nextRound();  // start the mode
 * this.tryNumber(x); // try a number against the current one, return true or false
 * this.nextRound();  // do this regardless if you were right or wrong,
 *                    // it takes care of mode switching and function calls for you
 * // Do until game is done, then quit by using: this.state.start(GLOBAL.VIEW.garden);
 */
function Minigame () {}

/* Phaser state function */
Minigame.prototype.init = function (options) {
	this.representation = options.representation;
	this.amount = options.amount;
	this.modes = options.mode || [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerOnly,
		GLOBAL.MODE.agentWatch,
		GLOBAL.MODE.agentTrying,
		GLOBAL.MODE.agentOnly,
		GLOBAL.MODE.outro
	];
	this.currentNumber = null;

	this._mode = null;
	this._first = true;
	this._counter = new Counter(options.roundsPerMode || 3, true);
	this._currentTries = 0;
	this._totalTries = 0;
	this._events = [];

	/* Setup game objects */
	this.gameGroup = game.add.group();
	this.hudGroup = game.add.group();
	this.music = null;
	this.agent = user.agent;
	this.agent.gfx.visible = false;
	this.gameGroup.add(this.agent.gfx);

	//  TODO: Is there an easier way to disable all input, except the menu?
	var bmd = game.add.bitmapData(game.world.width, game.world.height);
	bmd.ctx.fillRect(0, 0, game.world.width, game.world.height);
	var disabler = game.add.sprite(0, 0, bmd);
	disabler.alpha = 0;
	disabler.inputEnabled = true;
	this.disable = function (value) { disabler.visible = value; };
};

/* Phaser state function */
Minigame.prototype.shutdown = function () {
	if (this.music) {
		this.music.stop();
	}

	for (var i = 0; i < this._events.length; i++) {
		unsubscribe(this._events[i]);
	}
};

/* Always add event subscriptions in this way, so we can remove them when shutting down */
Minigame.prototype.addEvent = function (ev, func) {
	this._events.push(subscribe(ev, func));
};
Minigame.prototype.removeEvent = function (ev) {
	for (var i = 0; i < this._events.length; i++) {
		if (this._events[i] === ev) {
			unsubscribe(this._events[i]);
			break;
		}
	}
};

Minigame.prototype.nextRound = function () {
	this._mode(this._first, this._currentTries);
	this._first = false;
};

Minigame.prototype.decideMode = function (mode) {
	if (mode === GLOBAL.MODE.intro) {
		this._mode = this.modeIntro;
	} else if (mode === GLOBAL.MODE.playerOnly) {
		this._mode = this.modePlayerOnly;
	} else if (mode === GLOBAL.MODE.agentWatch) {
		this._mode = this.modeAgentWatch;
	} else if (mode === GLOBAL.MODE.agentTrying) {
		this._mode = this.modeAgentTrying;
	} else if (mode === GLOBAL.MODE.agentOnly) {
		this._mode = this.modeAgentOnly;
	} else { // mode === GLOBAL.MODE.outro
		this._mode = this.modeOutro;
	}
};

Minigame.prototype.nextMode = function () {
	var newMode = this.modes.shift();
	this.decideMode(newMode);
	this._first = true;
	publish(GLOBAL.EVENT.modeChange, [newMode]);
};

Minigame.prototype.nextNumber = function () {
	// Should we allow the same number again?
	this._totalTries += this._currentTries;
	this._currentTries = 0;
	this.currentNumber = parseInt(1+Math.random()*this.amount);
	return this.currentNumber;
};

Minigame.prototype.tryNumber = function (number) {
	this._currentTries++;
	var correct = number === this.currentNumber;
	if (correct) {
		if (this._counter.add(1)) {
			this.nextMode();
		}
		this.nextNumber();
	}
	publish(GLOBAL.EVENT.tryNumber, [this.currentNumber, number]);
	return correct;
};

Minigame.prototype.startGame = function () {
	menu(this);
	this.nextMode();
	this.nextNumber();
	this.nextRound();
};


/* Extendable mode functions */
Minigame.prototype.modeIntro       = function () { this.nextMode(); };
Minigame.prototype.modePlayerOnly  = function () { this.nextMode(); };
Minigame.prototype.modeAgentWatch  = function () { this.nextMode(); };
Minigame.prototype.modeAgentTrying = function () { this.nextMode(); };
Minigame.prototype.modeAgentOnly   = function () { this.nextMode(); };
Minigame.prototype.modeOutro       = function () { this.nextMode(); };