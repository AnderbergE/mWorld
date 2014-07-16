/* Holds all global constant objects. */
var GLOBAL = {

	EVENT: {
		stateShutDown:  'stateShutDown',  // [state]

		subgameStarted: 'subgameStarted', // [game type]
		modeChange:     'modeChange',     // [new mode]
		tryNumber:      'tryNumber',      // [guess, correct number]
		agentGuess:     'agentGuess',     // [guess, correct number]
		numberPress:    'numberPress',    // [number, representations]
		textPress:      'textPress',      // [text]
		waterAdded:     'waterAdded',     // [total amount, added amount]

		plantPress:     'plantPress',     // [garden plant]
		waterPlant:     'waterPlant',     // [garden plant]
		plantWaterUp:   'plantWaterUp',   // [x, y, current]
		plantLevelUp:   'plantLevelUp',   // [x, y, level, type]

		skippable:      'skippable',      // [TimelineMax object]
		connection:     'connection'      // [status]
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
		intro:      10,
		outro:      11,
	},

	NUMBER_REPRESENTATION: {
		none:           0,
		dots:           1,
		fingers:        2,
		strikes:        3,
		objects:        4,
		numbers:        5,
		dice:           6,
		signedNumbers: 10,
		yesno:         15 // Special for yes/no: odd values = yes, even values = no
	},

	METHOD: {
		count: 0,              // All numbers displayed at the same time
		incrementalSteps: 1,   // One number that you increment or decrement, ex: (- 1 +)
		addition: 2,           // Start with one number and choose what to add
		additionSubtraction: 3 // Start with one number and choose what to add or subtract
	},

	FONT: 'The Girl Next Door'
};