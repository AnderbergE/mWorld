/**
 * A superclass for games where you need to guess the correct number.
 * This class will set the .doStartFunction and .doReturnFunction.
 * They will map to the functions that you should setup (see _setupFunctions).
 * See BeeFlightGame for inspiration of how you can use this class.
 *
 * SETUP THESE IN THE SUBCLASS:
 * "this" object should have a property used when setting agent start position:
 *    this.pos: { agent: { start: { x, y }, scale: z } } }.

 * startStop:  When round start without automatic "guessing". Used in count and incremental-steps method.
 * startBelow: When round start by guessing lower than target. Used in addition method.
 * startAbove: When round start by guessing higher than target. Used in subtraction method.
 * startThink: When round start by guessing something. Used in add/subt method.

 * runNumber:  The function to run when a number has been chosen.

 * returnToStart:            When returning to the start position on incorrect answer.
 * returnNone:               When the game stays at the incorrect answer position.
 * returnToPreviousIfHigher: When returning to previous value if the incorrect answer was too high.
 * returnToPreviousIfLower:  When returning to previous value if the incorrect answer was too low.
 *
 * VARIABLES THE SUBCLASS CAN USE:
 * Number amount:        this.amount
 * Representation:       this.representation
 * The method:           this.method
 * The number to answer: this.currentNumber (updates automatically)
 *
 * FUNCTIONS THE SUBCLASS CAN USE:
 * Try a number: this.tryNumber(number) - when testing a guess against this.currentNumber
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
NumberGame.prototype = Object.create(Subgame.prototype);
NumberGame.prototype.constructor = NumberGame;
function NumberGame () {
	Subgame.call(this); // Call parent constructor.
}

/* 
 * Phaser state function.
 * Publishes subgameStarted event.
 */
NumberGame.prototype.init = function (options) {
	Subgame.prototype.init.call(this, options);

	/* Public variables */
	this.method = parseInt(options.method || GLOBAL.METHOD.count);
	this.representation = options.representation;
	this.amount = GLOBAL.NUMBER_RANGE[options.range];
	/* The current number to answer */
	this.currentNumber = null;
	/* Stores the offset of the last try, can be used to judge last try */
	/* Ex: -1 means that last try was one less than currentNumber */
	this.lastTry = 0;
	/* This should be used to save the current position. */
	this.atValue = 0;
	/* This is used to add to the number of the button pushes. */
	/* This should be modified only when isRelative is set to true. */
	this.addToNumber = 0;

	// Setup gameplay differently depending on situation.
	this.isRelative = false;
	this._setupFunctions();

	/* Numbers for randomisation. */
	this._weighted = this.amount > 4 && this.method === GLOBAL.METHOD.count;
	this._numberMin = 1;
	this._numberMax = this.amount;
	if (this.method === GLOBAL.METHOD.addition) {
		this._numberMin++;
	}
	if (this.method === GLOBAL.METHOD.subtraction) {
		this._numberMax--;
	}

	// Agent is added to the game in the superclass, but we set it up here.
	this.agent.x = this.pos.agent.start.x;
	this.agent.y = this.pos.agent.start.y;
	this.agent.scale.set(this.pos.agent.scale);
	this.agent.visible = true;
	this.agent.addThought(this.representation[0], this.pos.agent.mirror || false);

	var _this = this;
	this.agent.moveTo = {
		start: function () {
			if (_this.agent.x === _this.pos.agent.stop.x &&
				_this.agent.y === _this.pos.agent.stop.y) {
				return new TweenMax(_this.agent);
			}
			return _this.agent.move({ x: _this.pos.agent.stop.x, y: _this.pos.agent.stop.y }, 3);
		}
	};
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Private functions                              */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/**
 * Setup start and return functions.
 * Will map to the functions the subclass should overshadow (see bottom of this class).
 * The .doStartFunction is an easy way to call the appropriate start function.
 * The .doReturnFunction is an wasy way to call the appropriate return function when answer is incorrect.
 */
NumberGame.prototype._setupFunctions = function () {
	if (this.method === GLOBAL.METHOD.count) {
		this.doStartFunction = this.startStop;
		this.doReturnFunction = this.returnToStart;
	} else if (this.method === GLOBAL.METHOD.incrementalSteps) {
		this.doStartFunction = this.startStop;
		this.doReturnFunction = this.returnNone;
	} else if (this.method === GLOBAL.METHOD.addition) {
		this.doStartFunction = this.startBelow;
		this.doReturnFunction = this.returnToPreviousIfHigher;
		this.isRelative = true;
	} else if (this.method === GLOBAL.METHOD.subtraction) {
		this.doStartFunction = this.startAbove;
		this.doReturnFunction = this.returnToPreviousIfLower;
		this.isRelative = true;
	} else {
		this.doStartFunction = this.startThink;
		this.doReturnFunction = this.returnNone;
		this.isRelative = true;
	}
};

/** Change this.currentNumber to a new one (resets the tries). */
NumberGame.prototype._nextNumber = function () {
	// Should we allow the same number again?
	this._totalTries += this._currentTries;
	this._currentTries = 0;

	// Weighted randomisation if applicable
	if (this._weighted && this.rnd.frac() < 0.2) {
		this.currentNumber = this.rnd.integerInRange(5, this._numberMax);
	} else {
		this.currentNumber = this.rnd.integerInRange(this._numberMin, this._numberMax);
	}
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                            Public functions                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/**
 * Try a number against this.currentNumber.
 * The offset of the last try is stored in this.lastTry.
 * Publishes tryNumber event.
 * @param {number} The number to try.
 * @param {number} The offset to the number (example if you start at 2).
 * @return {boolean} The offset of the last try (0 is correct, -x is too low, +x is too high).
 */
NumberGame.prototype.tryNumber = function (number, offset) {
	var sum = number + (offset || 0);
	EventSystem.publish(GLOBAL.EVENT.tryNumber, [sum, this.currentNumber, number, offset]);
	this._currentTries++;
	this.lastTry = sum - this.currentNumber;

	if (!this.lastTry) {
		this._counter.value++; // This will trigger next mode if we loop.
		this._nextNumber();
	}
	return this.lastTry;
};

/** Have the agent guess a number. */
NumberGame.prototype.agentGuess = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.agent.guessNumber(this.currentNumber - (this.isRelative ? this.addToNumber : 0),
			this.buttons ? this.buttons.min : 1,
			this.buttons ? this.buttons.max : this.amount);
	}, 0, null, this);
	t.add(this.agent.think());
	return t;
};

