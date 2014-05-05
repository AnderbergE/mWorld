/* Holds all global constant objects. */
var GLOBAL = {

	EVENT: {
		menuShow:    'menuShow',
		menuHide:    'menuHide',
		numberPress: 'numberPress', // [number]
		modeChange:  'modeChange',
		tryNumber:   'tryNumber',   // [correct number, tried number]
		waterAdded:  'waterAdded',  // [total amount, added amount]
		plantPress:  'plantPress'   // [number]
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
		yesno:   15 // Special representation for yes/no buttons
	},

	FONT: 'The Girl Next Door',
	TEXT: {
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
	}
};