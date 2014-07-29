/**
 * Handles the logging of the game and sending to the backend.
 */
(function () {
	var session;
	var trial = {};
	var wasCorrect = true;
	var time = 0;

	function reset () {
		session = { modes: [], tries: 0, corrects: 0, finished: false, water: 0 };
		time = Date.now();
	}


	function subgameStarted (type, token) {
		reset();

		session.type = type;
		session.token = token;
	}

	function stateChange () {
		if (session.tries > 0) {
			Backend.putSession(session);
		}

		reset();
	}


	function modeChange (mode) {
		if (mode === GLOBAL.MODE.outro) {
			session.finished = true;
		} else if (mode !== GLOBAL.MODE.intro) {
			session.modes.push({ type: mode, results: [] });
		}
	}

	function trialData (guess, correct) {
		var modeResults = session.modes[session.modes.length-1].results;
		if (modeResults.length <= 0 || wasCorrect) {
			modeResults.push({ target: correct, trials: [] });
		}

		trial.try = guess;
		trial.time = Date.now() - time;
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

	function startTime () {
		time = Date.now();
	}


	reset();


	/* General */
	EventSystem.subscribe(GLOBAL.EVENT.stateShutDown,
		function (/*state*/) { stateChange(); }, true);

	/* Session related */
	EventSystem.subscribe(GLOBAL.EVENT.subgameStarted,
		function (type, token) { subgameStarted(type, token); }, true);
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
	EventSystem.subscribe(GLOBAL.EVENT.disabled,
		function (value) { if (!value) { startTime(); } }, true);
})();