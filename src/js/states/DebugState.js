/* The menu for choosing agent, */
function DebugState () {}

/* Phaser state function */
DebugState.prototype.create = function () {
	this.add.image(0, 0, 'entryBg');

	if (!player.agent) {
		console.log('Setting agent to: ' + GLOBAL.AGENT[0].prototype.id);
		player.agent = GLOBAL.AGENT[0];
	}

	var subgame = null;
	var range = null;
	var representation = null;
	var method = null;

	var offset = 10;
	var i, t, key;


	/* Subgame selection */
	var buttonSize = 200;
	var fontSize = 25;
	var gameClicker = function () {
		if (subgame !== this && subgame) { subgame.reset(); }
		subgame = this;
	};

	var games = [
		[' Balloon', GLOBAL.STATE.balloonGame],
		['Bird Hero', GLOBAL.STATE.birdheroGame],
		['Lizard', GLOBAL.STATE.lizardGame],
		['Bee Flight', GLOBAL.STATE.beeGame]
	];
	var gameButtons = [];
	for (i = 0; i < games.length; i++) {
		t = new TextButton(games[i][0], {
			x: 50 + i*(buttonSize + offset),
			y: 100,
			fontSize: fontSize,
			background: 'wood',
			onClick: gameClicker
		});
		t.bg.width = buttonSize;
		t._text.anchor.set(0, 0.5);
		t.bg.events.onInputUp.removeAll();
		t.gameState = games[i][1];
		this.world.add(t);
		gameButtons.push(t);
	}


	/* Range selection */
	buttonSize = 150;
	fontSize = 33;
	var rangeClicker = function () {
		if (range !== this && range) { range.reset(); }
		range = this;
	};

	var rangeButtons = [];
	i = 0;
	for (key in GLOBAL.NUMBER_RANGE) {
		t = new TextButton('1 - ' + GLOBAL.NUMBER_RANGE[key], {
			x: 50 + i*(buttonSize + offset),
			y: 200,
			fontSize: fontSize,
			background: 'wood',
			onClick: rangeClicker
		});
		t._text.anchor.set(0, 0.5);
		t.bg.events.onInputUp.removeAll();
		t.bg.width = buttonSize;
		t.range = key;
		this.world.add(t);
		rangeButtons[key] = t;
		i++;
	}


	/* Representation selection */
	buttonSize = 75;
	fontSize = 33;
	var representationClicker = function () {
		if (representation !== this && representation) { representation.reset(); }
		representation = this;
	};

	var representationButtons = [];
	i = 0;
	for (key in GLOBAL.NUMBER_REPRESENTATION) {
		if (key === 'objects' || key === 'yesno') { continue; }
		representationButtons[GLOBAL.NUMBER_REPRESENTATION[key]] = new NumberButton(4, GLOBAL.NUMBER_REPRESENTATION[key], {
			x: 50 + i*(buttonSize + offset),
			y: 300,
			background: 'wood',
			onClick: representationClicker
		});
		this.world.add(representationButtons[representationButtons.length-1]);
		i++;
	}


	/* Method selection */
	buttonSize = 200;
	fontSize = 20;
	var methodClicker = function () {
		if (method !== this && method) { method.reset(); }
		method = this;
	};

	var methods = [
		[' Counting',  GLOBAL.METHOD.count],
		['Step-by-step', GLOBAL.METHOD.incrementalSteps],
		[' Addition', GLOBAL.METHOD.addition],
		['Add & Sub', GLOBAL.METHOD.additionSubtraction]
	];
	var methodButtons = [];
	for (i = 0; i < methods.length; i++) {
		t = new TextButton(methods[i][0], {
			x: 50 + i*(buttonSize + offset),
			y: 400,
			fontSize: fontSize,
			background: 'wood',
			onClick: methodClicker
		});
		t.bg.width = buttonSize;
		t._text.anchor.set(0, 0.5);
		t.bg.events.onInputUp.removeAll();
		t.method = methods[i][1];
		this.world.add(t);
		methodButtons.push(t);
	}


	/* Start game (save current options) */
	var startButton = new TextButton('   Start', {
		x: this.world.centerX - 150,
		y: 520,
		fontSize: 30,
		background: 'wood',
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

			game.state.start(subgame.gameState, true, false, {
				method: method.method,
				representation: representation.representations,
				range: range.range,
				roundsPerMode: 3
			});
		}
	});
	startButton._text.anchor.set(0, 0.5);
	startButton.bg.width = 300;
	this.world.add(startButton);

	/* In case you want to check out garden instead. */
	var gotoGarden = new TextButton('Go to garden', {
		x: this.world.width - 250,
		y: 680,
		fontSize: 20,
		background: 'wood',
		onClick: function () {
			game.state.start(GLOBAL.STATE.garden);
		}
	});
	gotoGarden._text.anchor.set(0, 0.5);
	gotoGarden.bg.width = 230;
	this.world.add(gotoGarden);


	/* Have the last press predefined */
	switch (localStorage.chooseSubgame) {
		case GLOBAL.STATE.balloonGame:
			gameButtons[0].bg.frame++;
			subgame = gameButtons[0];
			break;
		case GLOBAL.STATE.birdheroGame:
			gameButtons[1].bg.frame++;
			subgame = gameButtons[1];
			break;
		case GLOBAL.STATE.lizardGame:
			gameButtons[2].bg.frame++;
			subgame = gameButtons[2];
			break;
		case GLOBAL.STATE.beeGame:
			gameButtons[3].bg.frame++;
			subgame = gameButtons[3];
			break;
	}
	if (localStorage.chooseRange) {
		rangeButtons[parseInt(localStorage.chooseRange)].bg.frame++;
		range = rangeButtons[parseInt(localStorage.chooseRange)];
	}
	if (localStorage.chooseRepresentation) {
		representationButtons[parseInt(localStorage.chooseRepresentation)].bg.frame++;
		representation = representationButtons[parseInt(localStorage.chooseRepresentation)];
	}
	if (localStorage.chooseMethod) {
		methodButtons[parseInt(localStorage.chooseMethod)].bg.frame++;
		method = methodButtons[parseInt(localStorage.chooseMethod)];
	}

	this.world.add(new Menu());
};

/* Phaser state function */
DebugState.prototype.shutdown = onShutDown;