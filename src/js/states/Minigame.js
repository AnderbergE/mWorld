/* Holds shared logic for minigames */
function Minigame () {}

Minigame.prototype.init = function (options) {
	this.representation = options.representation;
	this.amount = options.amount;
	this.mode = options.mode || [
		GLOBAL.MODE.intro,
		GLOBAL.MODE.playerOnly,
		GLOBAL.MODE.agentWatch,
		GLOBAL.MODE.agentTrying,
		GLOBAL.MODE.agentOnly,
		GLOBAL.MODE.outro
	];

	this.numbersPerMode = options.roundsPerMode || 3;
	this.numbersLeft = this.numbersPerMode;
	this.currentMode = -1;
	this.nextRound = null;
	this.currentNumber = null;
	this.introduceMode = true;
	this.currentTries = 0;
	this.totalTries = 0;

	this.events = [];

	this.gameGroup = game.add.group();
	this.hudGroup = game.add.group();

	this.agent = user.agent;
	this.agent.gfx.visible = false;
	this.gameGroup.add(this.agent.gfx);
};

Minigame.prototype.shutdown = function () {
	for (var i = 0; i < this.events.length; i++) {
		unsubscribe(this.events[i]);
	}
};

Minigame.prototype.addEvent = function (ev, func) {
	this.events.push(subscribe(ev, func));
};

Minigame.prototype.removeEvent = function (ev) {
	for (var i = 0; i < this.events.length; i++) {
		if (this.events[i] === ev) {
			unsubscribe(this.events[i]);
			break;
		}
	}
};

Minigame.prototype.modeIntro = function () { this.nextMode(); };
Minigame.prototype.modePlayerOnly = function () { this.nextMode(); };
Minigame.prototype.modeAgentWatch = function () { this.nextMode(); };
Minigame.prototype.modeAgentTrying = function () { this.nextMode(); };
Minigame.prototype.modeAgentOnly = function () { this.nextMode(); };
Minigame.prototype.modeOutro = function () { this.nextMode(); };

Minigame.prototype.decideMode = function (mode) {
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

Minigame.prototype.nextMode = function () {
	this.currentMode++;
	this.numbersLeft = this.numbersPerMode;
	this.nextNumber();

	var newMode = this.mode[this.currentMode];
	this.decideMode(newMode);
	this.introduceMode = true;
	publish(GLOBAL.EVENT.modeChange, [newMode]);
};

Minigame.prototype.nextNumber = function () {
	// Should we allow the same number again?
	this.totalTries += this.currentTries;
	this.currentTries = 0;
	this.currentNumber = parseInt(1+Math.random()*this.amount);
	publish(GLOBAL.EVENT.numberChange, [this.currentNumber]);
	return this.currentNumber;
};

Minigame.prototype.tryNumber = function (number) {
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

Minigame.prototype.startGame = function () {
	menu(this);
	this.nextMode();
	this.nextRound();
};