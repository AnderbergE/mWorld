FingerRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
FingerRepresentation.prototype.constructor = FingerRepresentation;

/**
 * Finger representation of a number.
 * NOTE: Only available between numbers 1-9.
 * @param {number} number - The number to represent.
 * @param {number} xPos - X position.
 * @param {number} yPos - Y position.
 * @param {number} size - Width and height of the representation (default 100).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function FingerRepresentation (number, xPos, yPos, size, color) {
	size = size || 100;
	var half = size/2;
	var width = size/20;
	var middle = 11.2;

	/*
	 * For more information about context:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	 */
	var bmd = game.add.bitmapData(size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	ctx.beginPath();

	var x, y, height;
	if (number >= 1) {
		x = 0;
		y = half*0.8;
		height = half*0.7;
		ctx.moveTo(x, y);
		ctx.lineTo(width, y - width);
		ctx.lineTo(width*2.5, y + height);
		ctx.lineTo(width*1.5, y + height + width);
		ctx.lineTo(x, y);
	}
	if (number >= 2) {
		x = width*2.2;
		y = half*0.5;
		height = half*0.9;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y - width);
		ctx.lineTo(x + width*2, y + height);
		ctx.lineTo(x + width, y + height + width);
		ctx.lineTo(x, y);
	}
	if (number >= 3) {
		x = width*4.4;
		y = half*0.3;
		height = half*1.1;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y + height);
		ctx.lineTo(x, y);
	}
	if (number >= 4) {
		x = width*6.6;
		y = half*0.5;
		height = half;
		ctx.moveTo(x, y - width);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width/2, y + height);
		ctx.lineTo(x - width/2, y + height - width);
		ctx.lineTo(x, y - width);
	}
	if (number >= 5) {
		x = width*8.6;
		y = half;
		height = half*0.7;
		ctx.moveTo(x, y - width);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x, y + height);
		ctx.lineTo(x - width, y + height + width);
		ctx.lineTo(x, y - width);
	}
	if (number >= 6) {
		x = width*middle;
		y = half;
		height = half*0.7;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y - width);
		ctx.lineTo(x + width*2, y + height + width);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y);
	}
	if (number >= 7) {
		x = width*(middle+2);
		y = half*0.5;
		height = half;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y - width);
		ctx.lineTo(x + width*1.5, y + height - width);
		ctx.lineTo(x + width/2, y + height);
		ctx.lineTo(x, y);
	}
	if (number >= 8) {
		x = width*(middle + 4.2);
		y = half*0.3;
		height = half*1.1;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y + height);
		ctx.lineTo(x, y);
	}
	if (number >= 9) {
		x = width*(middle + 6.4);
		y = half*0.5;
		height = half*0.9;
		ctx.moveTo(x, y - width);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x, y + height + width);
		ctx.lineTo(x - width, y + height);
		ctx.lineTo(x, y - width);
	}

	ctx.closePath();
	ctx.fill();

	Phaser.Sprite.call(this, game, xPos, yPos, bmd); // Parent constructor.
	return this;
}