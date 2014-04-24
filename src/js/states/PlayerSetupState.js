/* The menu for choosing agent, */
function PlayerSetupState () {}

/* Phaser state function */
PlayerSetupState.prototype.create = function () {
	var _this = this;
	var spacing = 450;
	var centerY = this.world.centerY;
	var centerX = this.world.centerX;
	var current = 0;
	var scale = 0.3;
	var scaleActive = 0.5;

	this.add.image(0, 0, 'entryBg');

	var agents = this.add.group();
	var i = 0;
	for (var key in GLOBAL.AGENT) {
		var a = new GLOBAL.AGENT[key]();
		a.x = centerX + spacing * i;
		a.y = centerY;
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

		_this.add.tween(agents.children[current].scale).to({ x: scale, y: scale }, 500, null, true);
		_this.add.tween(agents).to({ x: -(pos * spacing) }, 500, Phaser.Easing.Quadratic.Out, true);
		_this.add.tween(a.scale).to({ x: scaleActive, y: scaleActive }, 500, null, true);
		current = pos;
	}

	this.world.add(new Menu());

	_this.add.tween(agents.children[current].scale).to({ x: scaleActive, y: scaleActive }, 500, null, true);
};