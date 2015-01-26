var backend = require('./backend.js');
var GLOBAL = require('./global.js');
var EventSystem = require('./pubsub.js');

/**
 * Handles the logging of the game and sending to the backend.
 */
(function () {
	var session;
	var trial = {};
	var wasCorrect = true;
	var time = 0;

	/**
	 * Reset the current values of a session.
	 */
	function reset () {
		session = { modes: [], tries: 0, corrects: 0, finished: false, water: 0 };
		time = Date.now();
	}

	/**
	 * Log when a subgame has started.
	 * @param {string} type - The name of the subgame.
	 * @param {number} token - The token recieved from backend (session id).
	 */
	function subgameStarted (type, token) {
		reset();

		session.type = type;
		session.token = token;
	}

	/**
	 * A subgame of type number game has started.
	 * @param {number} method - Method used for subgame.
	 * @param {number} maxAmount - The max number used in the subgame.
	 * @param {number} representation - The representation of the numbers.
	 */
	function numbergameStarted (method, maxAmount, representation) {
		session.method = method;
		session.maxAmount = maxAmount;
		session.representation = representation;
	}

	/**
	 * Game state has changed. Possibly from a subgame to garden.
	 */
	function stateChange () {
		// If we were in a subgame, then tries should be set.
		if (session.tries > 0) {
			backend.putSession(session);
		}

		reset();
	}

	/**
	 * The mode in a subgame has changed.
	 * @param {number} mode - The new mode.
	 */
	function modeChange (mode) {
		if (mode === GLOBAL.MODE.outro) {
			// If we get the outro mode, then we know the player completed the subgame.
			session.finished = true;

		} else if (typeof mode !== 'undefined' && mode !== GLOBAL.MODE.intro) {
			// Create new mode item.
			session.modes.push({ type: mode, results: [] });
		}
	}

	/**
	 * A trial has been executed (someone has tried to answer a problem).
	 * @param {number} guess - The players guess.
	 * @param {number} correct - The actual correct value.
	 * @param {number} pushed - The value that was pushed (used in mode addition, subtraction and add/sub).
	 * @param {number} start - The value the trial started at (used in mode addition, subtraction and add/sub).
	 */
	function trialData (guess, correct, pushed, start) {
		var modeResults = session.modes[session.modes.length-1].results;
		if (modeResults.length <= 0 || wasCorrect) {
			modeResults.push({ target: correct, trials: [] });
		}

		trial.try = guess;
		if (session.method >= GLOBAL.METHOD.addition) {
			trial.chosenValue = pushed;
			trial.startValue = start;
		}
		trial.time = Date.now() - time;

		// This is where trial data is saved.
		// It might however have data from other functions than this.
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

	/**
	 * An agent has guessed something.
	 * @param {number} guess - The guess.
	 */
	function agentGuess (guess) {
		trial.agent = guess;
	}

	/**
	 * A number button has been pressed.
	 * Currently this only checks yesno pushes, others are logged in trialData.
	 * @param {number} value - The guess.
	 * @param {number} representations - The representations of the button.
	 */
	function numberPress (value, representations) {
		if (representations[0] === GLOBAL.NUMBER_REPRESENTATION.yesno) {
			// The button was correcting an agent.
			trial.corrected = (value % 2) === 0; // yes = 1, no = 0
		}
	}

	/**
	 * Add water to the session.
	 */
	function water () {
		session.water++;
	}

	/**
	 * Set the start time for a session.
	 */
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
	EventSystem.subscribe(GLOBAL.EVENT.numbergameStarted,
		function (method, maxAmount, representation) { numbergameStarted(method, maxAmount, representation); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.modeChange,
		function (mode) { modeChange(mode); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.tryNumber,
		function (guess, correct, chosen, start) { trialData(guess, correct, chosen, start); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.agentGuess,
		function (guess/*, correct*/) { agentGuess(guess); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.waterAdded,
		function (/*current, diff*/) { water(); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.numberPress,
		function (value, representations) { numberPress(value, representations); }, true);
	EventSystem.subscribe(GLOBAL.EVENT.disabled,
		function (value) { if (!value) { startTime(); } }, true);
})();