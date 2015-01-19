var SuperState = require('./SuperState.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var Panda = require('../agent/Panda.js');
var Menu = require('../objects/Menu.js');
var NumberButton = require('../objects/buttons/NumberButton.js');
var TextButton = require('../objects/buttons/TextButton.js');

module.exports = ChooseScenarioState;

ChooseScenarioState.prototype = Object.create(SuperState.prototype);
ChooseScenarioState.prototype.constructor = ChooseScenarioState;

/* The menu for choosing agent, */
function ChooseScenarioState () {}

/* Phaser state function */
ChooseScenarioState.prototype.preload = function() {
	if (!this.game.player.agent) {
		console.log('Setting agent to: ' + Panda.prototype.id);
		this.game.player.agent = Panda;
		this.load.audio('pandaSpeech', LANG.SPEECH.AGENT.speech);
		this.load.atlasJSONHash('panda', 'img/agent/panda/atlas.png', 'img/agent/panda/atlas.json');
	}
};

/* Phaser state function */
ChooseScenarioState.prototype.create = function () {
	var _this = this;

	this.add.image(0, 0, 'entryBg');

	var textOptions = {
		font: '20pt ' +  GLOBAL.FONT,
		fill: '#ffffff',
		stroke: '#000000',
		strokeThickness: 4
	};
	var offset = 10;
	var i, t, key;


	/* Subgame selection */
	var subgame = null;
	var gameClicker = function () {
		if (subgame !== this && subgame) {
			subgame.reset();
		}
		subgame = this;
	};

	this.add.text(75, 80, 'Subgame', textOptions);
	var games = [
		['Balloon', GLOBAL.STATE.balloonGame],
		['Bird Hero', GLOBAL.STATE.birdheroGame],
		['Lizard', GLOBAL.STATE.lizardGame],
		['Bee Flight', GLOBAL.STATE.beeGame]
	];
	var gameButtons = [];
	for (i = 0; i < games.length; i++) {
		t = new TextButton(this.game, games[i][0], {
			x: t ? t.x + t.width + offset : 50,
			y: 125,
			fontSize: 25,
			onClick: gameClicker,
			keepDown: true
		});
		t.gameState = games[i][1];
		this.world.add(t);
		gameButtons.push(t);
	}


	/* Range selection */
	var range = null;
	var rangeClicker = function () {
		if (range !== this && range) {
			range.reset();
		}
		range = this;
	};

	this.add.text(75, 220, 'Number Range', textOptions);
	var rangeButtons = [];
	t = null;
	for (key in GLOBAL.NUMBER_RANGE) {
		t = new TextButton(this.game, '1 - ' + GLOBAL.NUMBER_RANGE[key], {
			x: t ? t.x + t.width + offset : 50,
			y: 265,
			fontSize: 33,
			onClick: rangeClicker,
			keepDown: true
		});
		t.range = key;
		this.world.add(t);
		rangeButtons[key] = t;
	}


	/* Representation selection */
	var representation = null;
	var representationClicker = function () {
		if (representation !== this && representation) {
			representation.reset();
		}
		representation = this;
	};

	this.add.text(75, 360, 'Number Representation', textOptions);
	var representationButtons = [];
	i = 0;
	for (key in GLOBAL.NUMBER_REPRESENTATION) {
		if (key === 'objects' || key === 'yesno') {
			continue;
		}

		representationButtons[GLOBAL.NUMBER_REPRESENTATION[key]] = new NumberButton(this.game, 4, GLOBAL.NUMBER_REPRESENTATION[key], {
			x: 50 + i*(75 + offset),
			y: 405,
			onClick: representationClicker
		});
		this.world.add(representationButtons[representationButtons.length-1]);
		i++;
	}


	/* Method selection */
	var method = null;
	var methodClicker = function () {
		if (method !== this && method) { method.reset(); }
		method = this;
	};

	this.add.text(75, 500, 'Method', textOptions);
	var methods = [
		['Counting',  GLOBAL.METHOD.count],
		['Step-by-step', GLOBAL.METHOD.incrementalSteps],
		['Addition', GLOBAL.METHOD.addition],
		['Subtraction', GLOBAL.METHOD.subtraction],
		['Add & Sub', GLOBAL.METHOD.additionSubtraction]
	];
	var methodButtons = [];
	t = null;
	for (i = 0; i < methods.length; i++) {
		t = new TextButton(this.game, methods[i][0], {
			x: t ? t.x + t.width + offset : 50,
			y: 545,
			fontSize: 20,
			onClick: methodClicker,
			keepDown: true
		});
		t.method = methods[i][1];
		this.world.add(t);
		methodButtons.push(t);
	}


	/* Start game (save current options) */
	var startButton = new TextButton(this.game, 'Start scenario', {
		x: this.world.centerX - 150,
		y: 660,
		fontSize: 30,
		onClick: function () {
			if (!subgame || !subgame.gameState ||
				!range || !range.range ||
				!representation || !representation.representations ||
				!method || (typeof method.method === 'undefined')) {
				return;
			}

			/* Persistent save for ease of use. */
			localStorage.chooseSubgame = subgame.gameState;
			localStorage.chooseRange = range.range;
			localStorage.chooseRepresentation = representation.representations;
			localStorage.chooseMethod = method.method;

			_this.game.state.start(subgame.gameState, true, false, {
				method: method.method,
				representation: representation.representations,
				range: range.range,
				roundsPerMode: 3
			});
		}
	});
	this.world.add(startButton);

	/* In case you want to check out garden instead. */
	var gotoGarden = new TextButton(this.game, LANG.TEXT.gotoGarden, {
		x: 75,
		y: 5,
		size: 56,
		fontSize: 20,
		onClick: function () {
			_this.game.state.start(GLOBAL.STATE.garden);
		}
	});
	this.world.add(gotoGarden);

	this.world.add(new Menu(this.game));


	/* If we have been in this state before, we try to preset the correct buttons. */
	switch (localStorage.chooseSubgame) {
		case GLOBAL.STATE.balloonGame:
			gameButtons[0].setDown();
			subgame = gameButtons[0];
			break;
		case GLOBAL.STATE.birdheroGame:
			gameButtons[1].setDown();
			subgame = gameButtons[1];
			break;
		case GLOBAL.STATE.lizardGame:
			gameButtons[2].setDown();
			subgame = gameButtons[2];
			break;
		case GLOBAL.STATE.beeGame:
			gameButtons[3].setDown();
			subgame = gameButtons[3];
			break;
	}
	if (localStorage.chooseRange) {
		rangeButtons[parseInt(localStorage.chooseRange)].setDown();
		range = rangeButtons[parseInt(localStorage.chooseRange)];
	}
	if (localStorage.chooseRepresentation) {
		representationButtons[parseInt(localStorage.chooseRepresentation)].setDown();
		representation = representationButtons[parseInt(localStorage.chooseRepresentation)];
	}
	if (localStorage.chooseMethod) {
		methodButtons[parseInt(localStorage.chooseMethod)].setDown();
		method = methodButtons[parseInt(localStorage.chooseMethod)];
	}
};