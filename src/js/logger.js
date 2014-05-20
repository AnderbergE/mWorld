/**
 * Handles the logging of the game and sending to the backend.
 */
(function () {
	var result;
	var trial = {};
	// var garden;

	this.reset = function () {
		result = { modes: [] };
	};

	this.mode = function (mode) {
		if (mode === GLOBAL.MODE.outro) {
			Backend.put(result);
			this.reset();
		} else if (mode !== GLOBAL.MODE.intro) {
			result.modes.push({ type: mode, results: [] });
		}
	};

	this.trial = function (guess, correct) {
		var modeResults = result.modes[result.modes.length-1].results;
		if (modeResults.length <= 0 ||
			!modeResults[modeResults.length-1].target ||
			modeResults[modeResults.length-1].target !== correct) {
			modeResults.push({ target: correct, trials: [] });
		}

		trial.try = guess;
		// TODO: trial.time = 0;
		modeResults[modeResults.length-1].trials.push(trial);
		trial = {};
	};

	this.agentGuess = function (guess) {
		trial.agent = guess;
	};

	this.numberPress = function (value, representations) {
		if (representations[0] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			trial.corrected = value % 2;
		}
	};

	this.water = function (current/*, diff*/) {
		Backend.put({ water: current });
	};

	this.garden = function () {

	};


	this.reset();
	var _this = this;
	Event.subscribe(GLOBAL.EVENT.modeChange,  function (mode) { _this.mode(mode); });
	Event.subscribe(GLOBAL.EVENT.tryNumber,   function (guess, correct) { _this.trial(guess, correct); });
	Event.subscribe(GLOBAL.EVENT.agentGuess,  function (guess/*, correct*/) { _this.agentGuess(guess); });
	Event.subscribe(GLOBAL.EVENT.waterAdded,  function (current, diff) { _this.water(current, diff); });
	Event.subscribe(GLOBAL.EVENT.numberPress, function (value, representations) { _this.numberPress(value, representations); });
	/* Garden */
})();