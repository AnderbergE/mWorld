/**
 * The garden of the game.
 * This is where the player uses the water from the sessions.
 */
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
	this.add.sprite(0, 0, 'gardenBg');
	var speech = createAudioSheet('gardenSpeech', LANG.SPEECH.garden.markers);

	// TODO: Remove eventually, for debugging
	this.world.add(new TextButton('D', {
		x: 700,
		y: 100,
		doNotAdapt: true,
		onClick: function () {
			game.state.start(GLOBAL.STATE.debug, true, false);
		}
	}));

	// TODO: Update graphics
	var sure = false;
	this.world.add(new TextButton('>', {
		x: 800,
		y: 100,
		doNotAdapt: true,
		onClick: function () {
			if (player.water > player.maxWater - 6 && !sure) {
				agent.say(speech, 'ok').play('ok'); // TODO: Are you sure? If so, press again.
				sure = true;
				var sub = EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function () {
					sure = false;
					EventSystem.unsubscribe(sub);
				});
			} else {
				var scen = Backend.getScenario();
				if (scen) {
					var t = new TimelineMax();
					t.addSound(speech, agent, 'ok'); // TODO: Let's go!
					t.addCallback(function () {
						game.state.start(GLOBAL.STATE[scen.subgame], true, false, scen);
					});
				}
			}
		}
	}));

	/* Setup the garden fields */
	var rows = 3;
	var columns = 8;
	var startPos = 200;
	var width = this.world.width/columns;
	var height = (this.world.height - startPos)/rows;
	var type, level, water, i;
	var fields = this.gardenData.fields;
	for (var row = 0; row < rows; row++) {
		for (var column = 0; column < columns; column++) {
			type = this.rnd.integerInRange(1, 3);
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

	/* Add the garden agent */
	var agent = player.createAgent();
	agent.scale.set(0.2);
	agent.x = -100;
	agent.y = startPos - agent.body.height * agent.scale.y/2;
	this.world.add(agent);
	var currentMove = null;

	/* Add the water can */
	this.world.add(new WaterCan(this.game.width - 100, 10));
	var firstWatering = true;

	/* Add disabler. */
	var disabler = new Cover('#ffffff', 0);
	disabler.visible = false;
	this.world.add(disabler);

	/* Add the menu */
	this.world.add(new Menu());


	/* Move agent when we push a plant. */
	EventSystem.subscribe(GLOBAL.EVENT.plantPress, function (plant) {
		var y = plant.y + plant.plantHeight - agent.height/2;
		var x = plant.x;
		if (agent.x > x) {
			x += plant.width * 1.3;
		} else {
			x -= plant.width * 0.3;
		}
		if (agent.x === x && agent.y === y ) {
			return;
		}

		if (currentMove) {
			currentMove.kill();
		}

		currentMove = new TimelineMax();
		if (agent.x !== x && agent.x % width > 10 && agent.y !== y) {
			var move = agent.x + (agent.x > x ? -agent.x % width : width - agent.x % width) ;
			currentMove.add(agent.move({ x: move }, Math.abs((agent.x - move)/width)));
		}
		if (agent.y !== y) {
			currentMove.add(agent.move({ y: y }, Math.abs((agent.y - y)/height)));
		}
		if (agent.x !== x) {
			currentMove.add(agent.move({ x: x }, Math.abs((agent.x - x)/width)));
		}
		currentMove.addSound(speech, agent, 'ok', 0);
	});

	/* Water plant when we push it. */
	EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var t;
		if (player.water > 0) {
			var side = ((plant.x + plant.width/3) <= agent.x) ? -1 : 1;
			t = agent.water(2, side);
			t.addCallback(function () {
				player.water--;
				plant.water.value++;
				agent.say(speech, 'growing').play('growing');
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

		t.addCallback(function () { disabler.visible = true; }, 0); // at start
		t.addCallback(function () {
			plant.waterButton.reset();
			disabler.visible = false;
		}); // at end

		if (currentMove && currentMove.progress() < 1) {
			currentMove.add(t);
		}
	});

	/* Check that backend accepts plant upgrade */
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
		if (this.gardenData.fields.length > 0) {
			t.addSound(speech, agent, 'whereTo');
		} else {
			t.addSound(speech, agent, 'haveWater');
		}
	} else {
		if (this.gardenData.fields.length > 0) {
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

/**
 * A garden plant/field.
 * It will level up depending on how much you water it.
 * @param {number} column - The column position of the plant (for server).
 * @param {number} row - The row position of the plant (for server).
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} width - The width.
 * @param {number} height - The height.
 * @param {number} type - The type of plant.
 * @param {number} level - The level of the plant.
 * @param {number} water - The amount of water the plant has.
 */
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

	/* The pushable area of the field */
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

			/* Check that backend accepts plant upgrade */
			var ev = EventSystem.subscribe(GLOBAL.EVENT.plantUpgrade, function (data) {
				if (!data.success && data.field.x === _this.column && data.field.y === _this.row) {
					_this.level.value = data.field.level;
				}
				EventSystem.unsubscribe(ev);
			});

			/* Upgrade plant animation, ending with sending to backend. */
			TweenMax.to(newPlant, 2, {
				alpha: 1,
				onComplete: function () {
					_this.water.update();
					if (plant) { plant.destroy(); }
					plant = newPlant;

				/*jshint camelcase:false */
				Backend.putUpgradePlant({ field: { x: column, y: row, level: this.value, content_type: type }});
				/*jshint camelcase:true */
				}
			});

		} else {
			// Could be: Setup of plant from constructor
			// Could be: Backend says that water is missing
			if (plant) { plant.destroy(); }
			plant = newPlant;
		}
	};
	this.level.update();

	return this;
}

/**
 * When pushing on a garden plant.
 * Publishes plantPress event.
 * Publishes waterPlant when waterButton is pushed.
 */
GardenPlant.prototype.down = function () {
	var _this = this; // Events do not have access to this

	/* If this plant is active, it means that it is already showing only publish plantPress */
	if (this.active) {
		EventSystem.publish(GLOBAL.EVENT.plantPress, [this]);
		return;
	}

	/* The interface for the plant is set up when needed. */
	if (!this.infoGroup) {
		var height = 100;
		this.infoGroup = game.add.group(this);
		this.infoGroup.x = 0;
		this.infoGroup.y = -height;
		this.infoGroup.visible = false;

		var bmd = game.add.bitmapData(this.width, height);
		bmd.ctx.fillStyle = '#ffffff';
		bmd.ctx.globalAlpha = 0.5;
		bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
		game.add.sprite(0, 0, bmd, null, this.infoGroup).inputEnabled = true;

		/* The button to push when adding water. */
		this.waterButton = new SpriteButton('watercan', null, {
			x: this.width - (height - 15),
			y: 10,
			size: height - 20,
			keepDown: true,
			onClick: function () {
				/* Water is added to the plant when animation runs. */
				EventSystem.publish(GLOBAL.EVENT.waterPlant, [_this]);
			}
		});
		this.infoGroup.add(this.waterButton);

		/* Water management */
		var maxLevel = function () {
			_this.waterButton.destroy();
			game.add.text(_this.width/2, height/2, LANG.TEXT.maxLevel, {
				font: '40pt ' +  GLOBAL.FONT,
				fill: '#5555ff'
			}, _this.infoGroup).anchor.set(0.5);
		};

		/* Check if this plant can be upgraded more. */
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

	/* Publish plantPress to hide other possible active plant interfaces. */
	EventSystem.publish(GLOBAL.EVENT.plantPress, [this]);

	/* Subscribe to plantPress to hide this plant interface when applicable. */
	this.active = EventSystem.subscribe(GLOBAL.EVENT.plantPress, function () {
		_this.waterButton.reset();
		_this.hide();
	});
};

/**
 * Hide the plant interface
 */
GardenPlant.prototype.hide = function () {
	EventSystem.unsubscribe(this.active);
	this.active = null;
	fade(this.infoGroup, false, 0.2);
};