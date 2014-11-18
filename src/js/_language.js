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
	creditsVoices: 'Röster',
	creditsVoicePanda: 'Igis Gulz-Haake',
	creditsVoiceHedgehog: 'Agneta Gulz',
	creditsVoiceMouse: 'Sebastian Gulz-Haake',
	creditsVoiceWoodlouse: 'Igis Gulz-Haake',
	creditsVoiceLizard: 'Igis Gulz-Haake',
	creditsVoiceBumblebee: 'Agneta Gulz',
	creditsVoiceBird: 'Igis Gulz-Haake',
	creditsMusic: 'Musik',
	creditsSfx: 'Ljudeffekter',
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

	/* Agents and characters */
	pandaName: 'Panders',
	hedgehogName: 'Igis',
	mouseName: 'Mille',
	woodlouseName: 'Grålle',
	lizardName: 'Kamilla',
	bumblebeeName: 'Humfrid',
	birdName: 'Fålia'
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
		speech: ['assets/audio/subgames/birdhero/swedish.ogg', 'assets/audio/subgames/birdhero/swedish.mp3'],
		markers: {
			thisFloor:     [ 0.2, 1.9],
			helpMeHome:    [ 2.6, 2.0],
			dontLiveHere:  [ 5.9, 1.7],
			notMyParent:   [ 9.1, 2.3],
			higher:        [13.0, 1.9],
			lower:         [16.3, 1.8],
			thankYou:      [19.7, 1.5],
			blownOut:      [23.2, 7.8],
			countFeathers: [32.2, 3.3],
			pushButton:    [37.0, 2.9],
			useMyself:     [41.2, 2.5],
			howMuchHigher: [45.2, 2.0],
			howMuchLower:  [48.3, 2.1],
			thinkItIs:     [51.1, 2.8],
			higherOrLower: [55.6, 2.7]
		}
	},

	balloongame: {
		speech: ['assets/audio/subgames/balloongame/swedish.ogg', 'assets/audio/subgames/balloongame/swedish.mp3'],
		markers: {
			yippie1:        [  0.1, 1.3],
			yippie2:        [  2.2, 0.8],
			loveTreasures:  [  4.0, 1.6],
			helpToCave:     [  6.6, 4.4],
			lookAtMap:      [ 12.0, 2.8],
			presetBalloons: [ 15.7, 3.4],
			guessBalloons:  [ 20.4, 4.5],
			whatDoYouThink: [ 25.4, 0.6],
			canYouDrag:     [ 27.1, 1.5],
			floor1:         [ 29.6, 2.6],
			floor2:         [ 33.1, 2.1],
			floor3:         [ 36.3, 2.2],
			floor4:         [ 39.7, 2.3],
			canYouDragRight:[ 43.3, 2.2],
			buttonSubtract: [ 46.9, 4.5],
			buttonAddSub:   [ 53.0, 5.2],
			sameAsMap:      [ 59.9, 3.0],
			whatButton:     [ 64.2, 2.4],
			pushButton:     [ 67.8, 5.7],
			pushAnchor:     [ 74.8, 1.9],
			treasure1:      [ 78.0, 1.6],
			treasure2:      [ 80.2, 1.2],
			treasureBoot:   [ 82.1, 2.9],
			newTreasure:    [ 85.9, 0.7],
			helpMeGetThere: [ 87.7, 1.3],
			wrong1:         [ 89.7, 1.4],
			wrong2:         [ 92.0, 1.3],
			lower:          [ 94.2, 1.7],
			higher:         [ 96.9, 1.4],
			fullSack:       [ 99.4, 4.6],
			thankYou:       [104.7, 3.6]
		}
	},

	beeflight: {
		speech: ['assets/audio/subgames/beeflight/swedish.ogg', 'assets/audio/subgames/beeflight/swedish.mp3'],
		markers: {
			slurp:        [  0.0, 2.0],
			okay:         [  2.5, 0.8],
			letsGo:       [  3.5, 1.2],
			order1:       [  5.5, 1.0],
			order2:       [  7.1, 1.1],
			order3:       [  8.7, 1.3],
			order4:       [ 10.8, 1.2],
			order5:       [ 12.9, 1.0],
			order6:       [ 15.1, 1.0],
			order7:       [ 17.2, 1.0],
			order8:       [ 18.9, 1.5],
			order9:       [ 21.1, 1.6],
			flower:       [ 23.9, 1.3],
			number1:      [ 25.9, 0.9],
			number2:      [ 27.1, 0.9],
			number3:      [ 28.7, 1.0],
			number4:      [ 30.1, 1.0],
			number5:      [ 31.6, 0.8],
			number6:      [ 32.9, 0.6],
			number7:      [ 34.1, 0.8],
			number8:      [ 35.2, 1.1],
			number9:      [ 36.7, 1.2],
			one:          [ 38.6, 0.8],
			forward:      [ 40.3, 0.8],
			backward:     [ 42.2, 0.9],
			noNectar:     [ 44.0, 5.4],
			tooFar:       [ 50.4, 2.4],
			tooNear:      [ 54.5, 4.2],
			wasBefore:    [ 59.9, 3.6],
			nectar:       [ 64.7, 3.5],
			goingBack:    [ 69.5, 6.3],
			getMore:      [ 76.5, 2.0],
			badSight:     [ 79.8, 4.1],
			howToFind:    [ 87.1, 3.3],
			showTheWay:   [ 90.8, 6.3],
			decideHowFar: [ 97.7, 3.2],
			pushNumber:   [102.3, 4.5],
			wrongPlace:   [107.5, 5.6],
			notFarEnough: [114.4, 6.4],
			goneTooFar:   [122.1, 8.8],
			thinkItIs:    [132.3, 3.5],
			isItCorrect:  [137.1, 1.2],
			useButtons:   [139.6, 7.2],
			gettingHelp:  [148.3, 6.7],
			youHelpLater: [156.2, 5.6],
			thatsAll:     [164.3, 5.9],
			dancing:      [171.2, 5.3]
		}
	},

	lizard: {
		speech: ['assets/audio/subgames/lizard/swedish.ogg', 'assets/audio/subgames/lizard/swedish.mp3'],
		markers: {
			argh:          [  0.5, 1.5],
			arrg:          [  3.3, 0.9],
			miss:          [  5.3, 1.8],
			openMiss:      [  8.7, 1.5],
			treeTaste:     [ 11.7, 3.4],
			higher:        [ 16.6, 2.3],
			lower:         [ 19.7, 2.9],
			tooHigh:       [ 24.0, 6.5],
			tooLow:        [ 32.2, 4.4],
			yummy:         [ 38.2, 2.5],
			thankYou:      [ 41.9, 2.4],
			almostFull:    [ 46.0, 2.4],
			sleepyHungry:  [ 49.8, 6.5],
			takeThatAnt:   [ 57.6, 4.5],
			helpToAim:     [ 63.5, 2.1],
			howHigh:       [ 67.5, 3.3],
			chooseButton:  [ 72.5, 3.6],
			imStuck:       [ 77.4, 4.0],
			openHowHigher: [ 82.6, 4.1],
			openHowLower:  [ 88.0, 6.8],
			thinkItIs:     [ 96.2, 2.6],
			higherOrLower: [100.1, 5.3],
			helpingMeAim:  [106.9, 6.3],
			fullAndSleepy: [114.5, 7.7],
			byeAndThanks:  [122.6, 2.5],
			openHigher:    [126.1, 3.2],
			openLower:     [130.2, 3.0]
		}
	},

	/* Agents */
	panda: {
		speech: ['assets/audio/agent/panda/swedish.ogg', 'assets/audio/agent/panda/swedish.mp3'],
		markers: {
			ok1:              [  0.1, 0.7],
			ok2:              [  1.6, 0.4],
			hmm:              [  3.0, 1.0],
			isThisRight:      [  5.1, 1.3],
			itItThisOne:      [  7.5, 1.1],
			hasToBeThis:      [  9.4, 1.6],
			wrongShow:        [ 12.1, 3.3],
			wasCorrect:       [ 16.3, 1.6],
			tryAgain:         [ 19.0, 2.2],
			wrong1:           [ 22.6, 1.4],
			wrong2:           [ 27.6, 1.5],
			higher:           [ 25.0, 1.4],
			more:             [155.9, 1.1],
			lower:            [ 30.0, 2.1],
			fewer:            [153.3, 1.5],
			myTurn1:          [ 33.0, 2.2],
			myTurn2:          [ 36.1, 1.3],
			willYouHelpMe:    [ 38.5, 0.7],
			instructionGreen: [ 39.9, 3.0],
			instructionRed:   [ 43.7, 3.1],
			letsGo:           [105.8, 0.8],
			// Agent setup
			hello:            [147.5, 1.7],
			funTogether:      [150.3, 1.9],
			// Garden
			gardenIntro:      [ 47.9, 6.6],
			gardenMyCan:      [ 55.7, 6.5],
			gardenSign:       [ 63.2, 2.0],
			gardenHaveWater:  [ 66.1, 4.7],
			gardenPushField:  [ 71.9, 2.4],
			gardenGrowing:    [ 75.2, 1.7],
			gardenFullGrown:  [ 78.2, 3.8],
			gardenWaterLeft:  [ 83.3, 3.8],
			gardenEmptyCan:   [ 88.2, 4.3],
			gardenWhereNow:   [ 93.6, 2.2],
			gardenWaterFirst: [ 96.7, 7.9],
			gardenYoureBack:  [107.7, 2.0],
			// Birdhero
			birdheroIntro:    [140.1, 6.6],
			// Lizard
			lizardIntro1:     [117.4, 4.5],
			lizardIntro2:     [123.0, 4.0],
			// Bee
			beeIntro1:        [128.1, 2.8],
			beeIntro2:        [132.0, 2.8],
			beeIntro3:        [135.7, 3.4],
			// Balloon
			balloonIntro:     [110.4, 6.2]
		}
	},

	hedgehog: {
		speech: ['assets/audio/agent/hedgehog/swedish.ogg', 'assets/audio/agent/hedgehog/swedish.mp3'],
		markers: {
			ok1:              [  0.0, 0.6],
			ok2:              [  1.6, 0.6],
			hmm:              [  3.4, 1.0],
			isThisRight:      [  5.5, 1.5],
			itItThisOne:      [  8.1, 1.0],
			hasToBeThis:      [ 10.0, 2.1],
			wrongShow:        [ 13.1, 3.8],
			wasCorrect:       [ 17.9, 1.9],
			tryAgain:         [ 20.7, 2.4],
			wrong1:           [ 23.7, 1.2],
			wrong2:           [ 31.7, 1.6],
			higher:           [ 25.8, 2.7],
			more:             [ 29.3, 1.6],
			lower:            [ 34.2, 3.0],
			fewer:            [ 38.0, 1.9],
			myTurn1:          [ 41.0, 3.1],
			myTurn2:          [ 45.9, 1.6],
			willYouHelpMe:    [ 48.6, 1.1],
			instructionGreen: [ 51.0, 4.2],
			instructionRed:   [ 56.0, 4.4],
			letsGo:           [ 69.0, 0.9],
			// Agent setup
			hello:            [ 61.5, 2.3],
			funTogether:      [ 65.1, 2.9],
			// Garden
			gardenIntro:      [ 70.9, 9.5],
			gardenMyCan:      [ 81.8, 7.5],
			gardenSign:       [ 90.7, 2.4],
			gardenHaveWater:  [ 94.7, 6.0],
			gardenPushField:  [102.1, 3.1],
			gardenGrowing:    [106.3, 1.5],
			gardenFullGrown:  [109.1, 4.7],
			gardenWaterLeft:  [115.1, 4.0],
			gardenEmptyCan:   [120.4, 5.0],
			gardenWhereNow:   [126.5, 2.2],
			gardenWaterFirst: [129.7,10.3],
			gardenYoureBack:  [141.2, 2.1],
			// Birdhero
			birdheroIntro:    [145.2,11.5],
			// Lizard
			lizardIntro1:     [158.2, 5.4],
			lizardIntro2:     [164.7, 5.3],
			// Bee
			beeIntro1:        [172.0, 4.0],
			beeIntro2:        [177.0, 3.2],
			beeIntro3:        [181.4, 4.3],
			// Balloon
			balloonIntro:     [187.7, 5.6]
		}
	},

	mouse: {
		speech: ['assets/audio/agent/mouse/swedish.ogg', 'assets/audio/agent/mouse/swedish.mp3'],
		markers: {
			ok1:              [  0.0, 0.5],
			ok2:              [  1.5, 0.5],
			hmm:              [  3.1, 1.6],
			isThisRight:      [  5.9, 1.2],
			itItThisOne:      [  8.5, 0.9],
			hasToBeThis:      [ 10.6, 1.2],
			wrongShow:        [ 13.3, 3.4],
			wasCorrect:       [ 17.7, 1.6],
			tryAgain:         [ 20.6, 2.1],
			wrong1:           [ 24.2, 1.2],
			wrong2:           [ 26.5, 1.4],
			higher:           [ 28.9, 1.4],
			more:             [ 31.1, 1.3],
			lower:            [ 34.0, 2.2],
			fewer:            [ 37.2, 1.3],
			myTurn1:          [ 39.7, 2.1],
			myTurn2:          [ 42.9, 1.0],
			willYouHelpMe:    [ 45.3, 0.9],
			instructionGreen: [ 47.0, 3.1],
			instructionRed:   [ 51.3, 3.0],
			letsGo:           [ 60.2, 1.0],
			// Agent setup
			hello:            [ 55.3, 1.6],
			funTogether:      [ 57.4, 2.0],
			// Garden
			gardenIntro:      [ 62.2, 6.0],
			gardenMyCan:      [ 69.0, 3.1],
			gardenSign:       [ 73.3, 1.6],
			gardenHaveWater:  [ 76.1, 3.8],
			gardenPushField:  [ 81.2, 2.0],
			gardenGrowing:    [ 84.2, 1.2],
			gardenFullGrown:  [ 86.6, 3.2],
			gardenWaterLeft:  [ 91.0, 3.2],
			gardenEmptyCan:   [ 95.2, 3.8],
			gardenWhereNow:   [ 99.7, 1.6],
			gardenWaterFirst: [102.4, 7.5],
			gardenYoureBack:  [111.0, 1.5],
			// Birdhero
			birdheroIntro:    [113.6, 7.9],
			// Lizard
			lizardIntro1:     [122.5, 4.4],
			lizardIntro2:     [128.2, 3.9],
			// Bee
			beeIntro1:        [133.0, 3.1],
			beeIntro2:        [137.2, 2.6],
			beeIntro3:        [140.7, 3.0],
			// Balloon
			balloonIntro:     [144.9, 7.5]
		}
	}
};

LANG.TEXT = LANG.swedish.text;
LANG.SPEECH = LANG.swedish.speech;
LANG.SPEECH.AGENT = LANG.SPEECH.panda;