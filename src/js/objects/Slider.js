/* A slider */
Slider.prototype = Object.create(Phaser.Group.prototype);
Slider.prototype.constructor = Slider;

function Slider (x, y, width, height, onChange, initial) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	this.x = x;
	this.y = y;
	this.onChange = onChange;

	var line = game.add.sprite(0, 0, 'wood', 0, this);
	line.anchor.set(0, 0.5);
	line.height = height/10;
	line.width = width;

	this.handle = game.add.sprite(0, 0, 'wood', 0, this);
	this.handle.anchor.set(0.5);
	this.handle.width = height;
	this.handle.height = height;
	this.handle.max = line.width - this.handle.width;
	this.handle.x = this.handle.max * initial;

	// Move objects so that this.handle is easy to use
	this.x += this.handle.width/2;
	line.x -= this.handle.width/2;

	// Use a large input area, that can be pushed anywhere on the line
	var trigger = game.add.sprite(line.x, line.y,
		game.add.bitmapData(line.width, this.handle.height), null, this);
	trigger.anchor.set(0, 0.5);
	trigger.inputEnabled = true;

	trigger.events.onInputDown.add(function () {
		var _this = this;
		this.handle.frame++;
		this.handle.update = function () {

			this.x = game.input.activePointer.x - _this.x;
			if (this.x < 0) {
				this.x = 0;
			} else if (this.x > this.max) {
				this.x = this.max;
			}

			_this.onChange(this.x / this.max);
		};
	}, this);

	trigger.events.onInputUp.add(function () {
		this.handle.update = function () {};
		this.handle.frame--;
	}, this);
}

Object.defineProperty(Slider.prototype, 'value', {
	get: function() { return this.handle.x / this.handle.max; },
	set: function(value) {
		this.handle.x = this.handle.max * value;
		this.onChange(value);
	}
});
