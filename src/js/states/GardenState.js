/* The garden */
function GardenState () {}

/* Phaser state function */
GardenState.prototype.preload = function() {
	this.load.audio('gardenSpeech', LANG.SPEECH.garden.speech); // audio sprite sheet

	this.load.image('gardenBg', 'assets/img/garden/bg.png');
};

/* Phaser state function */
GardenState.prototype.create = function () {
	var firstWatering = true;

	this.add.sprite(0, 0, 'gardenBg');
	var speech = this.add.audio('gardenSpeech');
	var markers = LANG.SPEECH.garden.markers;
	for (var marker in markers) {
		speech.addMarker(marker, markers[marker][0], markers[marker][1]);
	}

	// TODO: Remove eventually, for debugging
	this.world.add(new TextButton('>', {
		x: 800,
		y: 100,
		background: 'wood',
		onClick: function () {
			game.state.start(GLOBAL.STATE.chooseScenario, true, false);
		}
	}));

	var rows = 3;
	var columns = 5;
	var startPos = 200;
	var width = this.world.width/columns;
	var height = (this.world.height - startPos)/rows;
	for (var row = 0; row < rows; row++) {
		for (var column = 0; column < columns; column++) {
			this.world.add(new GardenPlant(row + ' ' + column, 0, 0, column*width, startPos+row*height, width, height));
		}
	}

	var agent = new player.agent();
	agent.scale.set(0.2);
	agent.x = -100;
	agent.y = startPos - agent.body.height * agent.scale.y/2;
	this.world.add(agent);
	var currentMove = null;

	this.world.add(new WaterCan(this.game.width - 100, 10));

	this.world.add(new Menu());

	// Move agent when we push a plant.
	Event.subscribe(GLOBAL.EVENT.plantPress, function (plant) {
		var y = plant.y + plant.height/2;
		var x = plant.x;
		if (agent.x > plant.x) { x += plant.width; }
		if (agent.x === x && agent.y === y ) { return; }

		if (currentMove) { currentMove.kill(); }
		currentMove = new TimelineMax();
		// TODO: When agent has better talk animation: currentMove.addSound(speech, agent, 'ok');
		if (agent.y !== y) { currentMove.add(agent.move({ y: y }, Math.abs((agent.y - y)/height))); }
		if (agent.x !== x) { currentMove.add(agent.move({ x: x }, Math.abs((agent.x - x)/width))); }
	});

	// Water plant when we push it.
	Event.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var t;
		if (player.water > 0) {
			var side = ((plant.x + plant.width) <= agent.x) ? -1 : 1;
			t = agent.water(2, side);
			t.addCallback(function () {
				player.water--;
				plant.water.value++;
				say(speech, agent).play('growing');
			}, 'watering');
			if (plant.water.left === 1 && plant.level.left === 1) {
				t.addSound(speech, agent, 'fullGrown');
			}
			if (firstWatering && player.water > 1) {
				firstWatering = false;
				t.addSound(speech, agent, 'waterLeft');
			}
		} else {
			t = new TimelineMax();
			t.addSound(speech, agent, 'waterEmpty');
		}
		t.addCallback(function () { game.input.disabled = true; }, 0);
		t.addCallback(function () {
			plant.waterButton.frame = 0;
			game.input.disabled = false;
		});
		if (currentMove && currentMove.progress() < 1) {
			currentMove.add(t);
		}
	});


	/* When the state starts: */
	var t = new TimelineMax();
	t.add(agent.move({ x: this.world.centerX }, 3));
	/*
	if (player.water > 0) {
		// TODO: if (anything grows) {
			t.addSound(speech, agent, 'whereTo');
		// } else {
			t.addSound(speech, agent, 'haveWater');
		// }
	} else {
		// TODO: if (anything grows) {
			t.addSound(speech, agent, 'welcomeBack'); // TODO: Perhaps a welcome back?
		// } else {
			t.addSound(speech, agent, 'intro');
		// }
		t.addSound(speech, agent, 'ready');
	}
	*/
};

/* Phaser state function */
GardenState.prototype.shutdown = onShutDown;


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Garden objects                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

GardenPlant.prototype = Object.create(Phaser.Group.prototype);
GardenPlant.prototype.constructor = GardenPlant;
function GardenPlant (id, level, water, x, y, width, height) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var _this = this;
	this.plantId = id;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	/* TODO: Replace with actual plant. */
	var bmd = game.add.bitmapData(this.width, this.height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.globalAlpha = 0.2;
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	var plant = game.add.sprite(0, 0, bmd, null, this);
	plant.inputEnabled = true;
	plant.events.onInputDown.add(this.down, this);

	// this.water = new Counter(level+1, true, water); // For plant leveling
	this.water = new Counter(1, true, water);
	this.level = new Counter(3, false, level);
	this.level.onAdd = function (current) {
		TweenMax.to(plant, 2, {
			tint:
				current === 1 ? 0x00ffff :
				current === 2 ? 0xff00ff :
				current === 3 ? 0xffff00 :
				0xffffff,
			onComplete: function () { _this.water.update(); }
		});
	};

	return this;
}

GardenPlant.prototype.down = function () {
	var _this = this; // Events do not have access to this
	if (this.active) {
		Event.publish(GLOBAL.EVENT.plantPress, [this]);
		return;
	}

	if (!this.infoGroup) {
		// TODO: A lot of hard coded values here dude...
		this.infoGroup = game.add.group(this);
		this.infoGroup.x = 0;
		this.infoGroup.y = -100;
		this.infoGroup.visible = false;

		var bmd = game.add.bitmapData(this.width, 100);
		bmd.ctx.fillStyle = '#ffffff';
		bmd.ctx.globalAlpha = 0.5;
		bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
		game.add.sprite(0, 0, bmd, null, this.infoGroup).inputEnabled = true;

		this.waterButton = game.add.sprite(this.width - 90, 10, 'wood', null, this.infoGroup);
		this.waterButton.width = 80;
		this.waterButton.height = 80;
		this.waterButton.inputEnabled = true;
		this.waterButton.events.onInputDown.add(function () {
			if (this.waterButton.frame === 0) {
				// Water is added to the plant when animation runs.
				this.waterButton.frame = 1;
				Event.publish(GLOBAL.EVENT.waterPlant, [this]);
			}
		}, this);

		/* Water management */
		var waterGroup = game.add.group(this.infoGroup);
		this.water.onAdd = function (current, left) {
			waterGroup.removeAll(true);
			for (var i = 0; i < (current + left); i++) {
				game.add.sprite(5 + i*36, 15, 'drop', (i >= current ? 1 : 0), waterGroup);
			}
		};
		this.water.onMax = function () {
			_this.level.value++;
			//_this.water.max = _this.level.value + 1;  // For plant leveling
			if (_this.level.value === _this.level.max) {
				_this.water.onAdd = null;
				_this.water.onMax = null;
				waterGroup.removeAll(true);
				_this.waterButton.destroy();
				game.add.text(_this.width/2, 50, LANG.TEXT.maxLevel, {
					font: '60pt ' +  GLOBAL.FONT,
					fill: '#5555ff'
				}, _this.infoGroup).anchor.set(0.5);
			}
		};
		this.water.update();
	}

	fade(this.infoGroup, true, 0.2);

	Event.publish(GLOBAL.EVENT.plantPress, [this]);
	this.active = Event.subscribe(GLOBAL.EVENT.plantPress, function () {
		_this.waterButton.frame = 0;
		_this.hide();
	});
};

GardenPlant.prototype.hide = function () {
	Event.unsubscribe(this.active);
	this.active = null;
	fade(this.infoGroup, false, 0.2);
};