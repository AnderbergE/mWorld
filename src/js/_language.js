/**
 * This is the language variable for the game.
 * All text and speech files for the game should be here.
 *
 * It was developed with switching languages in mind. To do so:
 * replace LANG.TEXT and LANG.SPEECH with the new language.
 * (make sure that all properties exist in the new language file)
 * set LANG.SPEECH.AGENT according to the current user.agent.
 *
 * NOTE: GLOBAL.FONT specifies which font that is used.
 */
var LANG = {};

LANG.TEXT = {
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
};

LANG.SPEECH = {
	birdhero: {
		instruction1a: ['assets/audio/subgames/birdhero/instruction_1a.mp3', 'assets/audio/subgames/birdhero/instruction_1a.ogg'],
		instruction1b: ['assets/audio/subgames/birdhero/instruction_1b.mp3', 'assets/audio/subgames/birdhero/instruction_1b.ogg'],
		instruction2:  ['assets/audio/subgames/birdhero/instruction_2.mp3',  'assets/audio/subgames/birdhero/instruction_2.ogg'],
		thisFloor:     ['assets/audio/subgames/birdhero/this_floor.mp3',     'assets/audio/subgames/birdhero/this_floor.ogg'],
		wrongHigher:   ['assets/audio/subgames/birdhero/wrong_higher.mp3',   'assets/audio/subgames/birdhero/wrong_higher.ogg'],
		wrongLower:    ['assets/audio/subgames/birdhero/wrong_lower.mp3',    'assets/audio/subgames/birdhero/wrong_lower.ogg']
	},

	/* Agents */
	panda: {
		hmm:          ['assets/audio/agent/panda/hmm.mp3',       'assets/audio/agent/panda/hmm.ogg'],
		tryAgain:     ['assets/audio/agent/panda/try_again.mp3', 'assets/audio/agent/panda/try_again.ogg'],
		showMe:       ['assets/audio/agent/panda/show_me.mp3',   'assets/audio/agent/panda/show_me.ogg'],
		birdheroShow: ['assets/audio/agent/panda/hello.mp3',     'assets/audio/agent/panda/hello.ogg'],
		birdheroTry:  ['assets/audio/agent/panda/i_try.mp3',     'assets/audio/agent/panda/i_try.ogg']
	}
};

/* Use this for the agent speech, it makes it easier to switch between agents. */
LANG.SPEECH.AGENT = LANG.SPEECH.panda;