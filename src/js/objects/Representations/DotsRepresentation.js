/* The dots representation of a number. */
DotsRepresentation.prototype = Object.create(Phaser.Sprite.prototype);
DotsRepresentation.prototype.constructor = DotsRepresentation;
function DotsRepresentation (number, xPos, yPos, size, color) {
	size = size || 100;
	var radius = parseInt(size/9);
	var diameter = radius*2;
	var offset = 1;
	var left = radius + 1;
	var right = size - radius - 1;
	var top = left;
	var bottom = right;

	// For more information about context:
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
	var bmd = new Phaser.BitmapData(game, '', size, size);
	var ctx = bmd.ctx;
	ctx.fillStyle = color || '#000000';
	ctx.beginPath();

	/* Fill up with dots */
	var dots = [];
	var x, y, t, i, overlap;
	while (dots.length < number) {
		x = game.rnd.integerInRange(left, right);
		y = game.rnd.integerInRange(top, bottom);
		t = { x: x, y: y };
		overlap = false;
		for (i = 0; i < dots.length; i++) {
			if (game.physics.arcade.distanceBetween(t, dots[i]) < (diameter + offset)) {
				overlap = true;
				break;
			}
		}
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