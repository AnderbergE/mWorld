/* The menu for choosing agent, */
function ChooseScenarioState () {}

/* Phaser state function */
ChooseScenarioState.prototype.create = function () {
	this.add.image(0, 0, 'entryBg');

	var subgame = null;
	var amount = null;
	var representation = null;
	var method = null;


	/* Subgame selection */
	var buttonSize = 200;
	var fontSize = 25;
	var offset = 10;
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
	var t, i;
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
	var amountClicker = function () {
		if (amount !== this && amount) { amount.reset(); }
		amount = this;
	};

	var onefourButton = new TextButton('1 - 4', {
		x: 50,
		y: 200,
		fontSize: fontSize,
		background: 'wood',
		onClick: amountClicker
	});
	onefourButton._text.anchor.set(0, 0.5);
	onefourButton.bg.events.onInputUp.removeAll();
	onefourButton.bg.width = buttonSize;
	onefourButton.amount = 4;
	this.world.add(onefourButton);

	var onenineButton = new TextButton('1 - 9', {
		x: 50 + buttonSize + offset,
		y: 200,
		fontSize: fontSize,
		background: 'wood',
		onClick: amountClicker
	});
	onenineButton._text.anchor.set(0, 0.5);
	onenineButton.bg.events.onInputUp.removeAll();
	onenineButton.bg.width = buttonSize;
	onenineButton.amount = 9;
	this.world.add(onenineButton);


	/* Representation selection */
	buttonSize = 75;
	var representationClicker = function () {
		if (representation !== this && representation) { representation.reset(); }
		representation = this;
	};

	var representationButtons = [];
	i = 0;
	for (var key in GLOBAL.NUMBER_REPRESENTATION) {
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
	buttonSize = 75;
	var methodClicker = function () {
		if (method !== this && method) { method.reset(); }
		method = this;
	};

	buttonSize = 280;
	fontSize = 25;
	var countButton = new TextButton('  Counting', {
		x: 50,
		y: 400,
		fontSize: fontSize,
		background: 'wood',
		onClick: methodClicker
	});
	countButton._text.anchor.set(0, 0.5);
	countButton.bg.events.onInputUp.removeAll();
	countButton.bg.width = buttonSize;
	countButton.method = '' + GLOBAL.METHOD.count; // Trick to not get 0 value
	this.world.add(countButton);

	var plusminusButton = new TextButton('Add Subtract', {
		x: 50 + buttonSize + offset,
		y: 400,
		fontSize: fontSize,
		background: 'wood',
		onClick: methodClicker
	});
	plusminusButton._text.anchor.set(0, 0.5);
	plusminusButton.bg.events.onInputUp.removeAll();
	plusminusButton.bg.width = buttonSize;
	plusminusButton.method = GLOBAL.METHOD.basicMath;
	this.world.add(plusminusButton);


	/* Start game (save current options) */
	var startButton = new TextButton('   Start', {
		x: this.world.centerX-150,
		y: 550,
		fontSize: 30,
		background: 'wood',
		onClick: function () {
			if (!subgame || !subgame.gameState ||
				!amount || !amount.amount ||
				!representation || !representation.representations ||
				!method || !method.method) {
				return;
			}

			/* Persistent save for ease of use. */
			localStorage.chooseSubgame = subgame.gameState;
			localStorage.chooseAmount = amount.amount;
			localStorage.chooseRepresentation = representation.representations;
			var m = (method && method.method) ? method.method : GLOBAL.STATE.count;
			localStorage.chooseMethod = m;

			game.state.start(subgame.gameState, true, false, {
				method: parseInt(m),
				representation: representation.representations,
				amount: amount.amount, // TODO: Use range instead
				roundsPerMode: 3
			});
		}
	});
	startButton._text.anchor.set(0, 0.5);
	startButton.bg.width = 300;
	this.world.add(startButton);


	/* Have the last press predefined */
	switch (localStorage.chooseSubgame) {
		case GLOBAL.STATE.balloonGame:
			gameButtons[0].bg.events.onInputDown.dispatch();
			break;
		case GLOBAL.STATE.birdheroGame:
			gameButtons[1].bg.events.onInputDown.dispatch();
			break;
		case GLOBAL.STATE.lizardGame:
			gameButtons[2].bg.events.onInputDown.dispatch();
			break;
		case GLOBAL.STATE.beeGame:
			gameButtons[3].bg.events.onInputDown.dispatch();
			break;
	}
	switch (parseInt(localStorage.chooseAmount)) {
		case 4:
			onefourButton.bg.events.onInputDown.dispatch();
			break;
		case 9:
			onenineButton.bg.events.onInputDown.dispatch();
			break;
	}
	if (localStorage.chooseRepresentation) {
		representationButtons[parseInt(localStorage.chooseRepresentation)].bg.events.onInputDown.dispatch();
	}
	switch (parseInt(localStorage.chooseMethod)) {
		case GLOBAL.METHOD.count:
			countButton.bg.events.onInputDown.dispatch();
			break;
		case GLOBAL.METHOD.basicMath:
			plusminusButton.bg.events.onInputDown.dispatch();
			break;
	}


	this.world.add(new Menu());
};

/* Phaser state function */
ChooseScenarioState.prototype.shutdown = onShutDown;