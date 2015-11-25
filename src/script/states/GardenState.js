var SuperState = require('./SuperState.js');
var backend = require('../backend.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');
var EventSystem = require('../pubsub.js');
var util = require('../utils.js');
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
	this.sign = this.add.sprite(750, 100, 'garden', 'sign');
	this.sign.inputEnabled = true;
	this.sign.events.onInputDown.add(function () {
		// This happens either on local machine or on "trial" version of the game.
		if (GLOBAL.demo) {
			this.game.state.start(GLOBAL.STATE.scenario, true, false);
			return;
		}

		var t = new TimelineMax();
		t.addCallback(function () {
			this.disabler.visible = true;
		}, null, null, this);
		if (this.game.player.water > this.game.player.maxWater - 3 && !sure) {
			t.addSound(this.agent.speech, this.agent, 'gardenWaterFirst');
			sure = true;
		} else {
			var scen = backend.getScenario();
			if (scen) {
				t.addSound(this.agent.speech, this.agent, 'letsGo');
				t.addCallback(function () {
					this.game.state.start(GLOBAL.STATE[scen.subgame], true, false, scen);
				}, null, null, this);
			}
		}
		t.addCallback(function () {
			this.disabler.visible = false;
		}, null, null, this);
	}, this);

	// TODO: Randomize party.
	var callParty = this.game.rnd.between(1, 100);
	if (callParty <= 100) {
		var partySign = this.add.sprite(120, 100, 'garden', 'partysign');
		partySign.visible = true;
		partySign.inputEnabled = true;
		partySign.events.onInputDown.add(function () {
			// This happens either on local machine or on "trial" version of the game.
			if (GLOBAL.demo) {
				this.game.state.start(GLOBAL.STATE.partyPicker, true, false);
				return;
			}

			this.game.state.start(GLOBAL.STATE.partyInvitationGame);
		}, this);
	}

	/* Setup the garden fields */
	var plants = this.add.group();
	plants.x = 50;
	plants.y = 250;
	var maxLevel = 5;
	var currentPlant;

	var plantArea = new Cover(this.game, null, 0);
	plantArea.width = this.world.width - plants.x * 2;
	plantArea.height = this.world.height - plants.y;
	plantArea.inputEnabled = true;
	plantArea.events.onInputDown.add(function (notUsed, event) {
		util.fade(this.actions, false, 0.1);

		newPlantButtonButton.x = event.x - newPlantButtonButton.width / 2;
		newPlantButtonButton.y = event.y - newPlantButtonButton.height / 2;
		util.fade(newPlantButtonButton, true, 0.1);
		moveAgent.call(this, event.x + (this.agent.x < event.x ? (-this.agent.width / 2) : (this.agent.height / 2)), event.y + newPlantButtonButton.height / 2 - this.agent.height / 2);
	}, this);
	plants.add(plantArea);
	var newPlantButtonButton = new SpriteButton(this.game, 'objects', 'drop', { // The button to push when adding water.
		x: 0, y: 0, size: 60, color: 0x25377D,
		onClick: (function () {
			util.fade(newPlantButtonButton, false, 0.1);
			waterPlant.call(this, { x: newPlantButtonButton.x + newPlantButtonButton.width / 2, y: newPlantButtonButton.y + newPlantButtonButton.height });
		}).bind(this)
	});
	newPlantButtonButton.visible = false;
	this.world.add(newPlantButtonButton);

	var fields = this.gardenData.fields;
	for (var key in fields) {
		var field = fields[key];
		var plant = new GardenPlant(this.game, field.x, field.y, field.content_type, field.level); // jshint ignore:line
		plant.id = key;
		plants.add(plant);
	}

	/* The interface for plants. */
	this.actions = this.add.group();
	this.actions.visible = false;
	var bmd = this.game.add.bitmapData(200, 100); // Background.
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.globalAlpha = 0.5;
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	this.game.add.sprite(0, 0, bmd, null, this.actions);
	// TODO: Move button.
	this.actions.waterButton = new SpriteButton(this.game, 'objects', 'drop', { // The button to push when adding water.
		x: this.actions.width / 2 + 10, y: 10, size: this.actions.height - 20,
		color: 0x25377D, keepDown: true,
		onClick: (function () {
			if (currentPlant) {
				sure = false;
				waterPlant.call(this, currentPlant);
			}
		}).bind(this)
	});
	this.actions.add(this.actions.waterButton);
	this.actions.maxText = this.add.text((this.actions.width / 4) * 3, this.actions.height / 2, LANG.TEXT.maxLevel, { // The text to show when you cannot level up more.
		font: '30pt ' +  GLOBAL.FONT,
		fill: '#5555ff'
	}, this.actions);
	this.actions.maxText.anchor.set(0.5);

	/* Add the garden agent */
	this.agent = this.game.player.createAgent();
	this.agent.scale.set(0.2);
	this.agent.x = -100;
	this.agent.y = this.world.height / 2;
	this.world.add(this.agent);

	/* Add the water can */
	this.world.add(new WaterCan(this.game));
	var firstWatering = true;

	/* Add disabler. */
	this.disabler = new Cover(this.game, '#ffffff', 0);
	this.world.add(this.disabler);

	/* Add the menu */
	this.world.add(new Menu(this.game));


	var currentMove;
	function moveAgent (x, y) {
		if (currentMove) {
			currentMove.kill();
		}
		currentMove = new TimelineMax();
		currentMove.add(this.agent.move({ x: x, y: y }, this.math.distance(x, y, this.agent.x, this.agent.y) / 200));

		// Say something about the move.
		currentMove.addCallback(function () {
			var marker = 'ok' + this.game.rnd.integerInRange(1, 2);
			this.agent.say(this.agent.speech, marker).play(marker);
		}, 0, null, this);
	}

	/* Water plant when we push it. */
	function waterPlant (plant) {
		if (plant.level === maxLevel) {
			return;
		}

		var t = new TimelineMax();
		if (this.game.player.water > 0) {
			var side = (plant.x <= this.agent.x) ? -1 : 1; // Side to water towards.
			t.add(this.agent.water(2, side));
			t.addCallback(function () {
				this.game.player.water--;

				if (!plant.level) { // New plant!
					// Add the plant on a coordinate relative to the plants group.
					plant = new GardenPlant(this.game, plant.x - plants.x, plant.y - plants.y, this.rnd.integerInRange(1, 13), 1);
					plants.add(plant);
				} else {
					plant.upgrade();
					if (plant.level === maxLevel) {
						this.actions.waterButton.visible = false;
						this.actions.maxText.visible = true;
					}
				}

				/* Check that backend accepts plant upgrade */
				var ev = EventSystem.subscribe(GLOBAL.EVENT.plantUpgrade, (function (data) {
					// TODO: Error message?
					if (!data.success) {
						plant.level = data.level;
					} else if (!plant.id) {
						plant.id = data.field.id;
					}
					EventSystem.unsubscribe(ev);
				}).bind(this));
				backend.putUpgradePlant({ field: { id: plant.id, x: plant.x, y: plant.y, level: plant.level, content_type: plant.type }}); // jshint ignore:line
			}, null, null, this);
			t.addSound(this.agent.speech, this.agent, 'gardenGrowing');

			if (plant.level === maxLevel) {
				t.addSound(this.agent.speech, this.agent, 'gardenFullGrown');
			}
			if (firstWatering && this.game.player.water > 1) {
				firstWatering = false;
				t.addSound(this.agent.speech, this.agent, 'gardenWaterLeft');
			}
		} else {
			t.addSound(this.agent.speech, this.agent, 'gardenEmptyCan');
		}

		t.addCallback(function () {
			this.disabler.visible = true;
		}, 0, null, this); // at start
		t.addCallback(function () {
			this.actions.waterButton.reset();
			this.disabler.visible = false;
		}, null, null, this); // at end

		if (currentMove && currentMove.progress() < 1) {
			currentMove.add(t);
		}
	}

	this.openInterface = function (plant) {
		util.fade(newPlantButtonButton, false, 0.1);

		if (plant === currentPlant) {
			util.fade(this.actions, false, 0.2);
			currentPlant = null;
			return;
		}

		currentPlant = plant;

		moveAgent.call(this, this.agent.x < plant.x ? (plant.x - plant.width / 2 - this.agent.width / 2) : (plant.x + plant.width / 2 + this.agent.width / 2), plant.y - this.agent.height / 2);

		this.actions.x = plant.x - this.actions.width / 2;
		this.actions.y = plant.y - plant.height - this.actions.height;
		if (plant.level === maxLevel) {
			this.actions.waterButton.visible = false;
			this.actions.maxText.visible = true;
		} else {
			this.actions.waterButton.visible = true;
			this.actions.maxText.visible = false;
		}
		util.fade(this.actions, true, 0.2);
	};

	/* Check that backend accepts plant upgrade */
	EventSystem.subscribe(GLOBAL.EVENT.plantUpgrade, (function (data) {
		if (data.remaining_water !== this.game.player.water) { // jshint ignore:line
			this.game.player.water = data.remaining_water; // jshint ignore:line
		}
	}).bind(this));
};

