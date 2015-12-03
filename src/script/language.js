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
 * *** A NOTE ABOUT AUDIO FILE SIZE ***
 * This project uses web audio, which in turn uses huge memory amounts.
 * This is a problem for our speech on devices with restricted memory.
 * I, Erik, have investigated how to lower this usage:
 * Has effect:
 * 1) Reducing the amount of channels, such as from stereo to mono.
 * 2) Removing unused speech.
 * 3) Never have any unused sound loaded in memory.
 *
 * Has NO effect:
 * 1) Reducing sample rate or bitrate (web audio decodes to 44100 32bit).
 *    However, file size is reduced by this which gives faster loading times.
 * 2) Modifying format (same reason as previous).
 *    However, some formats cannot be played on all devices, so backup is needed.
 * 3) Removing pauses (or at least has a very marginal effect).
 *
 * @global
 */
var LANG = {};

module.exports = LANG;

/**
 * Change the language.
 * NOTE: A warning is set if text or speech are missing translations.
 * @param {Object} text - The text.
 * @param {Object} speech - The speech markers.
 */
LANG.change = function (text, speech, player) {
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
		LANG.setAgent('panda');
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
	start: 'Starta',
	continuePlaying: 'Fortsätt',
	changeAgent: 'Byt kompis',
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
	trollName: 'Trolle',
	woodlouseName: 'Grålle',
	lizardName: 'Kamilla',
	beeName: 'Humfrid',
	birdName: 'Fålia',
	tractorName: 'Hedvig',
	craneName: 'Herman',

	/* Subgame names */
	balloonGameName: 'Skattjakten',
	beeGameName: 'Humlehjälpen',
	birdheroGameName: 'Fågelhjälten',
	lizardGameName: 'Piratmaten',
	vehicleGameName: 'Lastdags',
	partyInvitationGameName: 'Inbjudningar',
	partyGarlandGameName: 'Girlanger',
	partyBalloonGameName: 'Ballonger',
	partyGiftGameName: 'Presenter',

	/* Scenario related names */
	subgameName: 'Delspel',
	numberRangeName: 'Intervall',
	numberRepresentationName: 'Representation',
	methodName: 'Metod',
	countName: 'Räkna',
	stepName: 'Steg-för-steg',
	addName: 'Addition',
	subName: 'Subtraktion',
	addsubName: 'Add och sub',
	gameType: 'Speltyp',
	difficulty: 'Svårghetsgrad',

	/* Demo */
	demo: 'Demo',
	demoEntry: 'Observera att detta är en översiktsdemo! Den skiljer från lärspelet på följande sätt:\n' +
		'* I det riktiga lärspelet har man sin egen inloggning. Genom den anpassar spelet hela tiden svårighetsnivån\n' +
		'och stödet till individen, och utseendet av ens magiska trädgård sparas mellan inloggningarna.\n' +
		'* Demon sparar ingen data för att göra det som nämns ovan, istället väljer man svårighetsnivå själv.',
	demoChoice: 'ENDAST I ÖVERSIKTSDEMO\n' +
		'Välj en knapp i varje rad för att skapa ett scenario att spela.\n' +
		'I den riktiga versionen av lärspelet görs dessa val automatiskt. Då kommer en\n' +
		'direkt till ett scenario där svårighetsgraden och stödet har anpassats efter individen.',
	demoParty: 'ENDAST I ÖVERSIKTSDEMO\n' +
		'Välj en partytyp och svårighetsgrad.\n' +
		'I den riktiga versionen av lärspelet görs dessa val automatiskt.',
};

