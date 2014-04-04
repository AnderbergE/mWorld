var GLOBAL = {

	VIEW: {
		entry: 0,
		home: 1,
		lizard: 2,
		mountain: 3,
		birdhero: 4
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

	EVENT: {
		viewChange: 'viewChange',  // [number]
		menuShow: 'menuShow',
		menuHide: 'menuHide',
		numberPress: 'numberPress', // [number]
		modeChange: 'modeChange',
		numberChange: 'numberChange' // [number]
	},

	TEXT: {
		title: 'BOOM shackalack!',
		start: 'Start',
		credits: 'Credits',
		resume: 'Resume',
		quit: 'Quit',
		menu: 'MENU'
	}
};