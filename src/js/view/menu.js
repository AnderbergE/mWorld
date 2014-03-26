/*
 * Main menu of the game.
 */
function menu () {
	/* Create a container for the menu, we add this to the world. */
	var container = game.add.group();
	container.visible = false;

	var button = game.add.text(0, 0, GLOBAL.TEXT.menu, {
		font: '20pt The Girl Next Door',
		fill: '#ffff00'
	}, container);
	button.inputEnabled = true;
	button.events.onInputDown.add(function () {
		showMenu(true);
	}, this);

	var menuGroup = game.add.group(container);
	showMenu(false);

	// Create a background for the menu, traps all mouse events.
	var overlay = game.add.bitmapData(game.world.width, game.world.height);
	overlay.ctx.beginPath();
	overlay.ctx.fillStyle = '#ffff00';
	overlay.ctx.globalAlpha = 0.2;
	overlay.ctx.fillRect(0, 0, game.world.width, game.world.height);
	overlay.ctx.closePath();
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
		showMenu(false);
		publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.entry]);
	}, this);

	function showButton (value) {
		// TODO: Not sure this is the appropriate way to put menu on top.
		game.world.bringToTop(container);
		container.visible = value;
		if (!value) {
			showMenu(false);
		}
	}

	function showMenu (value) {
		menuGroup.visible = value;
	}

	subscribe(GLOBAL.EVENT.menuShow, function () {
		showButton(true);
	});

	subscribe(GLOBAL.EVENT.menuHide, function () {
		showButton(false);
	});
}