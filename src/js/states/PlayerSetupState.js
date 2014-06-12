/* The menu for choosing agent, */
function PlayerSetupState () {}

/* Phaser state function */
PlayerSetupState.prototype.preload = function () {
	this.load.audio('pandaChooseMe', LANG.SPEECH.panda.chooseMe);
};

/* Phaser state function */
PlayerSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var scale = { x: 0.3, y: 0.3 };
	var scaleActive = { x: 0.5, y: 0.5 };
	var slideTime = 1;
	var fontStyle = {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	};

	this.add.image(0, 0, 'entryBg');
	this.add.text(this.world.centerX, 75, LANG.TEXT.pickFriend, fontStyle).anchor.set(0.5);

	var agents = this.add.group();
	agents.x = spacing;
	var a;
	for (var key in GLOBAL.AGENT) {
		a = new GLOBAL.AGENT[key]();
		this.add.text(0, -(a.body.height/2) - 50, a.name, fontStyle, a).anchor.set(0.5);
		a.x = this.world.centerX + spacing * key;
		a.y = this.world.centerY + 50;
		a.scale.x = scale.x;
		a.scale.y = scale.y;
		a.body.inputEnabled = true;
		a.body.events.onInputDown.add(clickAgent, a);
		a.itsame = game.add.audio(a.id + 'ChooseMe');
		agents.add(a);
	}

	function stopTalk () {
		for (var key in agents.children) {
			agents.children[key].itsame.stop();
		}
	}

	function clickAgent () {
		if (a === this) {
			a.fistPump()
				.addCallback(function () { _this.state.start(GLOBAL.STATE.garden); });
			return;
		}

		TweenMax.to(a.scale, slideTime, scale); // Scale down the old agent
		a = this;
		TweenMax.to(a.scale, slideTime, scaleActive); // Scale up the new agent
		// Move the agent group to get the sliding effect on all agents
		TweenMax.to(agents, slideTime, { x: -(agents.children.indexOf(a) * spacing), ease: Power2.easeOut,
			onStart: function () { stopTalk(); },
			onComplete: function () { say(a.itsame, a).play(); }
		});
	}

	this.world.add(new Menu());

	// Choose first agent
	agents.children[0].body.events.onInputDown.dispatch();
};

/* Phaser state function */
PlayerSetupState.prototype.shutdown = onShutDown;