Modal.prototype = Object.create(Phaser.Group.prototype);
Modal.prototype.constructor = Modal;

/**
 * A modal with a single ok button.
 * @param {string} text - The text in the modal.
 * @param {number} fontSize - The size of the text. (default is 50).
 * @param {function} callback - A callback when pushing ok (optional).
 */
function Modal (text, fontSize, callback) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var centerX = game.world.centerX;
	var centerY = game.world.centerY;

	/* Create a cover behind the modal, traps all mouse events. */
	this.add(new Cover('#056449', 0.7));

	/* Create the modal background. */
	var bmd = game.add.bitmapData(parseInt(game.world.width/3), parseInt(game.world.height/2));
	bmd.ctx.fillStyle = '#b9d384';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 20).fill();
	this.create(game.world.width/3, centerY * 0.67, bmd).alpha = 0.7;

	/* Add the text field. */
	game.add.text(centerX, centerY, text, {
		font: (fontSize || 50) + 'pt ' +  GLOBAL.FONT,
		fill: '#dd00dd',
		align: 'center',
		wordWrap: true,
		wordWrapWidth: bmd.width * 0.7
	}, this).anchor.set(0.5);

	/* Add the ok button. */
	var _this = this;
	this.add(new TextButton(LANG.TEXT.ok, {
		x: centerX - 55,
		y: centerY/0.75,
		size: 80,
		fontSize: 30,
		onClick: function () {
			_this.destroy();
			if (callback) {
				callback();
			}
		}
	}));
}