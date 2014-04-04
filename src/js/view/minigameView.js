/*
 * Inherits View
 * Holds shared logic for the different minigames.
 */
function MinigameView (representation, amount, mode) {
	View.call(this); // Call parent constructor.
	this.gameGroup = game.add.group(this.group);
	this.hudGroup = game.add.group(this.group);

	this.representation = representation;
	this.amount = amount;
	this.mode = mode || [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerOnly,
		GLOBAL.MODE.agentWatch,
		GLOBAL.MODE.agentTrying,
		GLOBAL.MODE.agentOnly,
		GLOBAL.MODE.outro
	];
	this.numbersPerMode = 3;
	this.numbersLeft = this.numbersPerMode;
	this.currentMode = -1;
	this.currentNumber = null;
	this.introduceMode = true;
	this.currentTries = 0;
	this.totalTries = 0;

	this.agent = user.agent;
	this.agent.gfx.visible = false;
	this.gameGroup.add(this.agent.gfx);

	this.nextRound = null;

	return this;
}

// inheritance
MinigameView.prototype = new View();
MinigameView.prototype.constructor = MinigameView;
MinigameView.prototype.toString = function () { return 'MinigameView'; };

MinigameView.prototype.modeIntro = function () { this.nextMode(); };
MinigameView.prototype.modePlayerOnly = function () { this.nextMode(); };
MinigameView.prototype.modeAgentWatch = function () { this.nextMode(); };
MinigameView.prototype.modeAgentTrying = function () { this.nextMode(); };
MinigameView.prototype.modeAgentOnly = function () { this.nextMode(); };
MinigameView.prototype.modeOutro = function () { this.nextMode(); };

MinigameView.prototype.startGame = function () {
	this.nextMode();
	this.nextRound();
};

MinigameView.prototype.getMode = function () {
	return this.mode[this.currentMode];
};

MinigameView.prototype.decideMode = function (mode) {
	if (mode === GLOBAL.MODE.intro) {
		this.nextRound = this.modeIntro;
	} else if (mode === GLOBAL.MODE.playerOnly) {
		this.nextRound = this.modePlayerOnly;
	} else if (mode === GLOBAL.MODE.agentWatch) {
		this.nextRound = this.modeAgentWatch;
	} else if (mode === GLOBAL.MODE.agentTrying) {
		this.nextRound = this.modeAgentTrying;
	} else if (mode === GLOBAL.MODE.agentOnly) {
		this.nextRound = this.modeAgentOnly;
	} else { // mode === GLOBAL.MODE.outro
		this.nextRound = this.modeOutro;
	}
};

MinigameView.prototype.nextMode = function () {
	this.currentMode++;
	this.numbersLeft = this.numbersPerMode;
	this.nextNumber();

	var newMode = this.mode[this.currentMode];
	this.decideMode(newMode);
	this.introduceMode = true;
	publish(GLOBAL.EVENT.modeChange, [newMode]);
};

MinigameView.prototype.nextNumber = function () {
	// Should we allow the same number again?
	this.totalTries += this.currentTries;
	this.currentTries = 0;
	this.currentNumber = parseInt(1+Math.random()*this.amount);
	publish(GLOBAL.EVENT.numberChange, [this.currentNumber]);
	return this.currentNumber;
};

MinigameView.prototype.tryNumber = function (number) {
	this.currentTries++;
	this.introduceMode = false;
	var correct = number === this.currentNumber;
	if (correct) {
		this.numbersLeft--;
		if (this.numbersLeft <= 0) {
			this.nextMode();
		} else {
			this.nextNumber();
		}
	}
	return correct;
};