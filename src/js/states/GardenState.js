/* The garden */
function GardenState () {}

/* Phaser state function */
GardenState.prototype.preload = function() {
	this.load.image('gardenBg',      'assets/img/garden/bg.png');
};

	//For testing the mountain game specifically.
this.balloonGame = function () {
	return {
		type: 3,
		representation: 0,
		amount: 4,
		roundsPerMode: 1
	};
};

/* Phaser state function */
GardenState.prototype.create = function () {
	this.add.sprite(0, 0, 'gardenBg');

	var panda = this.add.sprite(100, 50, 'panda', null, this.group);
	panda.scale.x = 0.2;
	panda.scale.y = 0.2;
	panda.inputEnabled = true;
	panda.events.onInputDown.add(function () {
		var info = Backend.nextGame();
		this.state.start(GLOBAL.STATE[info.type], true, false, info);
	}, this);

	var balloonButton = this.add.sprite(300, 50, 'balloon', null, this.group);
	balloonButton.scale.x = 0.2;
	balloonButton.scale.y = 0.2;
	balloonButton.inputEnabled = true;
	balloonButton.events.onInputDown.add(function () {
		var info = Backend.balloonGame();
		this.state.start(GLOBAL.STATE[info.type], true, false, info);
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

	this.world.add(new Menu());
};

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

	this.water = new Counter(level+1, true, water);
	this.level = new Counter(3, false, level);
	this.level.onAdd = function (current) {
		game.input.disabled = true;
		TweenMax.to(plant, 1, {
			tint:
				current === 1 ? 0x00ffff :
				current === 2 ? 0xff00ff :
				current === 3 ? 0xffff00 :
				0xffffff,
			onComplete: function () {
				_this.water.update();
				game.input.disabled = false;
		}});
	};

	return this;
}

GardenPlant.prototype.down = function () {
	var _this = this; // Events do not have access to this
	if (this.active) {
		publish(GLOBAL.EVENT.plantPress, [this.plantId]);
		return;
	}

	if (!this.infoGroup) {
		// TODO: A lot of hard coded values here dude...
		this.infoGroup = game.add.group(this);
		this.infoGroup.x = 0;
		this.infoGroup.y = -100;

		var bmd = game.add.bitmapData(this.width, 100);
		bmd.ctx.fillStyle = '#ffffff';
		bmd.ctx.globalAlpha = 0.5;
		bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
		game.add.sprite(0, 0, bmd, null, this.infoGroup).inputEnabled = true;

		var waterButton = game.add.sprite(this.width - 90, 10, 'wood', null, this.infoGroup);
		waterButton.width = 80;
		waterButton.height = 80;
		waterButton.inputEnabled = true;
		waterButton.events.onInputDown.add(function () {
			this.water.value++;
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
			_this.water.max = _this.level.value + 1;
			if (_this.level.value === _this.level.max) {
				_this.water.onAdd = null;
				_this.water.onMax = null;
				waterGroup.removeAll(/*true*/); // TODO: uncomment true, 2.0.3 Phaser is broken with it.
				_this.infoGroup.remove(waterButton); // TODO: Destroying throws exception, why?
				//waterButton.destroy();
				game.add.text(_this.width/2, 50, GLOBAL.TEXT.maxLevel, {
					font: '60pt The Girl Next Door',
					fill: '#5555ff'
				}, _this.infoGroup).anchor.setTo(0.5);
			}
		};
		this.water.update();
	}
	this.infoGroup.visible = true;

	publish(GLOBAL.EVENT.plantPress, [this.plantId]);
	this.active = subscribe(GLOBAL.EVENT.plantPress, function () { _this.hide(); });
};
GardenPlant.prototype.hide = function () {
	unsubscribe(this.active);
	this.active = null;
	this.infoGroup.visible = false;
};