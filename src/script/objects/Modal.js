var Cover = require('./Cover.js');
var TextButton = require('./buttons/TextButton.js');
var GLOBAL = require('../global.js');
var LANG = require('../language.js');

module.exports = Modal;

Modal.prototype = Object.create(Phaser.Group.prototype);
Modal.prototype.constructor = Modal;

/**
 * A modal with a single ok button.
 * @param {Object} game - A reference to the Phaser game.
 * @param {string} text - The text in the modal.
 * @param {number} fontSize - The size of the text. (default is 50).
 * @param {function} callback - A callback when pushing ok (optional).
 */
function Modal (game, text, fontSize, callback) {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var centerX = game.world.centerX;
	var centerY = game.world.centerY;

	/* Create a cover behind the modal, traps all mouse events. */
	this.add(new Cover(game, '#056449', 0.7));

	/* Create the modal background. */
	var bmd = game.add.bitmapData(parseInt(game.world.width/3), parseInt(game.world.height/2));
	bmd.ctx.fillStyle = '#b9d384';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 20).fill();
	this.bg = this.create(game.world.width/2, centerY, bmd);
	this.bg.anchor.set(0.5);
	this.bg.alpha = 0.8;

	/* Add the text field. */
	this.text = game.add.text(centerX, 0, text, {
		font: (fontSize || 50) + 'pt ' +  GLOBAL.FONT,
		fill: '#bb00bb',
		align: 'center',
		wordWrap: true
	}, this);
	this.text.anchor.set(0.5, 0);

	/* Add the ok button. */
	var _this = this;
	this.button = new TextButton(game, LANG.TEXT.ok, {
		x: centerX,
		size: 80,
		fontSize: 30,
		onClick: function () {
			_this.destroy();
			if (callback) {
				callback();
			}
		}
	});
	this.button.x -= this.button.width / 2;
	this.add(this.button);

	this.setSize();
}

Modal.prototype.setSize = function (width, height) {
	width = width || this.bg.width;
	height = height || this.bg.height;

	this.bg.width = width;
	this.bg.height = height;
	this.text.y = this.bg.y - this.bg.height / 2 + 20;
	this.text.wordWrapWidth = this.bg.width - 20;
	this.button.y = this.bg.y + this.bg.height / 2 - 90;
};