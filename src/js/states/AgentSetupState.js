/**
 * The state for choosing agent.
 */
function AgentSetupState () {}

/* Phaser state function */
AgentSetupState.prototype.preload = function () {
	this.load.audio('pandaChooseMe', LANG.SPEECH.panda.chooseMe);
};

/* Phaser state function */
AgentSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var scale = { x: 0.3, y: 0.3 };       // Default scale
	var scaleActive = { x: 0.5, y: 0.5 }; // Scale when pushed
	var scalePicked = { x: 0.6, y: 0.6 }; // Scale when pushed the second time
	var slideTime = 1;
	var fontStyle = {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	};


	function clickAgent () {
		if (a === this) {
			/* Agent was already active, go into coloring mode */
			pickAgent();
		} else {
			cancelAgent();
			TweenMax.to(a.scale, slideTime, scale); // Scale down the old agent
			a = this;
			TweenMax.to(a.scale, slideTime, scaleActive); // Scale up the new agent
			// Move the agent group to get the sliding effect on all agents
			TweenMax.to(agents, slideTime, {
				x: -(agents.children.indexOf(a) * spacing),
				ease: Power2.easeOut,
				onStart: function () { stopTalk(); },
				onComplete: function () {
					a.say(a.itsame).play();
					a.wave(2, 1);
				}
			});
		}
	}

	function stopTalk () {
		for (var key in agents.children) {
			agents.children[key].itsame.stop();
		}
	}

	function fadeInterface (value) {
		fade(title, !value, value ? 0.2 : 0.5);
		fade(color, value, !value ? 0.2 : 0.5);
		fade(noToAgent, value);
		fade(yesToAgent, value);
	}

	function pickAgent () {
		TweenMax.to(a.scale, 0.5, scalePicked);
		fadeInterface(true);
	}

	function cancelAgent () {
		TweenMax.to(a.scale, 0.5, scaleActive);
		fadeInterface(false);
		noToAgent.reset();
	}

	function chooseAgent () {
		fadeInterface(false);
		a.fistPump()
			.addCallback(function () {
				Backend.putAgent({ agent: { type: a.key, tint: a.tint } });
				player.agent = GLOBAL.AGENT[a.key];
				player.tint = a.tint;
			}, 0)
			.addCallback(function () {
				_this.state.start(GLOBAL.STATE.garden);
			});
	}


	this.add.image(0, 0, 'entryBg');
	var title = this.add.text(this.world.centerX, 75, LANG.TEXT.pickFriend, fontStyle);
	title.anchor.set(0.5);

	var color = new TextButton(LANG.TEXT.changeColor, {
		x: this.world.centerX - 150,
		y: 25,
		fontSize: 30,
		onClick: function () { a.tint = game.rnd.integerInRange(0x000000, 0xffffff); }
	});
	color.visible = false;
	this.world.add(color);

	var noToAgent = new NumberButton(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.centerX - 275,
		y: this.world.centerY*0.6,
		size: 75,
		onClick: cancelAgent
	});
	noToAgent.visible = false;
	this.world.add(noToAgent);

	var yesToAgent = new NumberButton(1, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.centerX + 200,
		y: this.world.centerY*0.6,
		size: 75,
		onClick: chooseAgent
	});
	yesToAgent.visible = false;
	this.world.add(yesToAgent);


	var agents = this.add.group();
	agents.x = spacing;
	var a;
	for (var key in GLOBAL.AGENT) {
		a = new GLOBAL.AGENT[key]();
		this.add.text(0, -(a.body.height/2) - 50, a.agentName, fontStyle, a).anchor.set(0.5);
		a.x = this.world.centerX + spacing * key;
		a.y = this.world.centerY + 70;
		a.scale.x = scale.x;
		a.scale.y = scale.y;
		a.body.inputEnabled = true;
		a.body.events.onInputDown.add(clickAgent, a);
		a.itsame = game.add.audio(a.id + 'ChooseMe');
		a.key = key;
		agents.add(a);
	}


	this.world.add(new Menu());


	/* Choose the first agent if player does not have one */
	var current = 0;
	if (player.agent) {
		for (var k in agents.children) {
			if (agents.children[k].id === player.agent.prototype.id) {
				agents.children[k].tint = player.tint;
				current = k;
				break;
			}
		}
	}

	agents.children[current].body.events.onInputDown.dispatch();
};

/* Phaser state function */
AgentSetupState.prototype.shutdown = onShutDown;