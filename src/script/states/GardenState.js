var SuperState = require('./SuperState.js');
var backend = require('../backend.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var util = require('../utils.js');
var AStar = require('../objects/AStar.js');
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
	if (!this.cache.checkSoundKey(this.game.player.agent.prototype.id + 'Speech')) {
		this.load.audio(this.game.player.agent.prototype.id + 'Speech', LANG.SPEECH.AGENT.speech);
	}
	if (!this.cache.checkSoundKey('gardenMusic')) {
		this.load.audio('gardenMusic', ['audio/garden/music.m4a', 'audio/garden/music.ogg', 'audio/garden/music.mp3']);
	}
	if (!this.cache.checkImageKey('garden')) {
		this.load.atlasJSONHash('garden', 'img/garden/atlas.png', 'img/garden/atlas.json');
	}

	this.gardenData = backend.getGarden() || { fields: [] };
};

/* Phaser state function */
GardenState.prototype.create = function () {
	// Add music
	this.add.music('gardenMusic', 0.2, true).play();

	// Add background
	this.add.sprite(0, 0, 'garden', 'bg');

	// Add sign to go to next scenario
	var sure = false;
	var sign = this.add.sprite(750, 100, 'garden', 'sign');
	sign.inputEnabled = true;
	sign.events.onInputDown.add(function () {
		// This happens either on local machine or on "trial" version of the game.
		if (GLOBAL.demo) {
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
				}, null, null, this);
			}
		}
		t.addCallback(function () {
			disabler.visible = false;
		});
	}, this);

	var callParty = this.game.rnd.between(1, 100);
	var partySign = this.add.sprite(120, 100, 'garden', 'partysign');
	if (callParty <= 100) {

		partySign.visible = true;
		partySign.inputEnabled = true;
	}
	else {

		partySign.visible = false;
	}
	partySign.events.onInputDown.add(function () {
		this.game.state.start(GLOBAL.STATE.partyInvitationGame);
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
			type = this.rnd.integerInRange(1, 13);
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

	var grid = new Array(rows);
	for (i = 0; i < grid.length; i++) {
		grid[i] = new Array(columns);
	}
	var path = new AStar(grid);

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
		var x = Math.floor(agent.x / width);
		var y = Math.floor((agent.y - startPos) / height);
		var toX = Math.floor(plant.x / width);
		var toY = Math.floor((plant.y - startPos) / height);

		// If the path is simply to the left, don't do anything.
		if (toX === x - 1 && y === toY) {
			return;
		}

		var p = path.find(x, y, toX, toY);

		// Don't do anything if there is no path.
		if (p.length < 1) {
			return;
		}

		if (currentMove) {
			currentMove.kill();
		}

		currentMove = new TimelineMax();

		var dx, dy, move;
		for (var i = 1; i < p.length; i++) {
			dx = p[i].x - p[i - 1].x;
			dy = p[i].y - p[i - 1].y;

			move = { y: startPos + (p[i].y + 0.5) * height };

			// Only add x movement when moving in x direction.
			// Otherwise it might switch sides on vertical movements.
			if (dx !== 0) {
				// -dx is left.
				move.x = p[i].x * width + (dx < 0 ? 1 : 0) * width;
			}
			currentMove.add(agent.move(move, (Math.abs(dx) + Math.abs(dy)) * 0.4));
		}

		// Say something about the move.
		currentMove.addCallback(function () {
			var marker = 'ok' + _this.game.rnd.integerInRange(1, 2);
			agent.say(agent.speech, marker).play(marker);
		}, 0);
	});

	/* Water plant when we push it. */
	EventSystem.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var t = new TimelineMax();
		if (_this.game.player.water > 0) {
			var side = ((plant.x + plant.width/2) <= agent.x) ? -1 : 1; // Side to water towards.
			t.add(agent.move({ x: (side < 0 ? '+' : '-') + '=' + (agent.leftArm.width * agent.scale.x + 20) }, 0.2));
			t.add(agent.water(2, side));
			t.addCallback(function () {
				_this.game.player.water--;
				plant.water.value++;
			});
			t.addSound(agent.speech, agent, 'gardenGrowing');

			if (plant.water.left === 1 && plant.level.left === 1) {
				t.addSound(agent.speech, agent, 'gardenFullGrown');
			}
			if (firstWatering && _this.game.player.water > 1) {
				firstWatering = false;
				t.addSound(agent.speech, agent, 'gardenWaterLeft');
			}
		} else {
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

	/* When the state starts. */
	this.startGame = function () {
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
		}, null, null, this);
	};
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
		this.waterButton = new SpriteButton(this.game, 'objects', 'drop', {
			x: this.width/2 - (height - 20)/2,
			y: 10,
			size: height - 20,
			color: 0x25377D,
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
			if (_this.highlight) {
				_this.highlight.destroy();
			}
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
