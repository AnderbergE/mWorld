/* Lizard game. */
LizardGame.prototype = Object.create(Minigame.prototype);
LizardGame.prototype.constructor = LizardGame;

function LizardGame () {
	Minigame.call(this); // Call parent constructor.
}

LizardGame.prototype.preload = function () {
	this.load.image('lizardBg', 'assets/img/minigames/lizard/bg.png');
};

LizardGame.prototype.create = function () {
	// Subscriptions to not have access to 'this' object
	var _this = this;

	// Add main game
	this.add.sprite(0, 0, 'lizardBg', null, this.gameGroup);
	var agent = this.agent.gfx;
	agent.x = 100;
	agent.y = 0;
	this.gameGroup.bringToTop(agent);

	// Add HUD
	var buttons = new ButtonPanel(this.representation, this.amount,
		0, this.world.height-100, this.world.width, 75, 'wood');
	this.hudGroup.add(buttons);
	var yesnos = new ButtonPanel(GLOBAL.NUMBER_REPRESENTATION.yesno, 2,
		0, this.world.height-100, this.world.width, 75, 'wood');
	this.hudGroup.add(yesnos);
	var buttonFunction = null;

	function modePlay () {
		if (_this.currentTries <= 0) {
			agent.visible = true;
			showNumbers();
			_this.add.tween(agent).to({ x: '+100' }, 1000, Phaser.Easing.Linear.None, true);
		}
	}

	function showNumbers () {
		buttonFunction = debugNumbers;
		_this.hudGroup.visible = true;
		buttons.visible = true;
		yesnos.visible = false;
		_this.input.disabled = false;
	}
	function showYesnos () {
		buttonFunction = debugYesno;
		_this.hudGroup.visible = true;
		buttons.visible = false;
		yesnos.visible = true;
		_this.input.disabled = false;
	}

	this.modeIntro = function () {
		_this.input.disabled = true;
		_this.hudGroup.visible = false;
		_this.add.text(500, 100, 'Intro!', {
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
	this.modeAgentTrying = function () {
		_this.hudGroup.remove(press);
		press = new NumberButton(parseInt(1+Math.random()*_this.amount), _this.representation, 300, 400);
		_this.hudGroup.add(press);
		showYesnos();
		if (_this.currentTries <= 0) {
			_this.add.tween(agent).to({ x: '+100' }, 1000, Phaser.Easing.Linear.None, true);
		}
	};
	this.modeAgentOnly = function () { modePlay(); };

	this.modeOutro = function () {
		_this.input.disabled = true;
		_this.hudGroup.visible = false;
		_this.agent.setHappy(true);
		_this.add.text(200, 100, 'Outro!', {
			font: '20pt The Girl Next Door',
			fill: '#00ff00'
		}, _this.gameGroup);
		setTimeout(function () {
			publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.home]);
		}, 1000);
	};

	this.addEvent(GLOBAL.EVENT.numberPress, function(number) {
		buttonFunction(number);
	});

	// TODO: Debug section begin, remove later.
	var current = new NumberButton(this.nextNumber(), this.representation, 500, 400);
	this.hudGroup.add(current);
	var press = new NumberButton(null, this.representation, 300, 400);
	this.hudGroup.add(press);
	var blabla = new NumberButton(null, GLOBAL.NUMBER_REPRESENTATION.yesno, 300, 500);
	this.hudGroup.add(blabla);
	function debugNumbers (number) {
		if (_this.agent.tweens.happy && _this.agent.tweens.happy.isRunning) {
			_this.agent.setHappy(false);
		} else {
			_this.agent.setHappy(true);
		}
		_this.hudGroup.remove(press);
		press = new NumberButton(number, _this.representation, 300, 400);
		_this.hudGroup.add(press);
		if (_this.tryNumber(number)) {
			_this.hudGroup.remove(current);
			current = new NumberButton(_this.nextNumber(), _this.representation, 500, 400);
			_this.hudGroup.add(current);
			_this.nextRound();
		}
	}
	function debugYesno (number) {
		_this.hudGroup.remove(blabla);
		blabla = new NumberButton(number, GLOBAL.NUMBER_REPRESENTATION.yesno, 300, 500);
		_this.hudGroup.add(blabla);
		if (!number) {
			showNumbers();
		} else {
			if (_this.tryNumber(press.number)) {
				_this.hudGroup.remove(current);
				current = new NumberButton(_this.nextNumber(), _this.representation, 500, 400);
				_this.hudGroup.add(current);
				_this.nextRound();
			} else {
				_this.modeAgentTrying();
			}
		}
	}
	// TODO: Debug section stop, remove later.

	// Start up!
	this.startGame();
};