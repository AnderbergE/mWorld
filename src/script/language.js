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
	trollName: 'Trolle',
	woodlouseName: 'Grålle',
	lizardName: 'Kamilla',
	bumblebeeName: 'Humfrid',
	birdName: 'Fålia',

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
			// TODO: Other formats.
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
			vehicleIntro1:    [117.4, 4.5], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [123.0, 4.0], // Jaha. Det låter jättespännande. Får jag också hjälpa till?
			// Party
			hi:               [158.2, 1.2],
			niceYoureHere:    [160.0, 2.0],
			soonBirthday:     [162.0, 2.2],
			wereHavingParty:  [166.0, 3.5],
			thanks:           [268.2, 0.9],
			niceComeBack:     [239.0, 2.6],
			helpUsAgain:      [242.4, 2.8],
			haveGifts:        [282.0, 3.9],
			// PartyInvitation
			gottaInvite:      [170.0, 2.3],
			makeCards:        [173.0, 2.2],
			allGuestsGet:     [175.8, 3.0],
			helpMeStickers:   [179.0, 3.8],
			manyOfThese:      [183.0, 3.9],
			someOfThese:      [187.0, 3.9],
			thisManyOfThese:  [191.0, 3.9],
			imTrying:         [195.0, 3.8],
			dragStickers:     [199.0, 2.0],
			dragStickers2:    [203.0, 2.9],
			looksNice:        [206.0, 3.0],
			imPutting:        [209.2, 2.0],
			dragCard:         [212.0, 2.0],
			dragStickersBack: [215.0, 3.0],
			rightButMore:     [218.5, 5.0],
			tryMore:          [224.0, 2.0],
			ohNo:             [226.4, 5.2],
			madeNiceCards:    [232.2, 4.2],
			thanksForHelp:    [237.0, 1.7],
			// PartyGarlands
			haveToGarlands:   [246.1, 2.5],
			letsPutUp:        [249.3, 2.9],
			goodPlace:        [253.0, 2.8],
			followMe:         [256.8, 0.8],
			hereGood:         [259.2, 1.3],
			whichGarland:     [261.0, 2.6],
			helpMeFlags:      [264.5, 2.8],
			wasGood:          [206.0, 3.0],
			putFlagsBack:     [270.0, 2.4],
			moreGarlands:     [273.2, 2.4],
			looksGood:        [276.2, 2.7],
			finished:         [279.3, 2.0],
			// PartyGifts
			niceParty:        [286.1, 2.2],
			helpFindGifts:    [289.0, 2.9],
			shouldBeHere:     [292.4, 2.6],
			lookMap:          [296.0, 1.6],
			giftAtCross:      [298.3, 2.2],
			howManySteps:     [301.3, 3.6],
			rememberSteps:    [306.0, 2.5],
			pushButton:       [309.2, 2.9],
			pushGlass:        [313.0, 2.9],
			isItHere:         [316.6, 1.0],
			yesGift:          [319.0, 1.9],
			moreSteps:        [322.0, 2.0],
			tooManySteps:     [325.0, 2.0],
			nextGift:         [328.0, 2.9],
			wasAll:           [331.2, 2.2],
			openGifts:        [334.2, 2.0],
			thanksForParty:   [337.0, 3.7]
		}
	},

	hedgehog: {
		speech: [
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
			vehicleIntro1:    [158.2, 5.4], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [164.7, 5.3], // Jaha. Det låter jättespännande. Får jag också hjälpa till?
			// Party
			hi:               [195.0, 1.0],
			niceYoureHere:    [197.0, 2.0],
			soonBirthday:     [200.0, 3.0],
			wereHavingParty:  [204.0, 5.7],
			thanks:           [243.6, 1.3],
			thanksForHelp:    [258.6, 2.0],
			niceComeBack:     [210.0, 3.2],
			helpUsAgain:      [214.0, 3.0],
			haveGifts:        [333.0, 3.8],
			// PartyGarlands
			haveToGarlands:   [218.0, 3.0],
			letsPutUp:        [222.0, 3.0],
			goodPlace:        [226.1, 3.9],
			followMe:         [230.3, 1.4],
			hereGood:         [232.6, 2.3],
			whichGarland:     [235.4, 3.6],
			helpMeFlags:      [239.3, 3.5],
			putFlagsBack:     [245.2, 3.6],
			moreGarlands:     [249.2, 2.5],
			looksGood:        [252.6, 3.2],
			finished:         [256.0, 1.8],
			// PartyBalloons
			haveToBalloons:   [261.6, 2.0],
			makeBalloons:     [264.2, 2.5],
			herePump:         [267.4, 4.8],
			helpMePump:       [272.2, 5.4],
			pushOne:          [278.2, 2.4],
			pushTwo:          [281.2, 2.8],
			pushThree:        [285.0, 2.7],
			pushFour:         [288.2, 2.4],
			pushFive:         [291.2, 2.8],
			pushSix:          [294.8, 2.7],
			pushSeven:        [298.0, 2.8],
			pushEight:        [301.2, 2.7],
			pushNine:         [305.0, 2.7],
			wasGood:          [308.1, 2.0],
			tooMuchAir:       [311.0, 2.9],
			newBalloon:       [315.0, 1.6],
			moreAir:          [317.1, 2.0],
			dragBalloon:      [319.9, 2.1],
			anotherBalloon:   [322.8, 2.1],
			manyNiceBalloons: [326.0, 3.0],
			goPutThemUp:      [329.4, 2.5],
			// PartyGifts
			niceParty:        [337.2, 2.6],
			helpFindGifts:    [340.0, 3.4],
			shouldBeHere:     [343.8, 2.8],
			lookMap:          [347.0, 1.9],
			giftAtCross:      [349.2, 2.4],
			howManySteps:     [352.8, 3.8],
			rememberSteps:    [357.0, 3.0],
			pushButton:       [361.0, 2.8],
			pushGlass:        [364.2, 2.8],
			isItHere:         [368.0, 1.0],
			yesGift:          [369.2, 2.9],
			moreSteps:        [373.0, 2.0],
			tooManySteps:     [376.0, 2.0],
			nextGift:         [379.0, 2.8],
			wasAll:           [382.0, 2.0],
			openGifts:        [385.0, 2.8],
			thanksForParty:   [388.2, 4.8]
		}
	},

	mouse: {
		speech: [
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
			vehicleIntro1:    [122.5, 4.4], // Hej Hedvig. Hej Herman. Vad håller ni på med?
			vehicleIntro2:    [128.2, 3.9], // Jaha. Det låter jättespännande. Får jag också hjälpa till?
			// Party
			hi:               [153.8, 0.9],
			niceYoureHere:    [155.0, 2.0],
			soonBirthday:     [158.0, 3.0],
			wereHavingParty:  [161.0, 4.0],
			thanks:           [233.0, 1.0],
			niceComeBack:     [234.0, 2.0],
			helpUsAgain:      [237.0, 2.0],
			haveGifts:        [297.0, 3.6],
			// PartyInvitation
			gottaInvite:      [165.8, 2.8],
			makeCards:        [169.0, 2.0],
			allGuestsGet:     [171.0, 3.0],
			helpMeStickers:   [175.0, 3.0],
			manyOfThese:      [178.5, 3.5],
			someOfThese:      [182.5, 3.5],
			thisManyOfThese:  [186.5, 3.5],
			imTrying:         [190.5, 4.0],
			dragStickers:     [195.0, 3.0],
			dragStickers2:    [198.0, 3.0],
			looksNice:        [201.0, 2.2],
			imPutting:        [204.0, 2.0],
			dragCard:         [206.0, 2.0],
			dragStickersBack: [209.0, 3.0],
			rightButMore:     [213.0, 5.0],
			tryMore:          [218.0, 2.0],
			ohNo:             [220.4, 5.0],
			madeNiceCards:    [226.0, 3.9],
			thanksForHelp:    [230.2, 1.8],
			// PartyBalloons
			haveToBalloons:   [240.0, 1.5],
			makeBalloons:     [242.0, 2.0],
			herePump:         [244.3, 3.0],
			helpMePump:       [248.0, 3.6],
			pushOne:          [252.2, 1.7],
			pushTwo:          [254.9, 1.8],
			pushThree:        [257.0, 2.0],
			pushFour:         [260.0, 1.9],
			pushFive:         [262.2, 2.0],
			pushSix:          [265.4, 1.9],
			pushSeven:        [268.0, 2.0],
			pushEight:        [270.8, 1.9],
			pushNine:         [273.2, 2.2],
			wasGood:          [276.0, 1.7],
			tooMuchAir:       [279.0, 2.0],
			newBalloon:       [281.2, 1.8],
			moreAir:          [283.2, 2.3],
			dragBalloon:      [285.8, 2.2],
			anotherBalloon:   [289.0, 1.8],
			manyNiceBalloons: [292.0, 2.0],
			goPutThemUp:      [294.6, 1.8],
			// PartyGifts
			niceParty:        [300.8, 2.2],
			helpFindGifts:    [303.8, 3.3],
			shouldBeHere:     [307.0, 2.2],
			lookMap:          [310.1, 2.0],
			giftAtCross:      [312.2, 2.0],
			howManySteps:     [315.0, 3.3],
			rememberSteps:    [318.2, 3.4],
			pushButton:       [321.6, 3.2],
			pushGlass:        [325.2, 2.8],
			isItHere:         [329.0, 0.9],
			yesGift:          [331.0, 1.9],
			moreSteps:        [333.2, 2.2],
			tooManySteps:     [336.0, 1.9],
			nextGift:         [338.2, 2.7],
			wasAll:           [341.8, 1.9],
			openGifts:        [344.0, 2.2],
			thanksForParty:   [347.0, 3.4]
		}
	},

	troll: {
		speech: [
			'audio/agent/troll/swedish.mp3'
		],
		markers: {
			iCanDo:            [ 0.0, 1.6],
			oops:              [ 9.8, 0.9],
			iNeedHelp:         [11.5, 3.8],
			iCanHelp:          [21.0, 1.0],
			isGood:            [26.9, 1.9],
			continueWhenBack:  [35.0, 3.7],
			yesWater:          [41.9, 1.8],
			haveMap:           [47.0, 2.0],
			laugh:             [55.8, 1.8]
		}
	}
};

LANG.TEXT = LANG.swedish.text;
LANG.SPEECH = LANG.swedish.speech;
LANG.SPEECH.AGENT = LANG.SPEECH.panda;
