module.exports = DotsRepresentation;

DotsRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
DotsRepresentation.prototype.constructor = DotsRepresentation;

/**
 * Dots representation of a number.
 * This is similar to DiceRepresentation, but has a random dot position.
 * @param {Object} game - A reference to the Phaser game.
 * @param {number} number - The number to represent.
 * @param {number} xPos - X position.
 * @param {number} yPos - Y position.
 * @param {number} size - Width and height of the representation (default 100).
 * @param {string} color - The color of the representation (default '#000000').
 * @return {Object} Itself.
 */
function DotsRepresentation (game, number, xPos, yPos, size, color) {
	size = size || 100;
	var radius = parseInt(size/9);
	var dotSize = radius*2 + 1; // diameter + offset
	var left = radius + 1;
	var right = size - radius - 1;
	var top = left;
	var bottom = right;

	/*
	 * For more information about context:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	 */
	var bmd = game.add.bitmapData(size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	ctx.beginPath();

	/* Fill up with dots. */
	var dots = [];
	var x, y, t, i, overlap;
	while (dots.length < number) {
		/* The dots will be placed randomly. */
		x = game.rnd.integerInRange(left, right);
		y = game.rnd.integerInRange(top, bottom);
		t = { x: x, y: y };
		overlap = false;

		/* And then checked that they do not overlap other dots. */
		for (i = 0; i < dots.length; i++) {
			if (game.physics.arcade.distanceBetween(t, dots[i]) < dotSize) {
				overlap = true;
				break;
			}
		}

		/* And added if they do not. */
		if (!overlap) {
			dots.push(t);
			ctx.moveTo(x, y);
			ctx.arc(x, y, radius, 0, Math.PI2);
		}
	}

	ctx.closePath();
	ctx.fill();

	Phaser.Sprite.call(this, game, xPos, yPos, bmd); // Parent constructor.
	return this;
}