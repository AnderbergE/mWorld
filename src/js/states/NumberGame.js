/**
 * A superclass for games where you need to guess the correct number.
 * How to use:
 * VARIABLES:
 * Number amount:        this.amount
 * Representation:       this.representation
 * The method:           this.method
 * The number to answer: this.currentNumber (updates automatically)
 *
 * FUNCTIONS:
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

NumberGame.prototype.startGame = function () {
	this._nextNumber();
	Subgame.prototype.startGame.call(this);
};