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
		entry:        'Entry',
		playerSetup:  'PlayerSetup',
		garden:       'Garden',
		0:            'Lizard',
		lizardGame:   'Lizard',
		1:            'Mountain',
		mountainGame: 'Mountain',
		2:            'Birdhero',
		birdheroGame: 'Birdhero',
		3:            'Balloon',
		balloonGame:  'Balloon'
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
		dots:    0,
		fingers: 1,
		strikes: 2,
		objects: 3,
		numbers: 4,
		dice:    5,
		yesno:   15 // Special for yes/no: odd values = yes, even values = no
	},

	METHOD: {
		count: 0,
		basicMath: 1
	},

	FONT: 'The Girl Next Door'
};