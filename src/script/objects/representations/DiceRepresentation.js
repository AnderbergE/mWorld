module.exports = DiceRepresentation;

DiceRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
DiceRepresentation.prototype.constructor = DiceRepresentation;

/**
 * Dice representation of a number.
 * This is similar to DotsRepresentation, but has a pattern for the dot positions.
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} number - The number to represent.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Width and height of the representation (default 100).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function DiceRepresentation (game, number, x, y, size, color) {
	size = size || 100;
	this.radius = parseInt(size/8);
	var top = this.radius+1;
	var bottom = size-this.radius-1;
	var left = top;
	var right = bottom;
	var middle = parseInt(size/2);

	/*
	 * For more information about context:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	 */
	var bmd = game.add.bitmapData(size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	ctx.beginPath();

	if (number === 1) {
		this.createDots(ctx, [[middle, middle]]);
	} else if (number === 2) {
		this.createDots(ctx, [[left, top], [right, bottom]]);
	} else if (number === 3) {
		this.createDots(ctx, [[left, top], [middle, middle], [right, bottom]]);
	} else if (number === 4) {
		this.createDots(ctx, [[left, top], [right, top], [left, bottom], [right, bottom]]);
	} else if (number === 5) {
		this.createDots(ctx, [[left, top], [right, top],
			[middle, middle], [left, bottom], [right, bottom]]);
	} else if (number === 6) {
		this.createDots(ctx, [[left, top], [right, top],
			[left, middle], [right, middle], [left, bottom], [right, bottom]]);
	} else if (number === 7) {
		this.createDots(ctx, [[left, top], [right, top],
			[left, middle], [middle, middle], [right, middle],
			[left, bottom], [right, bottom]]);
	} else if (number === 8) {
		this.createDots(ctx, [[left, top],  [middle, top], [right, top],
			[left, middle], [right, middle],
			[left, bottom], [middle, bottom], [right, bottom]]);
	} else if (number === 9) {
		this.createDots(ctx, [[left, top],  [middle, top], [right, top],
			[left, middle], [middle, middle], [right, middle],
			[left, bottom], [middle, bottom], [right, bottom]]);
	}

	ctx.closePath();
	ctx.fill();

	Phaser.Sprite.call(this, game, x, y, bmd); // Parent constructor.
	return this;
}

DiceRepresentation.prototype.createDots = function (ctx, dots) {
	ctx.arc(dots[0][0], dots[0][1], this.radius, 0, Math.PI2);
	for (var i = 1; i < dots.length; i++) {
		ctx.moveTo(dots[i][0], dots[i][1]);
		ctx.arc(dots[i][0], dots[i][1], this.radius, 0, Math.PI2);
	}
};