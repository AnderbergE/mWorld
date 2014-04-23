/* The dice representation of a number. */
Dice.prototype = Object.create(Phaser.BitmapData.prototype);
Dice.prototype.constructor = Dice;
function Dice (number, size, color) {
	size = size || 100;
	Phaser.BitmapData.call(this, game, '', size, size); // Parent constructor.
	var radius = parseInt(size/8);
	var center = parseInt(size/2-radius);
	var top = radius+1;
	var bottom = size-radius-1;
	var left = top;
	var right = bottom;
	var middle = center+radius;

	// For more information about context:
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	this.ctx.fillStyle = color || '#000000';
	if (number === 1) {
		this.ctx.beginPath();
		this.ctx.arc(middle, middle, radius, 0, this.round);
		this.ctx.closePath();
	} else if (number === 2) {
		this.ctx.beginPath();
		this.ctx.arc(left, top, radius, 0, this.round);
		this.ctx.moveTo(right, bottom);
		this.ctx.arc(right, bottom, radius, 0, this.round);
		this.ctx.closePath();
	} else if (number === 3) {
		this.ctx.beginPath();
		this.ctx.arc(left, top, radius, 0, this.round);
		this.ctx.moveTo(middle, middle);
		this.ctx.arc(middle, middle, radius, 0, this.round);
		this.ctx.moveTo(right, bottom);
		this.ctx.arc(right, bottom, radius, 0, this.round);
		this.ctx.closePath();
	} else if (number === 4) {
		this.ctx.beginPath();
		this.ctx.arc(left, top, radius, 0, this.round);
		this.ctx.moveTo(right, top);
		this.ctx.arc(right, top, radius, 0, this.round);
		this.ctx.moveTo(left, bottom);
		this.ctx.arc(left, bottom, radius, 0, this.round);
		this.ctx.moveTo(right, bottom);
		this.ctx.arc(right, bottom, radius, 0, this.round);
		this.ctx.closePath();
	} else if (number === 5) {
		this.ctx.beginPath();
		this.ctx.arc(left, top, radius, 0, this.round);
		this.ctx.moveTo(right, top);
		this.ctx.arc(right, top, radius, 0, this.round);
		this.ctx.moveTo(middle, middle);
		this.ctx.arc(middle, middle, radius, 0, this.round);
		this.ctx.moveTo(left, bottom);
		this.ctx.arc(left, bottom, radius, 0, this.round);
		this.ctx.moveTo(right, bottom);
		this.ctx.arc(right, bottom, radius, 0, this.round);
		this.ctx.closePath();
	} else if (number === 6) {
		this.ctx.beginPath();
		this.ctx.arc(left, top, radius, 0, this.round);
		this.ctx.moveTo(right, top);
		this.ctx.arc(right, top, radius, 0, this.round);
		this.ctx.moveTo(right, middle);
		this.ctx.arc(right, middle, radius, 0, this.round);
		this.ctx.moveTo(left, middle);
		this.ctx.arc(left, middle, radius, 0, this.round);
		this.ctx.moveTo(left, bottom);
		this.ctx.arc(left, bottom, radius, 0, this.round);
		this.ctx.moveTo(right, bottom);
		this.ctx.arc(right, bottom, radius, 0, this.round);
		this.ctx.closePath();
	}
	this.ctx.fill();

	return this;
}
Dice.prototype.round = 2*Math.PI;