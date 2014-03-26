var GLOBAL = {
	EVENT: {
		viewChange: 'viewChange',  // [number]
		menuShow: 'menuShow',
		menuHide: 'menuHide',
		numberPress: 'numberPress', // [number]
		modeChange: 'modeChange',
		numberChange: 'numberChange' // [number]
	},

	VIEW: {
		entry: 0,
		home: 1,
		lizard: 2,
		mountain: 3,
		birdhero: 4
	},

	MODE: {
		intro: 0,
		playerOnly: 1,
		agentWatch: 2,
		agentTrying: 3,
		agentOnly: 4,
		outro: 5,
	},

	/*
	 * The key is the unique identifier that is recieved from the backend.
	 * The value is the name of the representation.
	 */
	NUMBER_REPRESENTATION: {
		dots: 0,
		fingers: 1,
		numbers: 2
	},

	TEXT: {
		title: 'BOOM shackalack!',
		start: 'Start',
		resume: 'Resume',
		quit: 'Quit',
		menu: 'MENU'
	}
};