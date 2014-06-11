/* The garden */
function GardenState () {}

/* Phaser state function */
GardenState.prototype.preload = function() {
	this.load.image('gardenBg',      'assets/img/garden/bg.png');
};

/* Phaser state function */
GardenState.prototype.create = function () {
	this.add.sprite(0, 0, 'gardenBg');

	// TODO: Remove eventually, for debugging Birdhero game
	var panda = this.add.sprite(100, 50, 'pandaBody');
	panda.scale.set(0.2);
	panda.inputEnabled = true;
	panda.events.onInputDown.add(function () {
		this.state.start(GLOBAL.STATE.birdheroGame, true, false, {
			representation: [0],
			amount: 4, // TODO: Use range instead
			roundsPerMode: 1
		});
	}, this);

	// TODO: Remove eventually, for debugging Balloon game
	var balloonButton = this.add.sprite(300, 50, 'balloon1');
	balloonButton.inputEnabled = true;
	balloonButton.events.onInputDown.add(function () {
		this.state.start(GLOBAL.STATE.balloonGame, true, false, {
			representation: [0],
			amount: 6,
			roundsPerMode: 1
		});
	}, this);

	// TODO: Remove eventually, for debugging Lizard Jungle game
	var lizard = this.add.sprite(500, 100, 'pandaLeg');
	lizard.scale.set(0.2);
	lizard.inputEnabled = true;
	lizard.events.onInputDown.add(function () {
		this.state.start(GLOBAL.STATE.lizardGame, true, false, {
			representation: [0],
			amount: 4, // TODO: Use range instead
			roundsPerMode: 1
		});
	}, this);

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
	agent.x = this.world.centerX;
	agent.y = this.world.centerY;
	agent.scale.set(0.2);
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
		if (agent.y !== y) { currentMove.add(agent.move({ y: y }, Math.abs((agent.y - y)/height))); }
		if (agent.x !== x) { currentMove.add(agent.move({ x: x }, Math.abs((agent.x - x)/width))); }
	});

	// Water plant when we push it.
	Event.subscribe(GLOBAL.EVENT.waterPlant, function (plant) {
		var side = ((plant.x + plant.width) <= agent.x) ? -1 : 1;
		var t = agent.water(2, side);
		t.addCallback(function () { game.input.disabled = true; }, 0);
		t.addCallback(function () {
			player.water--;
			plant.water.value++;
		}, 'watering');
		t.addCallback(function () {
			plant.waterButton.frame = 0;
			game.input.disabled = false;
		});
		if (currentMove && currentMove.progress() < 1) {
			currentMove.add(t);
		}
	});
};

/* Phaser state function */
Subgame.prototype.shutdown = onShutDown;


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
			if (player.water > 0 && this.waterButton.frame === 0) {
				// Water is added to the plant when animation runs.
				this.waterButton.frame = 1;
				Event.publish(GLOBAL.EVENT.waterPlant, [this]);
			}
		}, this);

		/* Water management */
		var waterGroup = game.add.group(this.infoGroup);
		this.water.onAdd = function (current, left) {
			waterGroup.removeAll(/*true*/); // TODO: uncomment true, 2.0.3 Phaser is broken with it.
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
				waterGroup.removeAll(/*true*/); // TODO: uncomment true, 2.0.3 Phaser is broken with it.
				_this.infoGroup.remove(this.waterButton); // TODO: Destroying throws exception, why?
				//this.waterButton.destroy();
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