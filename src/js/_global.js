/* Holds all global constant objects. */
var GLOBAL = {

	EVENT: {
		menuShow:       'menuShow',
		menuHide:       'menuHide',
		numberPress:    'numberPress',    // [number, representations]
		textPress:      'textPress',      // [text]
		subgameStarted: 'subgameStarted', // [game type]
		modeChange:     'modeChange',     // [newMode]
		tryNumber:      'tryNumber',      // [guess, correct number]
		agentGuess:     'agentGuess',     // [guess, correct number]
		waterAdded:     'waterAdded',     // [total amount, added amount]
		plantPress:     'plantPress',     // [garden plant]
		waterPlant:     'waterPlant',     // [garden plant]
		skippable:      'skippable'       // [TimelineMax object]
	},

	AGENT: {
		0: Panda,
		1: Panda,
		2: Panda,
		3: Panda
	},

	STATE: {
		entry:          'Entry',
		playerSetup:    'PlayerSetup',
		chooseScenario: 'chooseScenario',
		garden:         'Garden',
		0:              'Lizard',
		lizardGame:     'Lizard',
		1:              'Mountain',
		mountainGame:   'Mountain',
		2:              'Birdhero',
		birdheroGame:   'Birdhero',
		3:              'Balloon',
		balloonGame:    'Balloon',
		4:              'BeeFlight',
		beeGame:        'BeeFlight'
	},

	MODE: {
		playerDo:   0,
		playerShow: 1,
		agentTry:   2,
		agentDo:    3,
		intro:      4,
		outro:      5,
	},

	NUMBER_REPRESENTATION: {
		none:    0,
		dots:    1,
		fingers: 2,
		strikes: 3,
		objects: 4,
		numbers: 5,
		dice:    6,
		yesno:   15 // Special for yes/no: odd values = yes, even values = no
	},

	METHOD: {
		count: 0,
		incrementalSteps: 1,
		addition: 2,
		additionSubtraction: 3
	},

	FONT: 'The Girl Next Door'
};