/*
 * Inherits MinigameView
 * Holds the specific logic and graphics for the Lizard game.
 */
 function LizardGame (representation, amount, mode) {
	MinigameView.call(this, representation, amount, mode); // Call parent constructor.
	// Subscriptions to not have access to 'this' object
	var _this = this;

	// Add background
	game.add.sprite(0, 0, 'lizardBg', null, this.gameGroup);

	// Add HUD
	this.hudGroup.add(new ButtonPanel(representation, amount,
		0, game.world.height-100, game.world.width, 75, 'wood'));

	// Add main game
	var agent = game.add.sprite(mode*100, 0, 'panders', null, _this.gameGroup);
	agent.visible = false;

	// TODO: Debug section, remove later.
	var current = new NumberButton(this.nextNumber(), representation, 500, 400);
	this.hudGroup.add(current);
	var press = new NumberButton(null, representation, 300, 400);
	this.hudGroup.add(press);
	this.addEvent(GLOBAL.EVENT.numberPress, function(number) {
		_this.hudGroup.remove(press);
		press = new NumberButton(number, representation, 300, 400);
		_this.hudGroup.add(press);
		if (_this.tryNumber(number)) {
			_this.hudGroup.remove(current);
			current = new NumberButton(_this.nextNumber(), representation, 500, 400);
			_this.hudGroup.add(current);
			_this.nextRound();
		}
	});

	function modePlay () {
		game.input.disabled = false;
		if (_this.currentTries <= 0) {
			_this.hudGroup.visible = true;
			agent.visible = true;
			game.add.tween(agent).to({ x: '+100' }, 1000, Phaser.Easing.Linear.None, true);
		}
	}

	this.modeIntro = function () {
		game.input.disabled = true;
		_this.hudGroup.visible = false;
		game.add.text(500, 100, 'Intro!', {
			font: '20pt The Girl Next Door',
			stroke: '#00ff00',
			strokeWidth: 4
		}, _this.gameGroup);
		setTimeout(function () {
			_this.nextMode();
			_this.nextRound();
		}, 1000);
	};

	this.modePlayerOnly = function () { modePlay(); };
	this.modeAgentWatch = function () { modePlay(); };
	this.modeAgentTrying = function () { modePlay(); };
	this.modeAgentOnly = function () { modePlay(); };

	this.modeOutro = function () {
		game.input.disabled = true;
		_this.hudGroup.visible = false;
		game.add.tween(agent).to({ y: '-100' }, 200, Phaser.Easing.Linear.None, true).to({ y: '+100' }, 200).loop();
		game.add.text(200, 100, 'Outro!', {
			font: '20pt The Girl Next Door',
			fill: '#00ff00'
		}, _this.gameGroup);
		setTimeout(function () {
			publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.home]);
		}, 1000);
	};


	// Start up!
	this.startGame();
	return this;
}

// inheritance
LizardGame.prototype = Object.create(MinigameView.prototype);
LizardGame.prototype.constructor = LizardGame;
LizardGame.prototype.toString = function () { return 'LizardGame'; };

