/**
 * Handles the logging of the game and sending to the backend.
 */
(function () {
	var session;
	var trial = {};
	var wasCorrect = true;

	function reset () {
		session = { modes: [], tries: 0, corrects: 0, water: 0 };
	}

	function modeChange (mode) {
		if (mode === GLOBAL.MODE.outro) {
			Backend.put(session);
		} else if (mode !== GLOBAL.MODE.intro) {
			session.modes.push({ type: mode, results: [] });
		} else {
			reset();
		}
	}

	function trialData (guess, correct) {
		var modeResults = session.modes[session.modes.length-1].results;
		if (modeResults.length <= 0 || wasCorrect) {
			modeResults.push({ target: correct, trials: [] });
		}

		trial.try = guess;
		// TODO: trial.time = 0;
		modeResults[modeResults.length-1].trials.push(trial);

		session.tries++;
		if (guess === correct) {
			session.corrects++;
			wasCorrect = true;
		} else {
			wasCorrect = false;
		}

		trial = {}; // Reset trial
	}

	function agentGuess (guess) {
		trial.agent = guess;
	}

	function numberPress (value, representations) {
		if (representations[0] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			trial.corrected = (value % 2) === 0; // yes = 1, no = 0
		}
	}

	function water () {
		session.water++;
	}

	function plantLevel (id, level) {
		Backend.put([{ id: id, level: level }]);
	}


	reset();


	/* Session related */
	EventSystem.subscribe(GLOBAL.EVENT.modeChange,
		function (mode) { modeChange(mode); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.tryNumber,
		function (guess, correct) { trialData(guess, correct); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.agentGuess,
		function (guess/*, correct*/) { agentGuess(guess); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.waterAdded,
		function (/*current, diff*/) { water(); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.numberPress,
		function (value, representations) { numberPress(value, representations); }, true);

	/* Garden related */
	EventSystem.subscribe(GLOBAL.EVENT.plantLevelUp,
		function (id, level) { plantLevel(id, level); }, true);
	/* EventSystem.subscribe(GLOBAL.EVENT.plantWaterUp,
		function (id, current) { plantWater(id, current); }, true); */
})();