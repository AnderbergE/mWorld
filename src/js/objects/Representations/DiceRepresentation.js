DiceRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
DiceRepresentation.prototype.constructor = DiceRepresentation;

/**
 * Dice representation of a number.
 * This is similar to DotsRepresentation, but has a pattern for the dot positions.
 * NOTE: Only available between numbers 1-6.
 * @param {number} number - The number to represent.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Width and height of the representation (default 100).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function DiceRepresentation (number, x, y, size, color) {
	size = size || 100;
	var radius = parseInt(size/8);
	var top = radius+1;
	var center = parseInt(size/2);
	var bottom = size-radius-1;
	var left = top;
	var middle = center;
	var right = bottom;

	/*
	 * For more information about context:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	 */
	var bmd = game.add.bitmapData(size, size);
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