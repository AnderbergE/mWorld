/* The menu for choosing agent, */
function PlayerSetupState () {}

/* Phaser state function */
PlayerSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var current = 0;
	var scale = 0.3;
	var scaleActive = 0.5;
	var slideTime = 1000;
	var fontStyle = {
		font: '50pt The Girl Next Door',
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	};

	this.add.image(0, 0, 'entryBg');
	this.add.text(this.world.centerX, 75, GLOBAL.TEXT.pickFriend, fontStyle).anchor.setTo(0.5);

	var agents = this.add.group();
	var i = 0;
	for (var key in GLOBAL.AGENT) {
		var a = new GLOBAL.AGENT[key]();
		this.add.text(0, -(a.body.height/2) - 50, a.name, fontStyle, a).anchor.setTo(0.5);
		a.x = this.world.centerX + spacing * i;
		a.y = this.world.centerY + 50;
		a.scale.x = scale;
		a.scale.y = scale;
		a.body.inputEnabled = true;
		a.body.events.onInputDown.add(clickAgent, a);
		agents.add(a);
		i++;
	}

	function clickAgent () {
		var a = this;
		var pos = agents.children.indexOf(a);
		if (pos === current) {
			a.happy(1000).start().onComplete.add(function () {
				_this.state.start(GLOBAL.STATE.garden);
			});
			return;
		}

		/* Move the agent group to get the sliding effect on all agents */
		_this.add.tween(agents).to({ x: -(pos * spacing) }, slideTime, Phaser.Easing.Quadratic.Out, true);
		_this.add.tween(agents.children[current].scale).to({ x: scale, y: scale }, slideTime, null, true);
		_this.add.tween(a.scale).to({ x: scaleActive, y: scaleActive }, slideTime, null, true);
		current = pos;
	}

	this.world.add(new Menu());

	_this.add.tween(agents.children[current].scale).to({ x: scaleActive, y: scaleActive }, slideTime/2, null, true);
};