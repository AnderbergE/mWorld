/* The menu for choosing agent, */
function PlayerSetupState () {}

/* Phaser state function */
PlayerSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var current = 0;
	var scale = { x: 0.3, y: 0.3 };
	var scaleActive = { x: 0.5, y: 0.5 };
	var slideTime = 1;
	var fontStyle = {
		font: '50pt The Girl Next Door',
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	};

	this.add.image(0, 0, 'entryBg');
	this.add.text(this.world.centerX, 75, GLOBAL.TEXT.pickFriend, fontStyle).anchor.set(0.5);

	var agents = this.add.group();
	var i = 0;
	for (var key in GLOBAL.AGENT) {
		var a = new GLOBAL.AGENT[key]();
		this.add.text(0, -(a.body.height/2) - 50, a.name, fontStyle, a).anchor.set(0.5);
		a.x = this.world.centerX + spacing * i;
		a.y = this.world.centerY + 50;
		a.scale.x = scale.x;
		a.scale.y = scale.y;
		a.body.inputEnabled = true;
		a.body.events.onInputDown.add(clickAgent, a);
		agents.add(a);
		i++;
	}

	function clickAgent () {
		var a = this;
		var pos = agents.children.indexOf(a);
		if (pos === current) {
			a.fistPump()
				.addCallback(function () { _this.state.start(GLOBAL.STATE.garden); });
			return;
		}

		/* Move the agent group to get the sliding effect on all agents */
		TweenMax.to(agents, slideTime, { x: -(pos * spacing), ease: Power2.easeOut });
		TweenMax.to(agents.children[current].scale, slideTime, scale);
		TweenMax.to(a.scale, slideTime, scaleActive);
		current = pos;
	}

	this.world.add(new Menu());

	TweenMax.to(agents.children[current].scale, slideTime/2, scaleActive);
};

/* Phaser state function */
Subgame.prototype.shutdown = onShutDown;