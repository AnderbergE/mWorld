/* Main menu of the game */
Menu.prototype = Object.create(Phaser.Group.prototype);
Menu.prototype.constructor = Menu;

function Menu () {
	Phaser.Group.call(this, game, null); // Parent constructor.

	var button = game.add.text(0, 0, GLOBAL.TEXT.menu, {
		font: '20pt The Girl Next Door',
		fill: '#ffff00'
	}, this);
	button.inputEnabled = true;
	button.events.onInputDown.add(function () {
		showMenu(true);
	}, this);

	var menuGroup = game.add.group(this);
	showMenu(false);

	// Create a background for the menu, traps all mouse events.
	var overlay = game.add.bitmapData(game.world.width, game.world.height);
	overlay.ctx.fillStyle = '#ffff00';
	overlay.ctx.globalAlpha = 0.2;
	overlay.ctx.fillRect(0, 0, game.world.width, game.world.height);
	var menuBg = game.add.sprite(0, 0, overlay, null, menuGroup);
	menuBg.inputEnabled = true;

	var resume = game.add.text(game.world.centerX, game.world.centerY, GLOBAL.TEXT.resume, {
		font: '40pt The Girl Next Door',
		fill: '#ffff00'
	}, menuGroup);
	resume.anchor.setTo(0.5);
	resume.inputEnabled = true;
	resume.events.onInputDown.add(function () {
		showMenu(false);
	}, this);

	var quit = game.add.text(game.world.centerX, 3*game.world.centerY/2, GLOBAL.TEXT.quit, {
		font: '40pt The Girl Next Door',
		fill: '#ffff00'
	}, menuGroup);
	quit.anchor.setTo(0.5);
	quit.inputEnabled = true;
	quit.events.onInputDown.add(function () {
		game.state.start(GLOBAL.STATE.entry);
	}, this);

	function showMenu (value) {
		menuGroup.visible = value;
	}

	return this;
}