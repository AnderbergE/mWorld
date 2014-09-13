StrikeRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
StrikeRepresentation.prototype.constructor = StrikeRepresentation;

/**
 * Strike/Tick representation of a number.
 * @param {number} number - The number to represent.
 * @param {number} xPos - X position.
 * @param {number} yPos - Y position.
 * @param {number} size - Width and height of the representation (default 100).
 * @param {string} color - The color of the representation (default '#000000').
 * @param {number} max - If you have a range of numbers, set this to the highest one,
 *                       that way the height of the individual strikes will be the same
 *                       (default argument number).
 * @return {Object} Itself.
 */
function StrikeRepresentation (number, xPos, yPos, size, color, max) {
	size = size || 100;
	max = max || number;
	max = Math.abs(max);
	if (max < number) {
		max = number;
	}

	var diagTop = 0.8;
	var diagBottom = 0.2;
	var width = size/10;
	var half = width/2;
	var padding = width*1.25;
	var offset = 2;
	var height = size/Math.ceil(max/5) - offset;

	var pos = (size - width - padding*2) / 3;

	/*
	 * For more information about context:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	 */
	var bmd = new Phaser.BitmapData(game, '', size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	ctx.beginPath();

	var x = padding;
	var y = offset/2;
	for (var i = 1; i <= number; i++) {
		if (i % 5 === 0 && i !== 0) {
			ctx.moveTo(0,           y + height*diagTop - half   );
			ctx.lineTo(size - half, y + height*diagBottom       );
			ctx.lineTo(size,        y + height*diagBottom + half);
			ctx.lineTo(half,        y + height*diagTop          );
			ctx.lineTo(0,           y + height*diagTop - half   );
			x = padding;
			y += height + offset;
		} else {
			ctx.fillRect(x, y, width, height);
			x += pos;
		}
	}

	ctx.closePath();
	ctx.fill();

	Phaser.Sprite.call(this, game, xPos, yPos, bmd); // Parent constructor.
	return this;
}