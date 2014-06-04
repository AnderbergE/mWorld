/* The dice representation of a number. */
DiceRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
DiceRepresentation.prototype.constructor = DiceRepresentation;
function DiceRepresentation (number, x, y, size, color) {
	size = size || 100;
	var radius = parseInt(size/8);
	var center = parseInt(size/2);
	var top = radius+1;
	var bottom = size-radius-1;
	var left = top;
	var right = bottom;
	var middle = center;

	// For more information about context:
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	var bmd = new Phaser.BitmapData(game, '', size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	if (number === 1) {
		ctx.beginPath();
		ctx.arc(middle, middle, radius, 0, Math.PI2);
		ctx.closePath();
	} else if (number === 2) {
		ctx.beginPath();
		ctx.arc(left, top, radius, 0, Math.PI2);
		ctx.moveTo(right, bottom);
		ctx.arc(right, bottom, radius, 0, Math.PI2);
		ctx.closePath();
	} else if (number === 3) {
		ctx.beginPath();
		ctx.arc(left, top, radius, 0, Math.PI2);
		ctx.moveTo(middle, middle);
		ctx.arc(middle, middle, radius, 0, Math.PI2);
		ctx.moveTo(right, bottom);
		ctx.arc(right, bottom, radius, 0, Math.PI2);
		ctx.closePath();
	} else if (number === 4) {
		ctx.beginPath();
		ctx.arc(left, top, radius, 0, Math.PI2);
		ctx.moveTo(right, top);
		ctx.arc(right, top, radius, 0, Math.PI2);
		ctx.moveTo(left, bottom);
		ctx.arc(left, bottom, radius, 0, Math.PI2);
		ctx.moveTo(right, bottom);
		ctx.arc(right, bottom, radius, 0, Math.PI2);
		ctx.closePath();
	} else if (number === 5) {
		ctx.beginPath();
		ctx.arc(left, top, radius, 0, Math.PI2);
		ctx.moveTo(right, top);
		ctx.arc(right, top, radius, 0, Math.PI2);
		ctx.moveTo(middle, middle);
		ctx.arc(middle, middle, radius, 0, Math.PI2);
		ctx.moveTo(left, bottom);
		ctx.arc(left, bottom, radius, 0, Math.PI2);
		ctx.moveTo(right, bottom);
		ctx.arc(right, bottom, radius, 0, Math.PI2);
		ctx.closePath();
	} else if (number === 6) {
		ctx.beginPath();
		ctx.arc(left, top, radius, 0, Math.PI2);
		ctx.moveTo(right, top);
		ctx.arc(right, top, radius, 0, Math.PI2);
		ctx.moveTo(right, middle);
		ctx.arc(right, middle, radius, 0, Math.PI2);
		ctx.moveTo(left, middle);
		ctx.arc(left, middle, radius, 0, Math.PI2);
		ctx.moveTo(left, bottom);
		ctx.arc(left, bottom, radius, 0, Math.PI2);
		ctx.moveTo(right, bottom);
		ctx.arc(right, bottom, radius, 0, Math.PI2);
		ctx.closePath();
	}
	ctx.fill();

	Phaser.Sprite.call(this, game, x, y, bmd); // Parent constructor.
	return this;
}