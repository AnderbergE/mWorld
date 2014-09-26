/**
 * This is the language variable for the game.
 * All text and speech files for the game should be here.
 * Text strings are in LANG.TEXT.
 * Speech sound files are in LANG.SPEECH.
 * For the agent, use LANG.SPEECH.AGENT.
 *
 * It was developed with switching languages in mind.
 * To do so use function LANG.change.
 * Swedish is the default language and should be used as a
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
/*                        Swedish language (default)                         */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

LANG.swedish = {};
LANG.swedish.text = {
	/* General */
	ok: 'Ok',
	decoding: 'Snart klar...', // When decoding sound files
	connectionLost: 'Ingen anslutning',
	connectionLostMessage: 'Ajdå. Vi tappade anslutningen till servern.',

	/* Entry state */
	title: 'Magical Garden',
	start: 'Starta!',
	continuePlaying: 'Fortsätt',
	changeAgent: 'Byt ut ', // Followed by agent name
	credits: 'Skapat av',
	anonymous: 'Anonym',
	logOut: 'Logga ut',

	/* Credits */
	creditsMade: 'Detta spelet är skapat vid Lunds Universitet',
	creditsDeveloped: 'Idé och utformning',
	creditsProgramming: 'Programmering',
	creditsGraphics: 'Grafik',
	creditsMusic: 'Musik',
	creditsThanks: 'Tack till',

	/* Garden state */
	maxLevel: 'MAX!',

	/* Player setup state */
	pickFriend: 'Vem vill du bli kompis med?',
	confirmFriend: 'Välj ', // Followed by agent name
	changeColor: 'Byt färg',

	/* Menu items */
	menu: 'MENY',
	resume: 'Fortsätt',
	gotoGarden: 'Gå till trädgården',
	quit: 'Avsluta spelet',

	/* Agents */
	pandaName: 'Panders',
	hedgehogName: 'Igis',
	mouseName: 'Mille'
};

LANG.swedish.speech = {
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
		speech: ['assets/audio/subgames/balloongame/swedish.ogg', 'assets/audio/subgames/balloongame/swedish.mp3'],
		markers: {
			yippie1:        [ 0.1, 1.3],
			yippie2:        [ 2.2, 0.8],
			loveTreasures:  [ 4.0, 1.5],
			helpToCave:     [ 6.6, 4.4],
			lookAtMap:      [12.0, 2.8],
			presetBalloons: [15.7, 3.4],
			guessBalloons:  [20.4, 4.5],
			whatDoYouThink: [25.4, 0.6],
			canYouDrag:     [27.1, 1.5],
			floor1:         [29.6, 2.6],
			floor2:         [33.2, 2.0],
			floor3:         [36.3, 2.2],
			floor4:         [39.7, 2.3],
			canYouDragRight:[43.3, 2.2],
			// buttonAdd:      [], // Not existing
			buttonSubtract: [46.9, 4.5],
			buttonAddSub:   [53.0, 5.2],
			sameAsMap:      [59.9, 3.0],
			whatButton:     [64.2, 2.4],
			pushButton:     [67.8, 5.7],
			pushAnchor:     [74.8, 1.9],
			treasure1:      [78.0, 1.6],
			treasure2:      [80.2, 1.2],
			treasureBoot:   [82.1, 2.9],
			newTreasure:    [85.9, 0.7],
			helpMeGetThere: [87.7, 1.0],
			tryLess:        [89.5, 2.7],
			tryMore:        [93.0, 2.4]
		}
	},

	beeflight: {
		speech: ['assets/audio/subgames/beeflight/swedish.ogg', 'assets/audio/subgames/beeflight/swedish.mp3'],
		markers: {
			slurp:        [ 0.0, 2.0],
			okay:         [ 2.5, 0.8],
			letsGo:       [ 3.5, 1.2],
			flower1:      [ 5.2, 1.7],
			flower2:      [ 7.4, 1.7],
			flower3:      [ 9.7, 1.7],
			flower4:      [11.9, 1.7],
			flower5:      [14.1, 1.7],
			flower6:      [16.4, 1.6],
			flower7:      [18.5, 1.7],
			flower8:      [21.0, 1.9],
			flower9:      [23.6, 2.0],
			number1:      [26.1, 0.4],
			number2:      [27.3, 0.8],
			number3:      [28.7, 1.0],
			number4:      [30.2, 0.9],
			number5:      [31.7, 0.7],
			number6:      [33.0, 0.7],
			number7:      [34.2, 0.8],
			number8:      [35.3, 1.0],
			number9:      [36.8, 1.1],
			one:          [38.6, 0.8],
			forward:      [40.3, 0.8],
			backward:     [42.2, 0.9],
			noNectar:     [44.0, 5.4],
			tooFar:       [50.4, 2.4],
			tooNear:      [54.5, 4.2],
			wasBefore:    [59.9, 3.6],
			nectar:       [64.7, 3.5],
			goingBack:    [69.5, 6.3],
			getMore:      [76.5, 2.0],
			badSight:     [79.8, 4.1],
			howToFind:    [87.1, 3.3],
			showTheWay:   [90.8, 6.3],
			decideHowFar: [97.7, 3.2],
			pushNumber:   [102.3, 4.5],
			wrongPlace:   [107.5, 5.6],
			notFarEnough: [114.4, 6.4],
			goneTooFar:   [122.1, 8.8],
			thinkItIt:    [132.3, 3.5],
			isItCorrect:  [137.1, 1.2],
			useButtons:   [139.6, 7.2],
			gettingHelp:  [148.3, 6.7],
			youHelpLater: [156.2, 5.6],
			thatsAll:     [164.3, 5.9],
			dancing:      [171.2, 5.3]
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

LANG.TEXT = LANG.swedish.text;
LANG.SPEECH = LANG.swedish.speech;
LANG.SPEECH.AGENT = LANG.SPEECH.panda;