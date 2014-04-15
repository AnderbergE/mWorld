/* Holds all global constant objects. */
var GLOBAL = {

	EVENT: {
		menuShow:    'menuShow',
		menuHide:    'menuHide',
		numberPress: 'numberPress', // [number]
		modeChange:  'modeChange',
		tryNumber:   'tryNumber',   // [correct number, tried number]
		plantPress:  'plantPress'   // [number]
	},

	AGENT: {
		0: Panda
	},

	STATE: {
		entry:        'Entry',
		garden:       'Garden',
		0:            'Lizard',
		lizardGame:   'Lizard',
		1:            'Mountain',
		mountainGame: 'Mountain',
		2:            'Birdhero',
		birdheroGame: 'Birdhero'
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

	TEXT: {
		title: 'BOOM shackalack!',
		start: 'Start',
		credits: 'Credits',
		resume: 'Resume',
		quit: 'Quit',
		menu: 'MENU',
		maxLevel: 'MAX!'
	}
};