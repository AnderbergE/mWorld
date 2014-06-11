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
 */
var LANG = {};

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
	start: 'Start',
	credits: 'Credits',

	/* Garden state */
	maxLevel: 'MAX!',

	/* Player setup state */
	pickFriend: 'Who will be your friend?',

	/* Menu items */
	menu: 'MENU',
	resume: 'Resume',
	quit: 'Quit',

	/* Agents */
	pandaName: 'Panders'
};

LANG.english.speech = {
	birdhero: {
		speech: ['assets/audio/subgames/birdhero/speech.ogg', 'assets/audio/subgames/birdhero/speech.mp3'],
		markers: {
			'instruction1a':    [1.8,   8.1],
			'instruction1b':    [10.5,  2.7],
			'floor':            [17.3,  3.5],
			'higher':           [24.8,  2.9],
			'lower':            [31.8,  3.3],
			'correct':          [39.9,  2  ],
			'ending':           [45.7,  4.4],
			'agentIntro':       [53.7,  6.7],
			'agentTry':         [64.7,  2.4],
			'instruction2':     [81.9,  7.6],
			'agentHmm':         [99.6,  1  ],
			'agentGuessWeak':   [111.5, 1.5],
			'agentGuessNormal': [116.6, 1  ],
			'agentGuessStrong': [121.3, 1.7],
			'agentCorrected':   [132.2, 2.6],
			'agentTryAgain':    [150.8, 1.8]
		}
	},

	/* Agents */
	panda: {
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