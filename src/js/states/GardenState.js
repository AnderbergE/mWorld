/* The garden */
function GardenState () {}

GardenState.prototype.preload = function() {
	this.load.image('gardenBg',      'assets/img/garden/bg.png');
};

GardenState.prototype.create = function () {
	this.add.sprite(0, 0, 'gardenBg');

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

	var panda = this.add.sprite(100, 50, 'panda', null, this.group);
	panda.scale.x = 0.2;
	panda.scale.y = 0.2;
	panda.inputEnabled = true;
	panda.events.onInputDown.add(function () {
		var info = Backend.nextGame();
		this.state.start(GLOBAL.VIEW[info.type], true, false, info);
	}, this);

	menu(this);
};

GardenPlant.prototype = Object.create(Phaser.Group.prototype);
GardenPlant.prototype.constructor = GardenPlant;
function GardenPlant (id, level, water, x, y, width, height) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this._maxLevel = 3;
	this.plantId = id;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.level = level;
	this.water = water;
	return this;
}

Object.defineProperty(GardenPlant.prototype, 'level', {
	get: function() {
		return this._level; // use private variable for the level value
	},
	set: function(value) {
		if (0 <= value && value <= this._maxLevel) {
			this._level = value;
			this._neededWater = this._level + 1;

			if (!this.plant) {
				/* TODO: Replace with actual plant. */
				var bmd = game.add.bitmapData(this.width, this.height);
				bmd.ctx.fillStyle = '#ffffff';
				bmd.ctx.globalAlpha = 0.2;
				bmd.ctx.fillRect(0, 0, bmd.width, bmd.height);
				this.plant = game.add.sprite(0, 0, bmd, null, this);
				this.plant.inputEnabled = true;
				this.plant.events.onInputDown.add(this.down, this);
			} else {
				game.input.disabled = true;
				game.add.tween(this.plant).to(
					{ tint:
						this._level === 1 ? 0x00ffff :
						this._level === 2 ? 0xff00ff :
						this._level === 3 ? 0xffff00 :
						0xffffff
					},
					500, Phaser.Easing.Linear.None, true)
				.onComplete.add(function () {
					this.water = 0;
					game.input.disabled = false;
				}, this);
			}
		}
	}
});
Object.defineProperty(GardenPlant.prototype, 'water', {
	get: function() {
		return this._water; // use private variable for the level value
	},
	set: function(value) {
		this._water = value;

		if (this.waterGroup) {
			this.waterGroup.removeAll();
			if (this._level === this._maxLevel) {
				game.add.text(this.width/2, 50, GLOBAL.TEXT.maxLevel, {
					font: '60pt The Girl Next Door',
					fill: '#5555ff'
				}, this.infoGroup).anchor.setTo(0.5);
				this.waterButton.destroy();
			} else {
				for (var i = 0; i < this._neededWater; i++) {
					game.add.sprite(5 + i*36, 15, 'drop', (i >= this._water ? 1 : 0), this.waterGroup);
				}
			}
		}

		if (this._water >= this._neededWater) {
			this.level++;
		}
	}
});

GardenPlant.prototype.down = function () {
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

		this.waterButton = game.add.sprite(this.width - 90, 10, 'wood', null, this.infoGroup);
		this.waterButton.width = 80;
		this.waterButton.height = 80;
		this.waterButton.inputEnabled = true;
		this.waterButton.events.onInputDown.add(function () {
			this.water++;
		}, this);

		this.waterGroup = game.add.group(this.infoGroup);
		this.water = this.water; // dirty way to make the water redraw.

	}
	this.infoGroup.visible = true;

	var _this = this; // Subscriptions does not have access to this.
	publish(GLOBAL.EVENT.plantPress, [this.plantId]);
	this.active = subscribe(GLOBAL.EVENT.plantPress, function () { _this.hide(); });
};
GardenPlant.prototype.hide = function () {
	unsubscribe(this.active);
	this.active = null;
	this.infoGroup.visible = false;
};