/**
 * Setup HUD buttons.
 * @param {Object} options - The options for the buttons
 *                           Supply like this: { buttons: {...}, yesnos: {...} }.
 *                           NOTE: .method and .onClick will be set in this function.
 */
NumberGame.prototype.setupButtons = function (options) {
	var _this = this;
	if (options.buttons) {
		options.buttons.method = this.method;
		options.buttons.onClick = function (number) { _this.pushNumber(number); };
		this.buttons = new ButtonPanel(this.amount, this.representation, options.buttons);
		this.buttons.visible = false;
		this.hudGroup.add(this.buttons);
	}

	if (options.yesnos) {
		options.yesnos.onClick = function (value) { _this.pushYesNo(value); };
		this.yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, options.yesnos);
		this.yesnos.visible = false;
		this.hudGroup.add(this.yesnos);
	}
};

/* Function to trigger when a button in the number panel is pushed. */
NumberGame.prototype.pushNumber = function (number) {
	return this.runNumber(number)
		.addCallback(this.nextRound, null, null, this);
};

/* Function to trigger when a button in the yes-no panel is pushed. */
NumberGame.prototype.pushYesNo = function (value) {
	if (!value) {
		if (this.speech) {
			this.agent.say(this.speech).play('agentCorrected');
		}
		this.showNumbers();
	} else {
		this.pushNumber(this.agent.lastGuess);
	}
};

/* Show the number panel, hide the yes/no panel and enable input. */
NumberGame.prototype.showNumbers = function () {
	this.disable(true);
	if (this.buttons) {
		this.buttons.reset();
		if (this.isRelative) {
			this.updateButtons();
		}
		fade(this.buttons, true).eventCallback('onComplete', this.disable, false, this);
	}
	if (this.yesnos) {
		fade(this.yesnos, false);
	}

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Show the yes/no panel, hide the number panel and enable input. */
NumberGame.prototype.showYesnos = function () {
	this.disable(true);
	if (this.buttons) {
		fade(this.buttons, false);
	}
	if (this.yesnos) {
		this.yesnos.reset();
		fade(this.yesnos, true).eventCallback('onComplete', this.disable, false, this);
	}

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Hide the number and yes/no panel. */
NumberGame.prototype.hideButtons = function () {
	this.disable(true);
	if (this.buttons) {
		fade(this.buttons, false);
	}
	if (this.yesnos) {
		fade(this.yesnos, false);
	}

	if (this.agent.visible) { this.agent.eyesStopFollow(); }
};

/* Update the values of the button panel. */
NumberGame.prototype.updateButtons = function () {
	if (this.method === GLOBAL.METHOD.addition) {
		this.buttons.setRange(1, this.amount - this.addToNumber);
	} else if (this.method === GLOBAL.METHOD.subtraction) {
		this.buttons.setRange(1 - this.addToNumber, -1);
	} else {
		this.buttons.setRange(1 - this.addToNumber, this.amount - this.addToNumber);
	}
};

/* Update the relative value. */
NumberGame.prototype.updateRelative = function () {
	if (this.isRelative) {
		this.addToNumber = this.atValue;
	}
};

/* Start the game. */
NumberGame.prototype.startGame = function () {
	this._nextNumber();
	Subgame.prototype.startGame.call(this);
};


/* The following functions should be overshadowed in the game object. */
NumberGame.prototype.pos = { agent: { start: { x: 0, y: 0 }, scale: 1 } };
NumberGame.prototype.startStop = function () {};
NumberGame.prototype.startBelow = function () {};
NumberGame.prototype.startAbove = function () {};
NumberGame.prototype.startThink = function () {};
NumberGame.prototype.returnToStart = function () {};
NumberGame.prototype.returnNone = function () {};
NumberGame.prototype.returnToPreviousIfHigher = function () {};
NumberGame.prototype.returnToPreviousIfLower = function () {};