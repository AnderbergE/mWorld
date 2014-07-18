/* A modal with a single ok button */
Modal.prototype = Object.create(Phaser.Group.prototype);
Modal.prototype.constructor = Modal;

function Modal (text, fontSize, callback) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var centerX = game.world.centerX;
	var centerY = game.world.centerY;

	// Create a background behind the modal, traps all mouse events.
	this.add(new Cover('#056449', 0.7));

	var bmd = game.add.bitmapData(parseInt(game.world.width/3), parseInt(game.world.height/2));
	bmd.ctx.fillStyle = '#b9d384';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 20).fill();
	game.add.sprite(game.world.width/3, centerY - centerY/3, bmd, null, this).alpha = 0.7;

	game.add.text(centerX, centerY, text, {
		font: (fontSize || 50) + 'pt ' +  GLOBAL.FONT,
		fill: '#dd00dd',
		align: 'center',
		wordWrap: true,
		wordWrapWidth: bmd.width * 0.7
	}, this).anchor.set(0.5);

	var _this = this;
	this.add(new TextButton(LANG.TEXT.ok, {
		x: centerX - 40,
		y: centerY/0.75,
		size: 80,
		fontSize: 30,
		background: 'wood',
		onClick: function () {
			_this.destroy();
			if (callback) {
				callback();
			}
		}
	}));
}