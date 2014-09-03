/**
 * This is the language variable for the game.
 * All text and speech files for the game should be here.
 * Text strings are in LANG.TEXT.
 * Speech sound files are in LANG.SPEECH.
 * For the agent, use LANG.SPEECH.AGENT.
 *
 * It was developed with switching languages in mind.
 * To do so use function LANG.change.
 * English is the default language and can be used as a
 * template for other languages.
 *
 * NOTE: GLOBAL.FONT specifies which font that is used.
 *
 * @global
 */
var LANG = {};

/**
 * Change the language.
 * NOTE: A warning is set if text or speech are missing translations.
 * @param {Object} text - The text.
 * @param {Object} speech - The speech markers.
 */
LANG.change = function (text, speech) {
	function replacer (orig, plus, missing, prefix) {
		missing = missing || [];
		if (!prefix) { prefix = ''; }
		else { prefix += '/'; }

		for (var p in orig) {
			if (p === 'AGENT') { continue; } // AGENT is special case

			if (!plus.hasOwnProperty(p)) {
				missing.push(prefix + p);
			} else if (typeof orig[p] !== 'string') {
				replacer(orig[p], plus[p], missing, prefix + p);
			} else {
				orig[p] = plus[p];
			}
		}

		return missing;
	}

	var m = replacer(LANG.TEXT, text);
	if (m.length > 0) {
		console.warn('TEXT is missing: ' + m);
	}

	m = replacer(LANG.SPEECH, speech);
	if (m.length > 0) {
		console.warn('SPEECH is missing: ' + m);
	}

	if (player && player.agent && player.agent.prototype.id) {
		LANG.setAgent(player.agent.prototype.id);
	} else { // Use panda as default agent.
		LANG.setAgent(Panda.prototype.id);
	}
};

/**
 * Set the speech for the agent.
 * @param {Object} id - The id of the agent.
 */
LANG.setAgent = function (id) {
	LANG.SPEECH.AGENT = LANG.SPEECH[id];
};

/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                        English language (default)                         */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

LANG.english = {};
LANG.english.text = {
	/* Entry state */
	title: 'Magical Garden',
	start: 'Start playing',
	continuePlaying: 'Continue playing',
	changeAgent: 'Play with another friend',
	credits: 'Credits',
	anonymous: 'Anonymous',
	logOut: 'Log out',

	/* General */
	ok: 'Ok',
	continue: 'Continue playing',
	connectionLost: 'Connection lost',

	/* Garden state */
	maxLevel: 'MAX!',

	/* Player setup state */
	pickFriend: 'Who will be your friend?',
	confirmFriend: 'Choose ',
	changeColor: 'Change colour',

	/* Menu items */
	menu: 'MENU',
	resume: 'Resume',
	gotoGarden: 'Go to garden',
	quit: 'Quit',

	/* Agents */
	pandaName: 'Panders',
	hedgehogName: 'Igis',
	mouseName: 'Mu'
};

