var SuperState = require('./SuperState.js');
var backend = require('../backend.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var util = require('../utils.js');
var Counter = require('../objects/Counter.js');
var Cover = require('../objects/Cover.js');
var Menu = require('../objects/Menu.js');
var WaterCan = require('../objects/WaterCan.js');
var SpriteButton = require('../objects/buttons/SpriteButton.js');

module.exports = GardenState;

GardenState.prototype = Object.create(SuperState.prototype);
GardenState.prototype.constructor = GardenState;

/**
 * The garden of the game.
 * This is where the player uses the water from the sessions.
 */
function GardenState () {}

/* Phaser state function */
GardenState.prototype.preload = function() {
	if (!this.cache._sounds[this.game.player.agent.prototype.id + 'Speech']) {
		this.load.audio(this.game.player.agent.prototype.id + 'Speech', LANG.SPEECH.AGENT.speech);
	}
	if (!this.cache._sounds.gardenMusic) {
		this.load.audio('gardenMusic', ['audio/garden/music.m4a', 'audio/garden/music.ogg', 'audio/garden/music.mp3']);
	}
	if (!this.cache._images.garden) {
		this.load.atlasJSONHash('garden', 'img/garden/atlas.png', 'img/garden/atlas.json');
	}

	this.gardenData = backend.getGarden() || { fields: [] };
};

/* Phaser state function */
GardenState.prototype.create = function () {
	// Add music
	this.add.audio('gardenMusic', 0.2, true).play();

	// Add background
	this.add.sprite(0, 0, 'garden', 'bg');

	// Add sign to go to next scenario
	var sure = false;
	var sign = this.add.sprite(750, 100, 'garden', 'sign');
	sign.inputEnabled = true;
	sign.events.onInputDown.add(function () {
		// This happens either on local machine or on "trial" version of the game.
		if (typeof Routes === 'undefined' || Routes === null) {
			this.game.state.start(GLOBAL.STATE.scenario, true, false);
			return;
		}

		var t = new TimelineMax();
		t.addCallback(function () {
			disabler.visible = true;
		});
		if (this.game.player.water > this.game.player.maxWater - 3 && !sure) {
			t.addSound(agent.speech, agent, 'gardenWaterFirst');
			sure = true;
			var sub = EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function () {
				sure = false;
				EventSystem.unsubscribe(sub);
			});
		} else {
			var scen = backend.getScenario();
			if (scen) {
				t.addSound(agent.speech, agent, 'letsGo');
				t.addCallback(function () {
					this.game.state.start(GLOBAL.STATE[scen.subgame], true, false, scen);
				});
			}
		}
		t.addCallback(function () {
			disabler.visible = false;
		});
	}, this);

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
			type = this.rnd.integerInRange(1, 5);
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

			this.world.add(new GardenPlant(this.game, column, row, column*width, startPos+row*height, width, height, type, level, water));
		}
	}

	/* Add the garden agent */
	var agent = this.game.player.createAgent();
	agent.scale.set(0.2);
	agent.x = -100;
	agent.y = startPos + height - agent.height/2;
	this.world.add(agent);
	var currentMove = null;

	/* Add the water can */
	this.world.add(new WaterCan(this.game));
	var firstWatering = true;

	/* Add disabler. */
	var disabler = new Cover(this.game, '#ffffff', 0);
	this.world.add(disabler);

	/* Add the menu */
	this.world.add(new Menu(this.game));


	/* Move agent when we push a plant. */
	var _this = this;
	EventSystem.subscribe(GLOBAL.EVENT.plantPress, function (plant) {
		var y = plant.y + plant.plantHeight - agent.height/2;
		var x = plant.x;
		// If this is changed: update the side variable in the waterPlant subscription.
		var side = -plant.width * 0.3;
		if (agent.x > x) {
			x += plant.width;
			side *= -1;
		}
		if (agent.x === x && agent.y === y ) {
			return;
		}

		if (currentMove) {
			currentMove.kill();
		}

		currentMove = new TimelineMax();
		var distance = agent.x - x;
		if (agent.y !== y) {
			if (agent.y % (plant.plantHeight - agent.height/2) < 10) {
				distance = 0;
				currentMove.add(agent.move({ x: x }, Math.abs((agent.x - x)/width)));
			}
			currentMove.add(agent.move({ y: y }, Math.abs((agent.y - y)/height)));
		}
		if (agent.x !== x + side || agent.y !== y) {
			currentMove.add(agent.move({ x: x + side }, Math.abs((distance + side)/width)));
		}
		currentMove.addSound(agent.speech, agent, 'ok' + _this.game.rnd.integerInRange(1, 2), 0);
	});

	/* Water plant when we push it. */
	EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var t;
		if (_this.game.player.water > 0) {
			var side = ((plant.x + plant.width/3) <= agent.x) ? -1 : 1;
			t = agent.water(2, side);
			t.addCallback(function () {
				_this.game.player.water--;
				plant.water.value++;
				agent.say(agent.speech, 'gardenGrowing').play('gardenGrowing');
			}, 'watering');
			if (plant.water.left === 1 && plant.level.left === 1) {
				t.addSound(agent.speech, agent, 'gardenFullGrown');
			}
			if (firstWatering && _this.game.player.water > 1) {
				firstWatering = false;
				t.addSound(agent.speech, agent, 'gardenWaterLeft');
			}
		} else {
			t = new TimelineMax();
			t.addSound(agent.speech, agent, 'gardenEmptyCan');
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
		if (data.remaining_water !== _this.game.player.water) {
			_this.game.player.water = data.remaining_water;
		}
		/*jshint camelcase:true */
	});


	/* When the state starts */
	var t = new TimelineMax().skippable();
	t.add(agent.move({ x: this.world.centerX }, 3));

	if (this.game.player.water > 0) {
		if (this.gardenData.fields.length > 0) {
			t.addSound(agent.speech, agent, 'gardenWhereNow');
		} else {
			t.addSound(agent.speech, agent, 'gardenHaveWater');
			t.addSound(agent.speech, agent, 'gardenPushField', '+=0.5');
		}
	} else {
		if (this.gardenData.fields.length > 0) {
			t.addSound(agent.speech, agent, 'gardenYoureBack');
		} else {
			var w = new WaterCan(this.game);
			w.visible = false;
			this.world.add(w);

			t.addSound(agent.speech, agent, 'gardenIntro');
			t.addLabel('myCan', '+=0.5');
			t.addCallback(function () {
				w.x = agent.x - w.width/4; // Since we scale to 0.5
				w.y = agent.y;
				w.scale.set(0);
				w.visible = true;
				agent.eyesFollowObject(w);
			});
			t.add(new TweenMax(w.scale, 1, { x: 0.5, y: 0.5, ease: Elastic.easeOut }), 'myCan');
			t.addSound(agent.speech, agent, 'gardenMyCan', 'myCan');
			t.add(new TweenMax(w.scale, 1, { x: 0, y: 0, ease: Elastic.easeOut, onComplete: w.destroy, onCompleteScope: w }));
		}
		t.addLabel('sign');
		t.add(agent.wave(1, 1));
		t.addCallback(agent.eyesFollowObject, 'sign', [sign], agent);
		t.addSound(agent.speech, agent, 'gardenSign', 'sign');
	}
	t.addCallback(function () {
		agent.eyesStopFollow();
		disabler.visible = false;
	});
};


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
function GardenPlant (game, column, row, x, y, width, height, type, level, water) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var _this = this;
	var maxLevel = 5;
	this.column = column;
	this.row = row;
	this.x = x;
	this.y = y;
	this.plantHeight = height;

	/* The pushable area of the field */
	var bmd = game.add.bitmapData(width, height);
	bmd.ctx.globalAlpha = 0;
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	var trigger = this.create(0, 0, bmd);
	trigger.inputEnabled = true;
	trigger.events.onInputDown.add(this.down, this);

	if (level !== maxLevel) {
		var hl = game.add.bitmapData(width - 6, height * 0.6);
		hl.ctx.fillStyle = '#6b3e09';
		hl.ctx.globalAlpha = 0.2;
		hl.ctx.roundRect(0, 0, hl.width, hl.height, 10).fill();
		this.highlight = this.create(3, height * 0.4, hl);
	}

	this.type = type;
	var plant = null;

	this.water = new Counter(1, true, water);

	this.level = new Counter(maxLevel, false, level);
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
				backend.putUpgradePlant({ field: { x: column, y: row, level: this.value, content_type: type }});
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
		this.infoGroup = this.game.add.group(this);
		this.infoGroup.x = 0;
		this.infoGroup.y = -height;
		this.infoGroup.visible = false;

		var bmd = this.game.add.bitmapData(this.width, height);
		bmd.ctx.fillStyle = '#ffffff';
		bmd.ctx.globalAlpha = 0.5;
		bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
		this.game.add.sprite(0, 0, bmd, null, this.infoGroup).inputEnabled = true;

		/* The button to push when adding water. */
		this.waterButton = new SpriteButton(this.game, 'objects', 'watering_can', {
			x: this.width/2 - (height - 20)/2,
			y: 10,
			size: height - 20,
			keepDown: true,
			onClick: function () {
				/* Water is added to the plant when animation runs. */
				EventSystem.publish(GLOBAL.EVENT.waterPlant, [_this]);
			}
		});
		this.waterButton.sprite.tint = 0xbb3333;
		this.infoGroup.add(this.waterButton);

		/* Water management */
		var maxLevel = function () {
			_this.waterButton.destroy();
			_this.highlight.destroy();
			_this.game.add.text(_this.width/2, height/2, LANG.TEXT.maxLevel, {
				font: '40pt ' +  GLOBAL.FONT,
				fill: '#5555ff'
			}, _this.infoGroup).anchor.set(0.5);
		};

		/* Check if this plant can be upgraded more. */
		if (this.level.left > 0) {
			this.water.onMax = function () {
				_this.level.value++;
				if (_this.level.value === _this.level.max) {
					_this.water.onMax = null;
					maxLevel();
				}
			};
			this.water.update();
		} else {
			maxLevel();
		}
	}


	util.fade(this.infoGroup, true, 0.2);

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
	util.fade(this.infoGroup, false, 0.2);
};