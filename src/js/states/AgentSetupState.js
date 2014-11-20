/**
 * The state for choosing agent.
 */
function AgentSetupState () {}

/* Phaser state function */
AgentSetupState.prototype.preload = function() {
	this.load.audio('chooseSpeech', LANG.SPEECH.agentIntro.speech);
	this.load.atlasJSONHash(Panda.prototype.id, 'assets/img/agent/panda/atlas.png', 'assets/img/agent/panda/atlas.json');
	this.load.atlasJSONHash(Hedgehog.prototype.id, 'assets/img/agent/hedgehog/atlas.png', 'assets/img/agent/hedgehog/atlas.json');
	this.load.atlasJSONHash(Mouse.prototype.id, 'assets/img/agent/mouse/atlas.png', 'assets/img/agent/mouse/atlas.json');
};

/* Phaser state function */
AgentSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var scale = { x: 0.3, y: 0.3 };       // Default scale
	var scaleActive = { x: 0.4, y: 0.4 }; // Scale when pushed
	var scalePicked = { x: 0.5, y: 0.5 }; // Scale when pushed the second time
	var slideTime = 1;
	var fontStyle = {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	};
	var waving;

	var speech = createAudioSheet('chooseSpeech', LANG.SPEECH.agentIntro.markers);


	function clickAgent () {
		if (a === this) {
			/* Agent was already active, go into coloring mode */
			pickAgent();
		} else {
			if (a) {
				cancelAgent();
				TweenMax.to(a.scale, slideTime, scale); // Scale down the old agent
			}
			a = this;
			TweenMax.to(a.scale, slideTime, scaleActive); // Scale up the new agent
			// Move the agent group to get the sliding effect on all agents
			TweenMax.to(agents, slideTime, {
				x: -(agents.children.indexOf(a) * spacing),
				ease: Power2.easeOut,
				onStart: function () { speech.stop(); },
				onComplete: function () {
					a.say(speech, a.id + 'Hello').play(a.id + 'Hello');
					waving = a.wave(2, 1);
				}
			});
		}
	}

	function fadeInterface (value) {
		confirm.text = LANG.TEXT.confirmFriend + a.agentName + '?';
		fade(title, !value, value ? 0.2 : 0.5);
		fade(confirm, value, !value ? 0.2 : 0.5);
		fade(noToAgent, value);
		fade(yesToAgent, value);
		fade(color, value);
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
		_this.input.disabled = true;
		if (waving) {
			waving.kill();
		}
		fadeInterface(false);
		speech.stop();
		var t = new TimelineMax();
		t.addSound(speech, a, a.id + 'FunTogether');
		t.addCallback(function () {
			a.fistPump();
			Backend.putAgent({ agent: { type: a.key, tint: a.tint } });
			player.agent = GLOBAL.AGENT[a.key];
			player.tint = a.tint;
		}, 0);
		t.addCallback(function () {
			_this.input.disabled = false;
			_this.state.start(GLOBAL.STATE.garden);
		}, '+=0.5');
	}

	// Add music
	this.add.audio('entryMusic', 0.3, true).play();

	// Add background
	this.add.image(0, 0, 'entryBg');

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
		a.key = key;
		agents.add(a);
	}
	a = null;

	var title = this.add.text(this.world.centerX, 75, LANG.TEXT.pickFriend, fontStyle);
	title.anchor.set(0.5);

	var confirm = this.add.text(this.world.centerX, 75, '', fontStyle);
	confirm.anchor.set(0.5);
	confirm.visible = false;

	var noToAgent = new NumberButton(2, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.centerX - 275,
		y: this.world.centerY*0.5,
		size: 75,
		onClick: cancelAgent
	});
	noToAgent.visible = false;
	this.world.add(noToAgent);

	var yesToAgent = new NumberButton(1, GLOBAL.NUMBER_REPRESENTATION.yesno, {
		x: this.world.centerX + 200,
		y: this.world.centerY*0.5,
		size: 75,
		onClick: chooseAgent
	});
	yesToAgent.visible = false;
	this.world.add(yesToAgent);

	var color = new TextButton(LANG.TEXT.changeColor, {
		x: this.world.centerX,
		y: this.world.height - 75,
		fontSize: 30,
		onClick: function () { a.tint = game.rnd.integerInRange(0x000000, 0xffffff); }
	});
	color.x -= color.width/2;
	color.visible = false;
	this.world.add(color);

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
AgentSetupState.prototype.shutdown = function () {
	if (player.agent.prototype.id !== Panda.prototype.id) {
		this.cache.removeSound(Panda.prototype.id + 'Speech');
		this.cache.removeImage(Panda.prototype.id);
	}
	if (player.agent.prototype.id !== Hedgehog.prototype.id) {
		this.cache.removeSound(Hedgehog.prototype.id + 'Speech');
		this.cache.removeImage(Hedgehog.prototype.id);
	}
	if (player.agent.prototype.id !== Mouse.prototype.id) {
		this.cache.removeSound(Mouse.prototype.id + 'Speech');
		this.cache.removeImage(Mouse.prototype.id);
	}
	
	onShutDown.call(this);
};