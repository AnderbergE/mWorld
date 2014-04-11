var GLOBAL = {

	EVENT: {
		viewChange:  'viewChange',  // [number]
		menuShow:    'menuShow',
		menuHide:    'menuHide',
		numberPress: 'numberPress', // [number]
		modeChange:  'modeChange',
		tryNumber:   'tryNumber',   // [correct number, tried number]
		plantPress:  'plantPress'   // [number]
	},

	VIEW: {
		entry: 'Entry',
		garden: 'Garden',
		1: 'Lizard',
		lizardGame: 'Lizard',
		2: 'Mountain',
		mountainGame: 'Mountain',
		3: 'Birdhero',
		birdheroGame: 'Birdhero'
	},

	AGENT: {
		0: Panda
	},

	MODE: {
		intro: 0,
		playerOnly: 1,
		agentWatch: 2,
		agentTrying: 3,
		agentOnly: 4,
		outro: 5,
	},

	NUMBER_REPRESENTATION: {
		dots: 0,
		fingers: 1,
		numbers: 2,
		yesno: 3
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