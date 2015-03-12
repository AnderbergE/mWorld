var GLOBAL = require('./global.js');
var Player = require('./player.js');
var Hedgehog = require('./agent/Hedgehog.js');
var Mouse = require('./agent/Mouse.js');
var Panda = require('./agent/Panda.js');
var BootState = require('./states/BootState.js');
var EntryState = require('./states/EntryState.js');
var AgentSetupState = require('./states/AgentSetupState.js');
var GardenState = require('./states/GardenState.js');
var LizardJungleGame = require('./states/subgames/LizardJungleGame.js');
var BirdheroGame = require('./states/subgames/BirdheroGame.js');
var BalloonGame = require('./states/subgames/BalloonGame.js');
var BeeFlightGame = require('./states/subgames/BeeFlightGame.js');
var ChooseScenarioState = require('./states/ChooseScenarioState.js');

require('./logger.js'); // Start logger
require('./utils.js'); // Setup prototype functions.

/**
 * This is the entrance point to the game.
 * This is where all the states/games are added.
 * BootState will run after this.
 */
window.onload = function () {

	// Only start game if the element to put it in exist.
	if (document.querySelector('#game')) {

		// If running locally we enter debug mode.
		if (window.location.hostname.toLowerCase() === 'localhost' || window.location.hostname === '127.0.0.1') {
			GLOBAL.debug = true;
		}

		// Create game object.
		var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');

		// Cache game object among GLOBALs, use this only if necessary.
		// TODO: This is not a pretty solution, but it becomes very complicated in utils otherwise.
		GLOBAL.game = game;

		/* Setup agent lookup globals */
		GLOBAL.AGENT = {
			0: Panda,
			1: Hedgehog,
			2: Mouse
		};

		// Cache player object in the game object for easy access.
		game.player = new Player(game);

		// Setup game states.
		game.state.add('Boot', BootState);
		game.state.add(GLOBAL.STATE.entry,        EntryState);
		game.state.add(GLOBAL.STATE.agentSetup,   AgentSetupState);
		game.state.add(GLOBAL.STATE.garden,       GardenState);
		game.state.add(GLOBAL.STATE.lizardGame,   LizardJungleGame);
		game.state.add(GLOBAL.STATE.birdheroGame, BirdheroGame);
		game.state.add(GLOBAL.STATE.balloonGame,  BalloonGame);
		game.state.add(GLOBAL.STATE.beeGame,      BeeFlightGame);
		game.state.add(GLOBAL.STATE.scenario,     ChooseScenarioState);

		// Run the boot state.
		game.state.start('Boot');
	}
};