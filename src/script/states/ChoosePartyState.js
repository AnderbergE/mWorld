var SuperState = require('./SuperState.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var Cover = require('../objects/Cover.js');
var Menu = require('../objects/Menu.js');
var Slider = require('../objects/Slider.js');
var TextButton = require('../objects/buttons/TextButton.js');

module.exports = ChoosePartyState;

ChoosePartyState.prototype = Object.create(SuperState.prototype);
ChoosePartyState.prototype.constructor = ChoosePartyState;

/* The menu for choosing agent, */
function ChoosePartyState () {}

/* Phaser state function */
ChoosePartyState.prototype.create = function () {
	var _this = this;

	this.add.image(0, 0, 'entryBg');

	this.world.add(new Cover(this.game, '#550000', 0.4));

	this.add.text(this.world.centerX, 60, LANG.TEXT.demoParty, {
		font: '15pt ' +  GLOBAL.FONT,
		fill: '#ffffff',
		align: 'center',
		wordWrap: true,
		wordWrapWidth: this.game.world.width - 40
	}).anchor.set(0.5, 0);

	var textOptions = {
		font: '20pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 4
	};
	var offset = 10;
	var i, t;

	/* Party game selection */
	var partyGame = null;
	var gameClicker = function () {
		if (partyGame !== this && partyGame) {
			partyGame.reset();
		}
		partyGame = this;
	};

	this.add.text(75, 220, LANG.TEXT.gameType, textOptions);
	var games = [
		[LANG.TEXT.partyInvitationGameName, GLOBAL.STATE.partyInvitationGame],
		[LANG.TEXT.partyGarlandGameName, GLOBAL.STATE.partyGarlandGame],
		[LANG.TEXT.partyBalloonGameName, GLOBAL.STATE.partyBalloonGame],
		[LANG.TEXT.partyGiftGameName, GLOBAL.STATE.partyGiftGame]
	];
	var gameButtons = [];
	for (i = 0; i < games.length; i++) {
		t = new TextButton(this.game, games[i][0], {
			x: t ? t.x + t.width + offset : 50,
			y: 270,
			size: 65,
			fontSize: 20,
			onClick: gameClicker,
			keepDown: true
		});
		t.gameState = games[i][1];
		this.world.add(t);
		gameButtons.push(t);
	}

	/* Add difficulty control. */
	this.add.text(75, 420, LANG.TEXT.difficulty, textOptions);

	var difficulty = this.add.text(this.game.width / 2, 420, 0, { font: '20pt ' +  GLOBAL.FONT });
	difficulty.anchor.set(0.5, 0);
	var difficultySlider = new Slider(this.game,
		50,
		500,
		this.game.width - 100,
		65,
		function (value) {
			difficulty.text = (parseFloat(value) * 100).toFixed(0) + '%';
		},
		0
	);
	this.world.add(difficultySlider);

	/* Start game (save current options) */
	var startButton = new TextButton(this.game, LANG.TEXT.start, {
		x: this.world.centerX - 75,
		y: 660,
		fontSize: 30,
		onClick: function () {
			if (!partyGame || !partyGame.gameState) {
				return;
			}

			/* Persistent save for ease of use. */
			localStorage.choosePartygame = partyGame.gameState;
			localStorage.choosePartyDifficulty = difficultySlider.value;

			_this.game.state.start(partyGame.gameState, true, false, { difficulty: difficultySlider.value * 10 });
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
	switch (localStorage.choosePartygame) {
		case GLOBAL.STATE.partyInvitationGame:
			gameButtons[0].setDown();
			partyGame = gameButtons[0];
			break;
		case GLOBAL.STATE.partyGarlandGame:
			gameButtons[1].setDown();
			partyGame = gameButtons[1];
			break;
		case GLOBAL.STATE.partyBalloonGame:
			gameButtons[2].setDown();
			partyGame = gameButtons[2];
			break;
		case GLOBAL.STATE.partyGiftGame:
			gameButtons[3].setDown();
			partyGame = gameButtons[3];
			break;
	}
	if (localStorage.choosePartyDifficulty) {
		difficultySlider.value = localStorage.choosePartyDifficulty;
	}
};
