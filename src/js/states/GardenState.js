/* The garden */
function GardenState () {}

/* Phaser state function */
GardenState.prototype.preload = function() {
	this.load.audio('gardenSpeech', LANG.SPEECH.garden.speech); // audio sprite sheet

	this.load.atlasJSONHash('garden', 'assets/img/garden/atlas.png', 'assets/img/garden/atlas.json');
	this.load.image('gardenBg', 'assets/img/garden/bg.png');

	this.gardenData = Backend.getGarden() || { fields: [] };
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
			game.state.start(GLOBAL.STATE.debug, true, false);
		}
	}));

	var rows = 3;
	var columns = 5;
	var startPos = 200;
	var width = this.world.width/columns;
	var height = (this.world.height - startPos)/rows;
	var type, level, water, i;
	var fields = this.gardenData.fields;
	for (var row = 0; row < rows; row++) {
		for (var column = 0; column < columns; column++) {
			type = 1;
			level = 0;
			water = 0;

			for (i = 0; i < fields.length; i++) {
				if (fields[i].x === column &&
					fields[i].y === row) {
					/*jshint camelcase:false */
					type = fields[i].content_type || type;
					/*jshint camelcase:true */
					level = fields[i].level || level;
					break;
				}
			}

			this.world.add(new GardenPlant(column, row, column*width, startPos+row*height, width, height, type, level, water));
		}
	}

	var agent = player.createAgent();
	agent.scale.set(0.2);
	agent.x = -100;
	agent.y = startPos - agent.body.height * agent.scale.y/2;
	this.world.add(agent);
	var currentMove = null;

	this.world.add(new WaterCan(this.game.width - 100, 10));

	this.world.add(new Menu());

	// Move agent when we push a plant.
	EventSystem.subscribe(GLOBAL.EVENT.plantPress, function (plant) {
		var y = plant.y + plant.plantHeight - agent.height/2;
		var x = plant.x;
		if (agent.x > x) { x += plant.width; }
		if (agent.x === x && agent.y === y ) { return; }

		if (currentMove) { currentMove.kill(); }

		currentMove = new TimelineMax();
		if (agent.x !== x && agent.x % width > 10) {
			var move = agent.x + (agent.x > x ? -agent.x % width : width - agent.x % width) ;
			currentMove.add(agent.move({ x: move }, Math.abs((agent.x - move)/width)));
		}
		if (agent.y !== y) { currentMove.add(agent.move({ y: y }, Math.abs((agent.y - y)/height))); }
		if (agent.x !== x) { currentMove.add(agent.move({ x: x }, Math.abs((agent.x - x)/width))); }
		currentMove.addSound(speech, agent, 'ok', 0);
	});

	// Water plant when we push it.
	EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var t;
		if (player.water > 0) {
			var side = ((plant.x + plant.width) <= agent.x) ? -1 : 1;
			t = agent.water(2, side);
			t.addCallback(function () {
				player.water--;
				plant.water.value++;
				agent.say(speech).play('growing');
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

		t.addCallback(function () { game.input.disabled = true; }, 0); // at start
		t.addCallback(function () {
			plant.waterButton.frame = 0;
			game.input.disabled = false;
		}); // at end

		if (currentMove && currentMove.progress() < 1) {
			currentMove.add(t);
		}
	});

	// Check that backend accepts plant upgrade
	EventSystem.subscribe(GLOBAL.EVENT.plantUpgrade, function (data) {
		/*jshint camelcase:false */
		if (data.remaining_water !== player.water) {
			player.water = data.remaining_water;
		}
		/*jshint camelcase:true */
	});


	/* When the state starts: */
	var t = new TimelineMax();
	t.add(agent.move({ x: this.world.centerX }, 3));
	/*
	if (player.water > 0) {
		if (anything grows) { // TODO
			t.addSound(speech, agent, 'whereTo');
		} else {
			t.addSound(speech, agent, 'haveWater');
		}
	} else {
		if (anything grows) { // TODO
			t.addSound(speech, agent, 'welcomeBack'); // TODO: Perhaps a welcome back?
		} else {
			t.addSound(speech, agent, 'intro');
		}
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
function GardenPlant (column, row, x, y, width, height, type, level, water) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var _this = this;
	this.column = column;
	this.row = row;
	this.x = x;
	this.y = y;
	this.plantHeight = height;

	/* TODO: Replace with actual plant. */
	var bmd = game.add.bitmapData(width, height);
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.globalAlpha = 0.2;
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	var trigger = this.create(0, 0, bmd);
	trigger.inputEnabled = true;
	trigger.events.onInputDown.add(this.down, this);

	this.type = type;
	var plant = null;

	// this.water = new Counter(level+1, true, water); // For plant leveling
	this.water = new Counter(1, true, water);

	this.level = new Counter(5, false, level);
	this.level.onAdd = function (current, diff) {
		if (current <= 0) {
			if (plant) { plant.destroy(); }
			return;
		}

		var newPlant = _this.create(width/2, height/2, 'garden', 'plant' + _this.type + '-' + current);
		newPlant.anchor.set(0.5);
		newPlant.scale.set(0.5); // TODO: We should not scale this, use better graphics.

		if (diff > 0) {
			// Plant has leveled up by watering.
			newPlant.alpha = 0;

			TweenMax.to(newPlant, 2, {
				alpha: 1,
				onComplete: function () {
					_this.water.update();
					if (plant) { plant.destroy(); }
					plant = newPlant;
				}
			});

			/*jshint camelcase:false */
			Backend.putUpgradePlant({ field: { x: x, y: y, level: level, content_type: type }});
			/*jshint camelcase:true */

		} else {
			// Could be: Setup of plant from constructor
			// Could be: Backend says that water is missing
			if (plant) { plant.destroy(); }
			plant = newPlant;
		}
	};
	this.level.update();

	// Check that backend accepts plant upgrade
	EventSystem.subscribe(GLOBAL.EVENT.plantUpgrade, function (data) {
		if (!data.success && data.field.x === _this.column && data.field.y === _this.row) {
			_this.level = data.field.level;
		}
	});

	return this;
}

GardenPlant.prototype.down = function () {
	var _this = this; // Events do not have access to this
	if (this.active) {
		EventSystem.publish(GLOBAL.EVENT.plantPress, [this]);
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
				EventSystem.publish(GLOBAL.EVENT.waterPlant, [this]);
			}
		}, this);

		/* Water management */
		var maxLevel = function () {
			_this.waterButton.destroy();
			game.add.text(_this.width/2, 50, LANG.TEXT.maxLevel, {
				font: '60pt ' +  GLOBAL.FONT,
				fill: '#5555ff'
			}, _this.infoGroup).anchor.set(0.5);
		};

		if (this.level.left > 0) {
			var waterGroup = game.add.group(this.infoGroup);
			this.water.onAdd = function (current, diff, left) {
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
					maxLevel();
				}
			};
			this.water.update();
		} else {
			maxLevel();
		}
	}

	fade(this.infoGroup, true, 0.2);

	EventSystem.publish(GLOBAL.EVENT.plantPress, [this]);
	this.active = EventSystem.subscribe(GLOBAL.EVENT.plantPress, function () {
		_this.waterButton.frame = 0;
		_this.hide();
	});
};

GardenPlant.prototype.hide = function () {
	EventSystem.unsubscribe(this.active);
	this.active = null;
	fade(this.infoGroup, false, 0.2);
};