/* When the state starts. */
GardenState.prototype.startGame = function () {
	var t = new TimelineMax().skippable();
	t.add(this.agent.move({ x: this.world.centerX }, 3));

	if (this.game.player.water > 0) {
		if (this.gardenData.fields.length > 0) {
			t.addSound(this.agent.speech, this.agent, 'gardenWhereNow');
		} else {
			t.addSound(this.agent.speech, this.agent, 'gardenHaveWater');
			t.addSound(this.agent.speech, this.agent, 'gardenPushField', '+=0.5');
		}
	} else {
		if (this.gardenData.fields.length > 0) {
			t.addSound(this.agent.speech, this.agent, 'gardenYoureBack');
		} else {
			var w = new WaterCan(this.game);
			w.visible = false;
			this.world.add(w);

			t.addSound(this.agent.speech, this.agent, 'gardenIntro');
			t.addLabel('myCan', '+=0.5');
			t.addCallback(function () {
				w.x = this.agent.x - w.width/4; // Since we scale to 0.5
				w.y = this.agent.y;
				w.scale.set(0);
				w.visible = true;
				this.agent.eyesFollowObject(w);
			}, null, null, this);
			t.add(new TweenMax(w.scale, 1, { x: 0.5, y: 0.5, ease: Elastic.easeOut }), 'myCan');
			t.addSound(this.agent.speech, this.agent, 'gardenMyCan', 'myCan');
			t.add(new TweenMax(w.scale, 1, { x: 0, y: 0, ease: Elastic.easeOut, onComplete: w.destroy, onCompleteScope: w }));
		}
		t.addLabel('sign');
		t.add(this.agent.wave(1, 1));
		t.addCallback(this.agent.eyesFollowObject, 'sign', [this.sign], this.agent);
		t.addSound(this.agent.speech, this.agent, 'gardenSign', 'sign');
	}
	t.addCallback(function () {
		this.agent.eyesStopFollow();
		this.disabler.visible = false;
	}, null, null, this);
};


