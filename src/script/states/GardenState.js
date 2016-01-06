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

var maxLevel = 5;

/* Phaser state function */
GardenState.prototype.preload = function() {
	this.gardenData = backend.getGarden() || { fields: {} }; // jshint ignore:line
	// This happens either on local machine or on "trial" version of the game.
	if (GLOBAL.demo) {
		this.gardenData.partyTime = { game: 'partyPicker', difficulty: 0 };
	}

	if (Math.random() < 0.1) {
		this.gardenData.freeWater = true;
		if (Math.random() < 0.5) {
			this.load.image('elephant', 'img/garden/elephant.png');
			this.load.json('elephantMesh', 'img/garden/elephant.json');
		} else {
			this.load.image('robot', 'img/garden/robot.png');
			this.load.json('robotMesh', 'img/garden/robot.json');
		}
	}

	if (Object.keys(this.gardenData.fields).length) {
		this.load.image('butterfly', 'img/garden/butterfly.png');
		this.load.json('butterflyMesh', 'img/garden/butterfly.json');
	}

	this.load.audio('gardenMusic', ['audio/garden/music.m4a', 'audio/garden/music.ogg', 'audio/garden/music.mp3']);
	this.load.atlasJSONHash('garden', 'img/garden/atlas.png', 'img/garden/atlas.json');

	this.game.player.agent.load.call(this);
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

	// If backend thinks it is time for a party, show sign.
	if (this.gardenData.partyTime && this.gardenData.partyTime.game) {
		var partySign = this.add.sprite(200, 0, 'garden', 'partysign');
		partySign.anchor.set(0.5, 1);
		partySign.scale.set(0.5, 1.2);
		var t = new TimelineMax();
		t.to(partySign, 0.5, { y: 333, ease: Power0.easeIn }, 2);
		t.to(partySign.scale, 0.7, { x: 1, y: 1, ease: Elastic.easeInOut }, '-=0.2');
		partySign.inputEnabled = true;
		partySign.events.onInputDown.add(function () {
			this.game.state.start(GLOBAL.STATE[this.gardenData.partyTime.game], true, false, this.gardenData.partyTime);
		}, this);
	}

	/* Setup the garden fields */
	this.plantGroup = this.add.group();
	this.plantGroup.x = 90;
	this.plantGroup.y = 350;
	var currentPlant;

	var plantArea = new Cover(this.game, null, 0);
	plantArea.width = this.world.width - this.plantGroup.x * 2;
	plantArea.height = this.world.height - this.plantGroup.y;
	plantArea.inputEnabled = true;
	plantArea.events.onInputDown.add(function (notUsed, event) {
		util.fade(this.actions, false, 0.1);
		currentPlant = null;

		newPlantButtonButton.x = event.x - newPlantButtonButton.width / 2;
		newPlantButtonButton.y = event.y - newPlantButtonButton.height / 2;
		util.fade(newPlantButtonButton, true, 0.1);

		var x = event.x - this.plantGroup.x;
		var y = event.y - this.plantGroup.y;
		moveAgent.call(this, x + (this.agent.x < x ? -1 : 1) * (this.agent.width / 2 + this.agent.leftArm.width * this.agent.scale.x / 2), y + newPlantButtonButton.height / 2 - this.agent.height / 2);
	}, this);
	this.plantGroup.add(plantArea);
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
		plant.tag = key;
		this.plantGroup.add(plant);
	}

	/* Add the garden agent */
	this.agent = this.game.player.createAgent();
	this.agent.scale.set(0.2);
	this.agent.x = -200;
	this.agent.y = 0;
	this.plantGroup.add(this.agent);

	if (Object.keys(this.gardenData.fields).length) {
		this.addButterfly();
	}

	if (this.gardenData.freeWater) {
		if (this.cache.checkImageKey('elephant')) {
			this.addElephant();
		}
		if (this.cache.checkImageKey('robot')) {
			this.addRobot();
		}
	}

	/* The interface for plants. */
	this.actions = this.add.group();
	this.actions.visible = false;
	var bmd = this.game.add.bitmapData(200, 100); // Background.
	bmd.ctx.fillStyle = '#ffffff';
	bmd.ctx.globalAlpha = 0.5;
	bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
	this.game.add.sprite(0, 0, bmd, null, this.actions);
	this.actions.moveButton = new SpriteButton(this.game, 'objects', 'move', { // The button to push when adding water.
		x: 10, y: 10, size: this.actions.height - 20, color: 0xFFFAF0
	});
	this.actions.moveButton.sprite.tint = 0x5D2500;
	this.actions.moveButton.bg.events.onInputDown.add(function (noUsed, event) {
		var ex = event.x;
		var ey = event.y;
		var ax = this.actions.x;
		var ay = this.actions.y;
		var px = currentPlant.x;
		var py = currentPlant.y;
		currentPlant.update = (function () {
			var newX = (px + event.x - ex);
			if (newX > 0 && newX < plantArea.width) {
				currentPlant.x = newX;
				this.actions.x = ax + event.x - ex;
			}
			var newY = (py + event.y - ey);
			if (newY > 0 && newY < (plantArea.height)) {
				currentPlant.y = newY;
				this.actions.y = ay + event.y - ey;
			}
		}).bind(this);
	}, this);
	this.actions.moveButton.bg.events.onInputUp.add(function () {
		moveAgentToPlant.call(this);
		currentPlant.update = function () {};
		backend.putMovePlant({ field: { tag: currentPlant.tag, x: currentPlant.x, y: currentPlant.y } }); // jshint ignore:line
	}, this);
	this.actions.add(this.actions.moveButton);
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

	/* Add the water can */
	this.world.add(new WaterCan(this.game));
	var firstWatering = true;

	/* Add disabler. */
	this.disabler = new Cover(this.game, '#ffffff', 0);
	this.disabler.visible = true;
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

	function moveAgentToPlant (plant) {
		var p = plant || currentPlant;
		moveAgent.call(this, p.x + (this.agent.x < p.x ? -1 : 1) * (p.width / 2 + this.agent.width / 2 + this.agent.leftArm.width * this.agent.scale.x / 2), p.y - this.agent.height / 2);
	}

	/* Water plant when we push it. */
	function waterPlant (plant) {
		if (plant.level === maxLevel) {
			return;
		}

		var t = new TimelineMax();
		if (this.game.player.water > 0) {
			var side = (plant.x <= this.agent.x) ? -1 : 1; // Side to water towards. // TODO: this has been wrong in some cases.
			t.add(this.agent.water(2, side));
			t.addCallback(function () {
				this.game.player.water--;

				if (!plant.level) { // New plant!
					// Add the plant on a coordinate relative to the plants group.
					plant = new GardenPlant(this.game, plant.x - this.plantGroup.x, plant.y - this.plantGroup.y, this.rnd.integerInRange(1, 13), 1);
					this.plantGroup.add(plant);
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
					} else if (!plant.tag) {
						plant.tag = data.field.tag;
					}
					EventSystem.unsubscribe(ev);
				}).bind(this));
				backend.putUpgradePlant({ field: { tag: plant.tag, x: plant.x, y: plant.y, level: plant.level, content_type: plant.type }}); // jshint ignore:line
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
		moveAgentToPlant.call(this);

		// Actions is outside plant group, so add group coordinates.
		this.actions.x = this.plantGroup.x + plant.x - this.actions.width / 2;
		this.actions.y = this.plantGroup.y + plant.y - plant.height - this.actions.height;
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

GardenState.prototype.getRandomPlant = function () {
	var target;
	do {
		target = this.rnd.pick(this.plantGroup.children);
	} while (!(target instanceof GardenPlant));
	return target;
};

GardenState.prototype.addButterfly = function () {
	/* In case there are any plants, let's add a butterfly :) */
	var butterfly = this.add.creature(50, 100, 'butterfly', 'butterflyMesh');
	var butterflyScale = 2;
	butterfly.scale.set(butterflyScale);
	butterfly.play(true);
	moveButterfly.call(this);

	function moveButterfly () {
		var pos;
		if (Math.random() > 1 / Object.keys(this.gardenData.fields).length) {
			var target = this.getRandomPlant();
			pos = target.plant.world;
			pos.y -= target.height / 2;
		} else {
			pos = { x: this.rnd.integerInRange(0, this.world.width), y: this.rnd.integerInRange(0, this.world.height) };
		}

		TweenMax.to(butterfly, this.math.distance(butterfly.x, butterfly.y, pos.x, pos.y) / 50, { x: pos.x, y: pos.y, ease: Power2.easeInOut, onComplete: moveButterfly, onCompleteScope: this });
		// Turning if necessary.
		if (pos.x < butterfly.x) {
			if (butterfly.scale.x < butterflyScale) {
				TweenMax.to(butterfly.scale, 0.2, { x: butterflyScale, ease: Power2.easeInOut });
			}
		} else if (butterfly.scale.x > -butterflyScale) {
			TweenMax.to(butterfly.scale, 0.2, { x: -butterflyScale, ease: Power2.easeInOut });
		}
	}
};

GardenState.prototype.addElephant = function () {
	// TODO: Creature does not have any height. So there is some hard coding here that would be nice to get rid of.
	this.elephant = new Phaser.Creature(this.game, -500, this.rnd.integerInRange(0, this.plantGroup.height), 'elephant', 'elephantMesh', 'walk');
	this.elephant.manager.CreateAnimation(this.cache.getJSON('elephantMesh'), 'splash');
	this.elephant.scale.set(-20, 20);
	this.elephant.play(true);
	this.plantGroup.add(this.elephant);

	this.game.time.events.add(Phaser.Timer.SECOND * this.rnd.integerInRange(5, 10), function () {
		var target, to, emitter;
		if (Object.keys(this.gardenData.fields).length) {
			target = this.getRandomPlant();
			to = { x: target.x - 250, y: target.y - 100 };

			emitter = this.add.emitter(this.plantGroup.x + target.x, this.plantGroup.y + target.y - 90, 200); // Adding plantgroup positions since we want emitter "on top".
			emitter.width = 5;
			emitter.makeParticles('objects', 'drop');
			emitter.setScale(0.1, 0.3, 0.1, 0.3);
			emitter.setYSpeed(125, 160);
			emitter.setXSpeed(-25, 25);
			emitter.setRotation(0, 0);
			this.world.add(emitter);
		}

		var x = this.world.width + 100;
		var y = this.rnd.integerInRange(0, this.plantGroup.height);

		var t = new TimelineMax();
		if (to) {
			t.to(this.elephant, this.math.distance(this.elephant.x, this.elephant.y, to.x, to.y) / 40, { x: to.x, y: to.y, ease: Power1.easeInOut });

			t.addCallback(function () {
				this.elephant.setAnimation('splash');
				this.elephant.loop = false;
			}, null, null, this);
			t.add(new TweenMax(emitter, 2, {
				onStart: function () { emitter.start(false, 500, 10, 50); },
				onComplete: function () { emitter.destroy(); }
			}), '+=1');
			t.addCallback(function () {
				target.upgrade();
				backend.putUpgradePlant({ field: { tag: target.tag, x: target.x, y: target.y, level: target.level, content_type: target.type }, free: true }); // jshint ignore:line
			});

			t.addCallback(function () {
				this.elephant.setAnimation('walk');
				this.elephant.loop = true;
			}, '+=2', null, this);
			t.to(this.elephant, this.math.distance(to.x, to.y, x, y) / 40, { x: x, y: y, ease: Power1.easeInOut });
		} else {
			t.to(this.elephant, this.math.distance(this.elephant.x, this.elephant.y, x, y) / 40, { x: x, y: y, ease: Power1.easeInOut });
		}
		t.addCallback(this.elephant.destroy, null, null, this.elephant);
	}, this);
};

GardenState.prototype.addRobot = function () {
	// TODO: Creature does not have any height. So there is some hard coding here that would be nice to get rid of.
	this.robot = new Phaser.Creature(this.game, this.world.width, this.rnd.integerInRange(0, this.plantGroup.height), 'robot', 'robotMesh', 'Roll_loop');
	// this.robot.manager.CreateAnimation(this.cache.getJSON('robotMesh'), 'Roll');
	this.robot.manager.CreateAnimation(this.cache.getJSON('robotMesh'), 'default');
	this.robot.scale.set(20);
	this.robot.play(true);
	this.plantGroup.add(this.robot);

	this.game.time.events.add(Phaser.Timer.SECOND * this.rnd.integerInRange(5, 10), function () {
		var target, to, emitter;
		if (Object.keys(this.gardenData.fields).length) {
			target = this.getRandomPlant();
			to = { x: target.x + 80, y: target.y - 65 };

			emitter = this.add.emitter(this.plantGroup.x + target.x, this.plantGroup.y + target.y - 40, 200); // Adding plantgroup positions since we want emitter "on top".
			emitter.width = 5;
			emitter.makeParticles('objects', 'drop');
			emitter.setScale(0.1, 0.3, 0.1, 0.3);
			emitter.setYSpeed(60, 80);
			emitter.setXSpeed(-25, 25);
			emitter.setRotation(0, 0);
			this.world.add(emitter);
		}

		var x = -200;
		var y = this.rnd.integerInRange(0, this.plantGroup.height);

		var t = new TimelineMax();
		if (to) {
			t.to(this.robot, this.math.distance(this.robot.x, this.robot.y, to.x, to.y) / 60, { x: to.x, y: to.y, ease: Power1.easeInOut });

			t.addCallback(function () {
				this.robot.setAnimation('default');
				this.robot.loop = false;
			}, null, null, this);
			t.add(new TweenMax(emitter, 2, {
				onStart: function () { emitter.start(false, 500, 10, 50); },
				onComplete: function () { emitter.destroy(); }
			}), '+=1');
			t.addCallback(function () {
				target.upgrade();
				backend.putUpgradePlant({ field: { tag: target.tag, x: target.x, y: target.y, level: target.level, content_type: target.type }, free: true }); // jshint ignore:line
			});

			t.addCallback(function () {
				this.robot.setAnimation('Roll_loop');
				this.robot.loop = true;
			}, '+=2', null, this);
			t.to(this.robot, this.math.distance(to.x, to.y, x, y) / 60, { x: x, y: y, ease: Power1.easeInOut });
		} else {
			t.to(this.robot, this.math.distance(this.robot.x, this.robot.y, x, y) / 60, { x: x, y: y, ease: Power1.easeInOut });
		}
		t.addCallback(this.robot.destroy, null, null, this.robot);
	}, this);
};

/* When the state starts. */
GardenState.prototype.startGame = function () {
	var t = new TimelineMax().skippable();
	t.add(this.agent.move({ x: this.world.width / 2 - this.plantGroup.x }, 3));

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
			var w = new WaterCan(this.game, 0, this.agent.height);
			w.can.anchor.set(0.5);
			w.scale.set(0);
			w.visible = false;
			this.agent.add(w);

			t.addSound(this.agent.speech, this.agent, 'gardenIntro');
			t.addLabel('myCan', '+=0.5');
			t.addCallback(function () {
				w.visible = true;
				this.agent.eyesFollowObject(w.can);
			}, null, null, this);
			t.add(new TweenMax(w.scale, 1, { x: 3, y: 3, ease: Elastic.easeOut }), 'myCan');
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

GardenState.prototype.run = function () {
	this.agent.y += this.agent.height / 2;
	if (this.elephant) {
		this.elephant.y += 120; // Have to do this since creature does not have an anchor.
	}
	if (this.robot) {
		this.robot.y += 90; // Have to do this since creature does not have an anchor.
	}

	this.plantGroup.sort('y', Phaser.Group.SORT_ASCENDING);

	this.agent.y -= this.agent.height / 2;
	if (this.elephant) {
		this.elephant.y -= 120;
	}
	if (this.robot) {
		this.robot.y -= 90;
	}
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
	if (this.level === maxLevel) {
		return;
	}

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