LANG.english.speech = {
	/* Garden */
	garden: {
		speech: ['assets/audio/garden/speech.ogg', 'assets/audio/garden/speech.mp3'],
		markers: {
			intro:        [7.3, 12.4],
			ready:        [23.9, 1.6],
			haveWater:    [29.8, 5.8],
			whereTo:      [86.2, 1.7],
			ok:           [39.4, 0.8],
			growing:      [44.8, 1.3],
			fullGrown:    [50, 3.4],
			waterLeft:    [59.9, 3.1],
			waterEmpty:   [74.1, 3.4],
			waterTooFull: [112.3, 6.3]
		}
	},

	/* Subgames */
	birdhero: {
		speech: ['assets/audio/subgames/birdhero/speech.ogg', 'assets/audio/subgames/birdhero/speech.mp3'],
		markers: {
			instruction1a:    [1.8,   8.1],
			instruction1b:    [10.5,  2.7],
			instruction2a:    [81.9,  3.4],
			instruction2b:    [85.9,  3.6],
			thisFloor1:       [17.3,  1.9],
			thisFloor2:       [19.2,  1.5],
			correct:          [39.9,  2  ],
			higher:           [24.8,  2.9],
			lower:            [31.8,  3.3],
			agentIntro:       [53.7,  6.7],
			agentTry:         [64.7,  2.4],
			agentHmm:         [99.6,  1  ],
			agentGuessWeak:   [111.5, 1.5],
			agentGuessNormal: [116.6, 1  ],
			agentGuessStrong: [121.3, 1.7],
			agentCorrected:   [132.2, 2.6],
			agentTryAgain:    [150.8, 1.8],
			ending:           [45.7,  4.4]
		}
	},

	balloongame: {
		speech: ['assets/audio/subgames/balloongame/balloongametalkswedish.ogg', 'assets/audio/subgames/balloongame/balloongametalkswedish.mp3'],
		markers: {
			agenthmm1:      [0,     2.1],
			agenthmm2:      [2.2,   2.3],
			agenthmm3:      [4.6,   2.1],
			agenthmm4:      [6.8,   2.3],
			agentintro:     [9.4,   7.0],
			agentquestion1: [16.5,  1.1],
			agentquestion2: [17.7,  2.1],
			agentquestion3: [19.9,  2.5],
			agenttry:       [22.5,  2.8],
			beetleintro1:   [25.4, 23.2],
			beetleintro2:   [48.7,  2.6],
			beetleintro3:   [51.4, 13.9],
			isitwrong:      [65.4,  2.8],
			newtreasure:    [68.3,  3.7],
			oops:           [72.1,  1.8],
			tryless:        [74.0,  2.6],
			trymore:        [76.7,  2.6],
			yippi:          [27.4,  1.0]
		}
	},

	/* Agents */
	panda: {
		chooseMe:     ['assets/audio/agent/panda/choose_me.ogg', 'assets/audio/agent/panda/choose_me.mp3'],
		hmm:          ['assets/audio/agent/panda/hmm.ogg',       'assets/audio/agent/panda/hmm.mp3'],
		tryAgain:     ['assets/audio/agent/panda/try_again.ogg', 'assets/audio/agent/panda/try_again.mp3'],
		showMe:       ['assets/audio/agent/panda/show_me.ogg',   'assets/audio/agent/panda/show_me.mp3'],
		birdheroShow: ['assets/audio/agent/panda/hello.ogg',     'assets/audio/agent/panda/hello.mp3'],
		birdheroTry:  ['assets/audio/agent/panda/i_try.ogg',     'assets/audio/agent/panda/i_try.mp3']
	},

	// TODO: Add sounds!
	hedgehog: {
		chooseMe:     ['assets/audio/agent/panda/choose_me.ogg', 'assets/audio/agent/panda/choose_me.mp3'],
		hmm:          ['assets/audio/agent/panda/hmm.ogg',       'assets/audio/agent/panda/hmm.mp3'],
		tryAgain:     ['assets/audio/agent/panda/try_again.ogg', 'assets/audio/agent/panda/try_again.mp3'],
		showMe:       ['assets/audio/agent/panda/show_me.ogg',   'assets/audio/agent/panda/show_me.mp3'],
		birdheroShow: ['assets/audio/agent/panda/hello.ogg',     'assets/audio/agent/panda/hello.mp3'],
		birdheroTry:  ['assets/audio/agent/panda/i_try.ogg',     'assets/audio/agent/panda/i_try.mp3']
	},

	// TODO: Add sounds!
	mouse: {
		chooseMe:     ['assets/audio/agent/panda/choose_me.ogg', 'assets/audio/agent/panda/choose_me.mp3'],
		hmm:          ['assets/audio/agent/panda/hmm.ogg',       'assets/audio/agent/panda/hmm.mp3'],
		tryAgain:     ['assets/audio/agent/panda/try_again.ogg', 'assets/audio/agent/panda/try_again.mp3'],
		showMe:       ['assets/audio/agent/panda/show_me.ogg',   'assets/audio/agent/panda/show_me.mp3'],
		birdheroShow: ['assets/audio/agent/panda/hello.ogg',     'assets/audio/agent/panda/hello.mp3'],
		birdheroTry:  ['assets/audio/agent/panda/i_try.ogg',     'assets/audio/agent/panda/i_try.mp3']
	}
};

LANG.TEXT = LANG.english.text;
LANG.SPEECH = LANG.english.speech;
LANG.SPEECH.AGENT = LANG.SPEECH.panda;