/*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM*/
/*                              Garden objects                               */
/*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*/

/**
 * A garden plant/field.
 * It will level up depending on how much you water it.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} type - The type of plant.
 * @param {number} level - The level of the plant.
 * @param {number} water - The amount of water the plant has.
 */
GardenPlant.prototype = Object.create(Phaser.Group.prototype);
GardenPlant.prototype.constructor = GardenPlant;
function GardenPlant (game, x, y, type, level) {
	Phaser.Group.call(this, game, null); // Parent constructor.

	this.x = x;
	this.y = y;
	this.type = type;
	this.level = level;

	this.plant = this.newPlant();
	TweenMax.fromTo(this.plant.scale, 2, { x: 0, y: 0 }, { x: this.plant.scale.x, y: this.plant.scale.y, ease: Elastic.easeOut });

	return this;
}

GardenPlant.prototype.newPlant = function () {
	var plant = this.create(0, 0, 'garden', 'plant' + this.type + '-' + this.level);
	plant.anchor.set(0.5, 1);
	plant.scale.set(0.5); // TODO: We should not scale this, use better graphics.
	plant.inputEnabled = true;
	plant.events.onInputDown.add(this.click, this);
	return plant;
};

// Plant has leveled up by watering.
GardenPlant.prototype.upgrade = function () {
	this.level++;

	var plant = this.newPlant();
	plant.alpha = 0;

	TweenMax.to(plant, 2, {
		alpha: 1,
		onComplete: function () {
			this.plant.destroy();
			this.plant = plant;
		},
		onCompleteScope: this
	});
};

GardenPlant.prototype.click = function () {
	this.game.state.getCurrentState().openInterface(this);
};
