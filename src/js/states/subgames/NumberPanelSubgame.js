NumberPanelSubgame.prototype = Object.create(Subgame.prototype);
NumberPanelSubgame.prototype.constructor = NumberPanelSubgame;

/**
 * Superclass for games using number panels.
 */
function NumberPanelSubgame () {
	Subgame.call(this); // Call parent constructor.
}

/**
 * Phaser state function.
 * Make sure to have .pos.agent.start and .pos.agent.scale set before calling this function.
 * Also have .getOptions for the button panels (option method and onClick is set in this function).
 *
 * This function will set the .isRelative property, as well as functions:
 * .doStartFunction and .doReturnFunction.
 * NOTE: You need to have these functions in your subclass:
 * startStop, startBelow, startAbove, startThink
 * returnToStart, returnNone, returnToPreviousIfHigher, returnToPreviousIfLower
 */
NumberPanelSubgame.prototype.create = function () {
	// Agent is added to the game in the superclass, so set up correct start point.
	this.agent.x = this.pos.agent.start.x;
	this.agent.y = this.pos.agent.start.y;
	this.agent.scale.set(this.pos.agent.scale);
	this.agent.visible = true;
	this.agent.addThought(this.representation[0]);

	// Setup gameplay differently depending on situation.
	this.isRelative = false;
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

	// Add HUD
	/* This should be modified only when isRelative is set to true. */
	this.addToNumber = 0;

	var _this = this; // Subscriptions to not have access to 'this' object
	var options = this.getOptions();
	options.buttons.method = this.method;
	options.buttons.onClick = function (number) { _this.pushNumber(number); };
	this.buttons = new ButtonPanel(this.amount, this.representation, options.buttons);
	this.buttons.visible = false;
	this.hudGroup.add(this.buttons);

	options.yesnos.onClick = function (value) { _this.pushYesNo(value); };
	this.yesnos = new ButtonPanel(2, GLOBAL.NUMBER_REPRESENTATION.yesno, options.yesnos);
	this.yesnos.visible = false;
	this.hudGroup.add(this.yesnos);
};

/* Have the agent guess a number */
NumberPanelSubgame.prototype.agentGuess = function () {
	var t = new TimelineMax();
	t.addCallback(function () {
		this.agent.guessNumber(this.currentNumber - (this.isRelative ? this.addToNumber : 0), this.buttons.min, this.buttons.max);
	}, 0, null, this);
	t.add(this.agent.think());
	return t;
};

/* Function to trigger when a button in the number panel is pushed */
NumberPanelSubgame.prototype.pushNumber = function (number) {
	return this.runNumber(number + this.addToNumber)
		.addCallback(this.nextRound, null, null, this);
};

/* Function to trigger when a button in the yes-no panel is pushed */
NumberPanelSubgame.prototype.pushYesNo = function (value) {
	if (!value) {
		if (this.speech) {
			this.agent.say(this.speech).play('agentCorrected');
		}
		this.showNumbers();
	} else {
		this.pushNumber(this.agent.lastGuess);
	}
};

/* Show the number panel, hide the yes/no panel and enable input */
NumberPanelSubgame.prototype.showNumbers = function () {
	this.disable(true);
	this.buttons.reset();
	fade(this.yesnos, false);
	fade(this.buttons, true).eventCallback('onComplete', this.disable, false, this);

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Show the yes/no panel, hide the number panel and enable input */
NumberPanelSubgame.prototype.showYesnos = function () {
	this.disable(true);
	this.yesnos.reset();
	fade(this.buttons, false);
	fade(this.yesnos, true).eventCallback('onComplete', this.disable, false, this);

	if (this.agent.visible) { this.agent.eyesFollowPointer(); }
};

/* Hide the number and yes/no panel */
NumberPanelSubgame.prototype.hideButtons = function () {
	this.disable(true);
	fade(this.buttons, false);
	fade(this.yesnos, false);

	if (this.agent.visible) { this.agent.eyesStopFollow(); }
};

/* Update the values of the button panel */
NumberPanelSubgame.prototype.updateButtons = function () {
	if (this.method === GLOBAL.METHOD.addition) {
		this.buttons.setRange(1, this.amount - this.addToNumber);
	} else if (this.method === GLOBAL.METHOD.subtraction) {
		this.buttons.setRange(1 - this.addToNumber, -1);
	} else {
		this.buttons.setRange(1 - this.addToNumber, this.amount - this.addToNumber);
	}
};