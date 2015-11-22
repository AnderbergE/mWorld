/* Used for the publish-subscribe system */
exports.EVENT = {
	stateShutDown:     'stateShutDown',     // [state]

	subgameStarted:    'subgameStarted',    // [game type, session token]
	numbergameStarted: 'numbergameStarted', // [method, maxAmount, representation]
	modeChange:        'modeChange',        // [new mode]
	tryNumber:         'tryNumber',         // [guess, correct number]
	agentGuess:        'agentGuess',        // [guess, correct number]
	numberPress:       'numberPress',       // [number, representations]
	waterAdded:        'waterAdded',        // [total amount, added amount]
	disabled:          'disabled',          // [true/false]

	plantPress:        'plantPress',        // [garden plant]
	waterPlant:        'waterPlant',        // [garden plant]
	plantUpgrade:      'plantUpgrade',      // [backend data]

	skippable:         'skippable',         // [TimelineMax object]
	connection:        'connection',        // [status]
	connectionLost:    'connectionLost'
};

/* The different Phaser states, some are the subgames for scenarios */
exports.STATE = {
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
	5:            'Vehicles',
	vehicleGame:  'Vehicles',
	scenario:     'Scenario',
	partyInvitationGame:'PartyInvitation',
	partyGarlandGame:  'PartyGarland',
	partyBalloonGame:  'PartyBalloon',
	partyGiftGame:  'PartyGift',
	partyGame:    'Party',
	random:       100,         // Not an actual state.
	randomGames:  [0, 2, 3, 4, 5] // Not an actual state, it will randomly pick one in the array.
};
exports.STATE_KEYS = null; // Used to clear a subgame, saved when subgame is booted.

/* Method for scenario */
exports.METHOD = {
	count: 0,              // All numbers displayed at the same time
	incrementalSteps: 1,   // One number that you increment or decrement, ex: (- 1 +)
	addition: 2,           // Start with one number and choose what to add
	subtraction: 3,        // Start with one number and choose what to subtract
	additionSubtraction: 4 // Start with one number and choose what to add or subtract
};

/* Number representation for scenario */
exports.NUMBER_REPRESENTATION = {
	none:       0,
	dots:       1,
	fingers:    2,
	strikes:    3,
	objects:    4,
	numbers:    5,
	dice:       6,
	mixed:      9,
	// Multiple representations will be formed as concatenations, such as:
	// fingers + dots = 21
	// So if representations go above 10 there will be problems in Backend.js.
	yesno:   1000 // Special for yes/no: odd values = yes, even values = no
};

/* Number range for scenario */
exports.NUMBER_RANGE = {
	0: 4, // Range 1-4
	1: 9  // Range 1-9
};

/* The different modes of a subgame */
exports.MODE = {
	playerDo:   0,
	playerShow: 1,
	agentTry:   2,
	agentDo:    3,
	intro:      10,
	outro:      11,
};

// Default button color.
exports.BUTTON_COLOR = 0xc2a12d;

// Font to use in the game.
exports.FONT = 'Coming Soon';