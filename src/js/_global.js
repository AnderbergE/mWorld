/**
 * Holds all global constant objects.
 * @global
 */
var GLOBAL = {

	/* Used for the publish-subscribe system */
	EVENT: {
		stateShutDown:  'stateShutDown',  // [state]

		subgameStarted: 'subgameStarted', // [game type, session token]
		modeChange:     'modeChange',     // [new mode]
		tryNumber:      'tryNumber',      // [guess, correct number]
		agentGuess:     'agentGuess',     // [guess, correct number]
		numberPress:    'numberPress',    // [number, representations]
		waterAdded:     'waterAdded',     // [total amount, added amount]
		disabled:       'disabled',       // [true/false]

		plantPress:     'plantPress',     // [garden plant]
		waterPlant:     'waterPlant',     // [garden plant]
		plantUpgrade:   'plantUpgrade',   // [backend data]

		skippable:      'skippable',      // [TimelineMax object]
		connection:     'connection',     // [status]
		connectionLost: 'connectionLost'
	},

	/* The different types of agents */
	AGENT: {
		0: Panda,
		1: Hedgehog,
		2: Mouse,
		3: Panda
	},

	/* The different Phaser states, some are the subgames for scenarios */
	STATE: {
		entry:        'Entry',
		agentSetup:   'AgentSetup',
		garden:       'Garden',
		0:            'Lizard',
		lizardGame:   'Lizard',
		1:            'Mountain',
		mountainGame: 'Mountain',
		2:            'Birdhero',
		birdheroGame: 'Birdhero',
		3:            'Balloon',
		balloonGame:  'Balloon',
		4:            'BeeFlight',
		beeGame:      'BeeFlight',
		scenario:     'Scenario'
	},

	/* Method for scenario */
	METHOD: {
		count: 0,              // All numbers displayed at the same time
		incrementalSteps: 1,   // One number that you increment or decrement, ex: (- 1 +)
		addition: 2,           // Start with one number and choose what to add
		subtraction: 3,        // Start with one number and choose what to subtract
		additionSubtraction: 4 // Start with one number and choose what to add or subtract
	},

	/* Number representation for scenario */
	NUMBER_REPRESENTATION: {
		none:           0,
		dots:           1,
		fingers:        2,
		strikes:        3,
		objects:        4,
		numbers:        5,
		dice:           6,
		yesno:         15 // Special for yes/no: odd values = yes, even values = no
	},

	/* Number range for scenario */
	NUMBER_RANGE: {
		0: 4, // Range 1-4
		1: 9  // Range 1-9
	},

	/* The different modes of a subgame */
	MODE: {
		playerDo:   0,
		playerShow: 1,
		agentTry:   2,
		agentDo:    3,
		intro:      10,
		outro:      11,
	},

	BUTTON_COLOR: 0xc2a12d,
	FONT: 'The Girl Next Door'
};