LANG.swedish.speech = {
	/* Agent intro */
	agentIntro: {
		speech: [
			'audio/agent/swedishIntro.m4a',
			'audio/agent/swedishIntro.ogg',
			'audio/agent/swedishIntro.mp3'
		],
		markers: {
			pandaHello:          [ 0.0, 1.7],
			pandaFunTogether:    [ 2.8, 2.0],
			hedgehogHello:       [ 5.7, 2.4],
			hedgehogFunTogether: [ 8.9, 3.0],
			mouseHello:          [12.3, 1.7],
			mouseFunTogether:    [14.4, 1.9]
		}
	},

	/* Subgames */
	birdhero: {
		speech: [
			'audio/subgames/birdhero/swedish.m4a',
			'audio/subgames/birdhero/swedish.ogg',
			'audio/subgames/birdhero/swedish.mp3'
		],
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
		speech: [
			'audio/subgames/balloongame/swedish.m4a',
			'audio/subgames/balloongame/swedish.ogg',
			'audio/subgames/balloongame/swedish.mp3'
		],
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
		speech: [
			'audio/subgames/beeflight/swedish.m4a',
			'audio/subgames/beeflight/swedish.ogg',
			'audio/subgames/beeflight/swedish.mp3'
		],
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
			nectar1:      [ 64.6, 1.8],
			nectar2:      [ 66.4, 2.0],
			goingBack:    [ 69.5, 6.3],
			getMore:      [ 76.5, 2.0],
			badSight:     [ 79.8, 4.1],
			howToFind:    [ 87.1, 3.3],
			showTheWay:   [ 90.8, 6.3],
			decideHowFar: [ 97.7, 3.2],
			pushNumber:   [102.3, 4.5],
			wrongPlace:   [107.5, 5.6],
			notFarEnough: [114.4, 3.4],
			howMuchMore:  [118.5, 2.3],
			goneTooFar:   [122.1, 3.5],
			mustGoBack:   [126.1, 4.7],
			thinkItIs:    [132.3, 3.5],
			isItCorrect:  [137.1, 1.2],
			useButtons:   [139.6, 7.2],
			gettingHelp:  [148.3, 6.7],
			youHelpLater: [156.2, 5.6],
			thatsAll:     [164.3, 5.9],
			dancing:      [171.2, 5.3]
		}
	},

	vehicle: {
		speech: [
			'audio/subgames/vehicle/swedish.m4a',
			'audio/subgames/vehicle/swedish.ogg',
			'audio/subgames/vehicle/swedish.mp3'
		],
		markers: {
			helloHedvig:  [  1.9, 1.1], // Hej Hedvig.
			letsGo:       [  4.2, 1.1], // Då kör vi.
			order1:       [  6.0, 1.3], // Första.
			order2:       [  7.9, 1.1], // Andra.
			order3:       [  9.5, 1.3], // Tredje.
			order4:       [ 11.3, 1.3], // Fjärde.
			order5:       [ 13.4, 1.2], // Femte.
			order6:       [ 15.5, 1.2], // Sjätte.
			order7:       [ 17.3, 1.3], // Sjunde.
			order8:       [ 19.3, 1.3], // Åttonde.
			order9:       [ 21.0, 1.3], // Nionde.
			marking:      [ 22.8, 1.2], // Markeringen.
			number1:      [ 24.8, 1.0], // Ett.
			number2:      [ 26.6, 0.9], // Två.
			number3:      [ 28.4, 0.9], // Tre.
			number4:      [ 30.5, 0.9], // Fyra.
			number5:      [ 32.2, 0.9], // Fem.
			number6:      [ 34.0, 1.2], // Sex.
			number7:      [ 36.0, 0.8], // Sju.
			number8:      [ 37.8, 0.9], // Åtta.
			number9:      [ 39.4, 1.1], // Nio.
			one:          [ 41.7, 0.6], // En.
			forward:      [ 43.0, 1.1], // Framåt.
			backward:     [ 44.9, 1.1], // Bakåt.
			tooFar:       [ 47.2, 2.2], // Så här långt skulle vi nog inte.
			tooNear:      [ 50.7, 2.5], // Nu åkte vi tillbaka lite för långt.
			wasBefore:    [ 54.6, 4.4], // Jag flyttar tillbaka kroken till där jag var förut så kan vi prova igen.
			sure:         [ 60.2, 1.7], // Javisst. Det gör jag gärna.// howToFind
			showTheWay:   [ 63.2, 7.3], // Hej där! Skulle du vilja hjälpa mig med att visa hur långt jag ska flytta kroken för att lasten ska hamna på rätt ställe?
			pushNumber:   [ 72.2, 3.7], // Tryck på rätt nummer för att visa mig hur långt jag ska flytta kroken.
			decideHowFar: [ 77.5, 4.9], // Bestäm först hur långt kroken ska flyttas för att lasten ska hamna på rätt plats.
			wrongPlace:   [ 84.8, 1.5], // Det här blev inte riktigt rätt.
			notFarEnough: [ 87.6, 3.1], // Jag har nog inte flyttat fram kroken tillräckligt långt.
			howMuchMore:  [ 91.5, 1.3], // Hur mycket längre ska jag?
			goneTooFar:   [ 94.4, 2.4], // Jag har nog flyttat fram kroken för långt.
			mustGoBack:   [ 98.0, 1.9], // Hur mycket måste jag flytta tillbaka?
			thinkItIs:    [101.9, 2.9], // Jag tror att jag ska flytta fram kroken så här långt.
			isItCorrect:  [105.3, 1.1], // Är det rätt?
			useButtons:   [108.4, 5.8], // Använd knapparna och visa mig om jag ska flytta kroken längre fram eller om jag ska flytta den bakåt.
			gettingHelp:  [117.0, 4.2], // Och jag får hjälp med hur jag ska flytta kroken för att lasten ska hamna rätt.
			youHelpLater: [123.8, 3.9], // Javisst. Om du tittar på först så kan du prova sedan.
			noWorries:	  [129.6, 3.4], // Ingen orsak Hedvig. Det var bara roligt att kunna hjälpa till.
			moveHook:     [135.9, 2.3], // Okej. Då flyttar jag kroken.
			step:         [139.4, 0.9], // steg.
			to:           [141.5, 0.8], // till.
			notRight:     [144.4, 1.8], // Det här var inte rätt plats.
			yes1:         [147.3, 0.9], // Javisst.
			yes2:         [148.4, 1.3], // Jajjamensan.
			yes3:         [149.7, 1.2], // Absolut.
			yes4:         [151.0, 1.7], // Ja då. Det fixar vi.
			plus:         [ 43.0, 1.1], // Plus.
			minus:        [ 44.9, 1.1], // Minus.
			// agent1:       [154.6, 4.9], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			// agent2:       [160.3, 5.8], // Jaha. Det låter jättespännande. Får jag också hjälpa till?
			helloHerman:  [167.3, 1.9], // Hej Herman.
			canYouHelpMe: [169.9, 4.7], // Vill du hjälpa mig att lasta lådorna på släpet? // badSight
			more1:        [175.9, 1.9], // Kan vi ta en till?
			more2:        [178.9, 2.3], // Orkar du med en till?
			more3:        [182.4, 5.3], // Det finns lite plats kvar på släpet. Orkar du hjälpa mig med en till?
		    agentHelp:    [189.3, 4.1], // Herman hjälper mig att lasta lådorna på släpet.
			thatsAll:     [194.7, 9.2]  // Nu tycker jag att det räcker. Annars orkar jag nog inte flytta släpet. Tack så mycket för hjälpen allihopa.
		}
	},

	lizard: {
		speech: [
			'audio/subgames/lizard/swedish.m4a',
			'audio/subgames/lizard/swedish.ogg',
			'audio/subgames/lizard/swedish.mp3'
		],
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
		speech: [
			'audio/agent/panda/swedish.m4a',
			'audio/agent/panda/swedish.ogg',
			'audio/agent/panda/swedish.mp3'
		],
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
			hello:            [147.5, 1.7], // same as in intro speech file
			funTogether:      [150.3, 1.9], // same as in intro speech file
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
			balloonIntro:     [110.4, 6.2],
			// Vehicle
			vehicleIntro1:    [157.5, 3.6], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [161.5, 4.9]  // Jaha. Det låter jättespännande. Får jag också hjälpa till?
		}
	},

	hedgehog: {
		speech: [
			'audio/agent/hedgehog/swedish.m4a',
			'audio/agent/hedgehog/swedish.ogg',
			'audio/agent/hedgehog/swedish.mp3'
		],
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
			hello:            [ 61.5, 2.3], // same as in intro speech file
			funTogether:      [ 65.1, 2.9], // same as in intro speech file
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
			balloonIntro:     [187.7, 5.6],
			// Vehicle
			vehicleIntro1:    [194.0, 5.5], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [200.0, 6.6]  // Jaha. Det låter jättespännande. Får jag också hjälpa till?
		}
	},

	mouse: {
		speech: [
			'audio/agent/mouse/swedish.m4a',
			'audio/agent/mouse/swedish.ogg',
			'audio/agent/mouse/swedish.mp3'
		],
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
			hello:            [ 55.3, 1.6], // same as in intro speech file
			funTogether:      [ 57.4, 2.0], // same as in intro speech file
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
			balloonIntro:     [144.9, 7.5],
			// Vehicle
			vehicleIntro1:    [153.0, 3.8], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [157.5, 4.4]  // Jaha. Det låter jättespännande. Får jag också hjälpa till?
		}
	},

	// Party games.
	party: {
		panda: {
			speech: [
				'audio/partygames/swedishPanda.m4a',
				'audio/partygames/swedishPanda.ogg',
				'audio/partygames/swedishPanda.mp3'
			],
			markers: {
				hi:               [  0.0, 0.5], // Hej!
				niceYoureHere:    [  1.0, 1.4], // Vad roligt att du kom hit.
				soonBirthday:     [  3.0, 2.1], // Nu är det snart Igis födelsedag.
				wereHavingParty:  [  5.5, 3.3], // Vi ska ordna ett kalas, men vi behöver någon som hjälper oss.
				looksNice:        [ 37.0, 2.4], // Ja, det blev jättefint!
				thanksForHelp:    [ 65.5, 1.2], // Tack för hjälpen!
				niceComeBack:     [ 67.0, 2.0], // Vad trevligt att du kom tillbaka.
				helpUsAgain:      [ 69.5, 2.6], // Hjälper du oss att fortsätta ordna kalaset?
				thanks:           [ 90.0, 0.7], // Tack.
				// Invitation
				gottaInvite:      [  9.5, 2.2], // Först måste vi bjuda in alla gäster.
				makeCards:        [ 12.5, 2.0], // Kom så gör vi inbjudningskort.
				allGuestsGet:     [ 15.4, 2.8], // Alla gäster ska få varsitt kort som passar just dem.
				helpMeStickers:   [ 18.5, 3.3], // Hjälper du mig att sätta på klistermärke som gästen tycker om.
				manyOfThese:      [ 22.5, 2.9], // Den här gästen vill ha många såna här klistermärken.
				someOfThese:      [ 26.0, 3.0], // Den här gästen vill bara ha några såna här klistermärken.
				thisManyOfThese:  [ 29.5, 3.2], // Den här gästen vill ha så här många såna gär klistermärken.
				imTrying:         [ 33.5, 3.0], // Jag provar att sätta dem här klistermärkena på kortet.
				imPutting:        [ 40.0, 1.8], // Då lägger jag kortet i högen.
				dragCard:         [ 42.5, 1.5], // Drag kortet till högen.
				dragStickersBack: [ 44.5, 2.8], // Drag tillbaka klistermärkena och prova igen.
				rightButMore:     [ 48.0, 4.4], // Ja, det var rätt! Men nu vill gästen ha ännu fler klistermärken på kortet.
				tryLess:          [148.0, 1.4], // Inte så många kanske.
				tryMore:          [ 53.0, 1.7], // Vi provar att sätta på fler.
				ohNo:             [ 55.5, 0.6], // Ojdå.
				aBitWeird:        [ 56.5, 1.8], // Nu blev det visst lite konstigt.
				helpMeCorrect:    [ 58.5, 2.1], // Kan du hjälpa mig att se vilken som är rätt?
				madeNiceCards:    [ 61.5, 3.5], // Nu har vi gjort fina inbjudningskort till alla gösterna!
				// Garlands
				haveToGarlands:   [ 72.5, 2.0], // Vi måste dekorera för kalaset.
				letsPutUp:        [ 75.0, 2.2], // Kom så sätter vi upp girlanger i träden.
				goodPlace:        [ 78.0, 2.5], // Vi letar upp ett bra ställe att sätta girlanger.
				followMe:         [ 81.0, 0.7], // Följ med mig.
				hereGood:         [ 82.5, 1.2], // Ja, här blir bra!
				whichGarland:     [ 84.5, 2.2], // Vilken girlang passar mellan de här träden.
				helpMeFlags:      [ 87.0, 2.5], // Vill du hjälpa mig att dra rätt flaggor till mig?
				putFlagsBack:     [ 91.0, 2.3], // Lägg tillbaka flaggor så det blir rätt.
				moreGarlands:     [ 93.5, 1.6], // Vi sätter upp fler girlanger.
				looksGood:        [ 95.5, 2.1], // Nu har vi gjort det jättefint.
				finished:         [ 98.0, 1.2], // Då var vi klara!
				// Gifts
				haveGifts:        [100.0, 3.4], // Igis ska få sina presenter, men någon har gömt dem!
				niceParty:        [104.0, 1.7], // Vilket fint kalas.
				helpFindGifts:    [106.5, 2.3], // Kan du hjälpa mig att hitta mina presenter.
				shouldBeHere:     [109.5, 2.1], // Presenterna borde vara här någonstans.
				lookMap:          [112.0, 1.2], // Vi tittar på kartan.
				giftAtCross:      [113.5, 1.7], // Presenten finns vid krysset.
				howManySteps:     [116.0, 2.9], // Hur många steg behöver jag ta för att komma till presenten.
				rememberSteps:    [119.5, 2.3], // Kan du komma ihåg hur många steg jag behöver ta?
				pushButton:       [122.5, 2.6], // Tryck på rutan framför mig för att ta ett steg.
				pushGlass:        [125.5, 2.6], // Tryck på förstoringsglaset när vi är framme.
				isItHere:         [128.5, 0.8], // Är det här?
				yesGift:          [130.0, 2.1], // Ja! Min present!
				moreSteps:        [132.5, 1.7], // Jag behöver visst ta fler steg.
				tooManySteps:     [134.5, 1.8], // Det blev visst för många steg.
				nextGift:         [137.0, 2.4], // Nu letar vi efter nästa present.
				wasAll:           [140.0, 1.5], // Ja, det var alla!
				openGifts:        [142.0, 1.8], // Nu ska jag öppna mina presenter.
				thanksForParty:   [144.5, 3.0]  // Tack för att du hjälpte till att ordna ett sånt fint kalas till mig.
			}
		},
		hedgehog: {
			speech: [
				'audio/partygames/swedishHedgehog.m4a',
				'audio/partygames/swedishHedgehog.ogg',
				'audio/partygames/swedishHedgehog.mp3'
			],
			markers: {
				hi:               [  0.0, 0.9], // Hej!
				niceYoureHere:    [  1.5, 2.0], // Vad roligt att du kom hit.
				soonBirthday:     [  4.0, 3.0], // Nu är det snart Milles födelsedag.
				wereHavingParty:  [  7.5, 4.3], // Vi ska ordna ett kalas, men vi behöver någon som hjälper oss.
				looksNice:        [ 91.5, 1.5], // Ja, det blev bra!
				thanksForHelp:    [ 51.5, 1.6], // Tack för hjälpen!
				niceComeBack:     [ 12.5, 2.5], // Vad trevligt att du kom tillbaka.
				helpUsAgain:      [ 15.5, 2.8], // Hjälper du oss att fortsätta ordna kalaset?
				thanks:           [ 40.5, 0.4], // Tack.
				// Garlands
				haveToGarlands:   [ 19.0, 2.5], // Vi måste dekorera för kalaset.
				letsPutUp:        [ 22.0, 2.9], // Kom så sätter vi upp girlanger i träden.
				goodPlace:        [ 25.5, 3.4], // Vi letar upp ett bra ställe att sätta girlanger.
				followMe:         [ 29.5, 0.8], // Följ med mig.
				hereGood:         [ 31.0, 1.6], // Ja, här blir bra!
				whichGarland:     [ 33.5, 2.9], // Vilken girlang passar mellan de här träden.
				helpMeFlags:      [ 37.0, 3.0], // Vill du hjälpa mig att dra rätt flaggor till mig?
				putFlagsBack:     [ 41.5, 2.7], // Lägg tillbaka flaggor så det blir rätt.
				moreGarlands:     [ 44.5, 1.7], // Vi sätter upp fler girlanger.
				looksGood:        [ 47.0, 2.3], // Nu har vi gjort det jättefint.
				finished:         [ 50.0, 1.0], // Då är vi klara!
				// Balloons
				haveToBalloons:   [ 53.5, 1.7], // Ballonger måste vi ha!
				makeBalloons:     [ 56.0, 2.0], // Kom så blåser vi upp ballonger!
				herePump:         [ 58.5, 1.1], // Här är pumpen
				helpMePump:       [ 60.0, 4.7], // Hjälper du mig att trycka på pumpen så många gånger som jag visar.
				pushOne:          [ 65.5, 2.1], // Tryck en gång på pumpen.
				pushTwo:          [ 68.0, 2.3], // Tryck två gånger på pumpen.
				pushThree:        [ 71.0, 2.2], // Tryck tre gånger på pumpen.
				pushFour:         [ 74.0, 2.2], // Tryck fyra gånger på pumpen.
				pushFive:         [ 77.0, 2.2], // Tryck fem gånger på pumpen.
				pushSix:          [ 79.5, 2.2], // Tryck sex gånger på pumpen.
				pushSeven:        [ 82.5, 2.2], // Tryck sju gånger på pumpen.
				pushEight:        [ 85.5, 2.3], // Tryck åtta gånger på pumpen.
				pushNine:         [ 88.5, 2.3], // Tryck nio gånger på pumpen.
				wasGood:          [ 91.5, 1.5], // Ja, det blev bra!
				tooMuchAir:       [ 93.5, 2.7], // Oj, det blev visst lite för mycket luft.
				newBalloon:       [ 96.5, 1.5], // Vi tar en ny ballong.
				moreAir:          [ 98.5, 1.6], // Det behövs visst mer luft.
				dragBalloon:      [100.5, 1.9], // Dra ballongen till min kompis
				anotherBalloon:   [103.0, 1.8], // Vi blåser upp en ballong till.
				manyNiceBalloons: [105.5, 2.7], // Nu har vi många fina ballonger.
				goPutThemUp:      [109.0, 2.1], // Vi går och sätter upp ballongerna.
				// Gifts
				haveGifts:        [111.5, 3.7], // Mille ska få sina presenter, men någon har gömt dem!
				niceParty:        [116.0, 1.7], // Vilket fint kalas.
				helpFindGifts:    [118.0, 3.0], // Kan du hjälpa mig att hitta mina presenter.
				shouldBeHere:     [121.5, 2.3], // Presenterna borde vara här någonstans.
				lookMap:          [124.5, 1.4], // Vi tittar på kartan.
				giftAtCross:      [126.5, 2.1], // Presenten finns vid krysset.
				howManySteps:     [129.0, 3.7], // Hur många steg behöver jag ta för att komma till presenten.
				rememberSteps:    [133.5, 2.6], // Kan du komma ihåg hur många steg jag behöver ta?
				pushButton:       [136.5, 2.7], // Tryck på rutan framför mig för att ta ett steg.
				pushGlass:        [140.0, 2.5], // Tryck på förstoringsglaset när vi är framme.
				isItHere:         [143.0, 0.8], // Är det här?
				yesGift:          [144.5, 2.3], // Ja! Min present!
				moreSteps:        [147.5, 2.0], // Jag behöver visst ta fler steg.
				tooManySteps:     [150.0, 1.8], // Det blev visst för många steg.
				nextGift:         [152.5, 2.4], // Nu letar vi efter nästa present.
				wasAll:           [155.5, 1.9], // Ja, det var alla!
				openGifts:        [158.0, 2.5], // Nu ska jag öppna mina presenter.
				thanksForParty:   [161.0, 4.5]  // Tack för att du hjälpte till att ordna ett sånt fint kalas till mig.
			}
		},
		mouse: {
			speech: [
				'audio/partygames/swedishMouse.m4a',
				'audio/partygames/swedishMouse.ogg',
				'audio/partygames/swedishMouse.mp3'
			],
			markers: {
				hi:               [  0.0, 0.9], // Hej!
				niceYoureHere:    [  1.5, 1.8], // Vad roligt att du kom hit.
				soonBirthday:     [  4.0, 2.5], // Nu är det snart Panders födelsedag.
				wereHavingParty:  [  7.0, 3.4], // Vi ska ordna ett kalas, men vi behöver någon som hjälper oss.
				looksNice:        [ 38.0, 2.0], // Ja, det blev jättefint!
				thanksForHelp:    [ 66.0, 1.0], // Tack för hjälpen!
				niceComeBack:     [ 68.5, 1.9], // Vad trevligt att du kom tillbaka.
				helpUsAgain:      [ 71.0, 2.3], // Hjälper du oss att fortsätta ordna kalaset?
				thanks:           [ 67.5, 0.6], // Tack.
				// Invitation
				gottaInvite:      [ 11.0, 2.4], // Först måste vi bjuda in alla gäster.
				makeCards:        [ 14.0, 1.7], // Kom så gör vi inbjudningskort.
				allGuestsGet:     [ 16.5, 2.7], // Alla gäster ska få varsitt kort som passar dem.
				helpMeStickers:   [ 20.0, 3.0], // Hjälper du mig att sätta på klistermärke som gästen tycker om.
				manyOfThese:      [ 23.5, 3.1], // Den här gästen vill ha många såna här klistermärken.
				someOfThese:      [ 27.0, 3.0], // Den här gästen vill bara ha några såna här klistermärken.
				thisManyOfThese:  [ 30.5, 3.3], // Den här gästen vill ha så här många såna gär klistermärken.
				imTrying:         [ 34.5, 3.0], // Jag provar att sätta dem här klistermärkena på kortet.
				imPutting:        [ 40.5, 1.5], // Då lägger jag kortet i högen.
				dragCard:         [ 42.5, 1.4], // Drag kortet till högen.
				dragStickersBack: [ 44.5, 2.8], // Drag tillbaka klistermärkena och prova igen.
				rightButMore:     [ 48.0, 4.8], // Ja, det var rätt! Men nu vill gästen ha ännu fler klistermärken på kortet.
				tryLess:          [172.0, 1.3], // Inte så många kanske.
				tryMore:          [ 53.5, 1.7], // Vi provar att sätta på fler.
				ohNo:             [ 56.0, 0.5], // Ojdå.
				aBitWeird:        [ 57.0, 1.7], // Nu blev det visst lite konstigt.
				helpMeCorrect:    [ 59.0, 2.2], // Kan du hjälpa mig att se vilken som är rätt?
				madeNiceCards:    [ 62.0, 3.2], // Nu har vi gjort fina inbjudningskort till alla gösterna!
				// Balloons
				haveToBalloons:   [ 74.0, 1.4], // Ballonger måste vi ha!
				makeBalloons:     [ 76.0, 1.6], // Kom så blåser vi upp ballonger!
				herePump:         [ 78.0, 1.1], // Här är pumpen
				helpMePump:       [ 79.5, 3.2], // Hjälper du mig och trycker på pumpen så många gånger som jag visar.
				pushOne:          [ 83.5, 1.6], // Tryck en gång på pumpen.
				pushTwo:          [ 85.5, 1.6], // Tryck två gånger på pumpen.
				pushThree:        [ 87.5, 1.6], // Tryck tre gånger på pumpen.
				pushFour:         [ 89.5, 1.7], // Tryck fyra gånger på pumpen.
				pushFive:         [ 92.0, 2.0], // Tryck fem gånger på pumpen.
				pushSix:          [ 94.5, 1.8], // Tryck sex gånger på pumpen.
				pushSeven:        [ 97.0, 1.8], // Tryck sju gånger på pumpen.
				pushEight:        [ 99.5, 1.7], // Tryck åtta gånger på pumpen.
				pushNine:         [102.0, 1.9], // Tryck nio gånger på pumpen.
				wasGood:          [104.5, 1.3], // Ja, det blev bra!
				tooMuchAir:       [106.5, 2.5], // Oj, det blev visst lite för mycket luft.
				newBalloon:       [109.5, 1.3], // Vi tar en ny ballong.
				moreAir:          [111.5, 1.7], // Det behövs visst mer luft.
				dragBalloon:      [114.0, 1.8], // Dra ballongen till min kompis
				anotherBalloon:   [116.5, 1.6], // Vi blåser upp en ballong till.
				manyNiceBalloons: [119.0, 1.9], // Nu har vi många fina ballonger.
				goPutThemUp:      [121.5, 1.5], // Vi går och sätter upp ballongerna.
				// Gifts
				haveGifts:        [123.5, 3.2], // Panders ska få sina presenter, men någon har gömt dem!
				niceParty:        [127.5, 1.5], // Vilket fint kalas.
				helpFindGifts:    [129.5, 2.5], // Kan du hjälpa mig att hitta mina presenter.
				shouldBeHere:     [132.5, 2.2], // Presenterna borde vara här någonstans.
				lookMap:          [135.5, 1.3], // Vi tittar på kartan.
				giftAtCross:      [137.5, 1.8], // Presenten finns vid krysset.
				howManySteps:     [140.0, 2.9], // Hur många steg behöver jag ta för att komma till presenten.
				rememberSteps:    [143.5, 2.4], // Kan du komma ihåg hur många steg jag behöver ta?
				pushButton:       [146.5, 2.5], // Tryck på rutan framför mig för att ta ett steg.
				pushGlass:        [149.5, 2.4], // Tryck på förstoringsglaset när vi är framme.
				isItHere:         [152.5, 0.8], // Är det här?
				yesGift:          [154.0, 1.9], // Ja! Min present!
				moreSteps:        [156.5, 1.8], // Jag behöver visst ta fler steg.
				tooManySteps:     [159.0, 1.6], // Det blev visst för många steg.
				nextGift:         [161.0, 2.2], // Nu letar vi efter nästa present.
				wasAll:           [164.0, 1.6], // Ja, det var alla!
				openGifts:        [166.0, 1.9], // Nu ska jag öppna mina presenter.
				thanksForParty:   [168.5, 3.3]  // Tack för att du hjälpte till att ordna ett sånt fint kalas till mig.
			}
		},
	},

	troll: { // Note: Troll is coded as an agent, so it needs to have this key!
		speech: [
			'audio/partygames/swedish.m4a',
			'audio/partygames/swedish.ogg',
			'audio/partygames/swedish.mp3'
		],
		markers: {
			iCanDo:    [ 0.0, 1.3], // Jag kan göra det.
			oops1:     [ 2.3, 0.5], // Oj då.
			oops2:     [ 3.4, 0.7], // Oops.
			iNeedHelp: [ 5.0, 3.7], // Jag behöver nog också lite hjälp. Du kanske vill hjälpa oss.
			iCanHelp:  [ 9.6, 1.0], // Jag kan hjälpa till!
			isGood:    [11.5, 1.5], // Vad bra det blev!
			continue:  [13.9, 3.1], // Vi fortsätter ordna kalaset när du kommer tillbaka.
			yesWater:  [17.9, 1.9], // Ja! Vatten!
			haveMap:   [20.5, 1.6], // Men jag har en karta.
			laugh:     [22.9, 0.7]  // He he he.
		}
	}
};

LANG.TEXT = LANG.swedish.text;
LANG.SPEECH = LANG.swedish.speech;
LANG.SPEECH.AGENT = LANG.SPEECH.panda;
