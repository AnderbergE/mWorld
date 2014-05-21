/* Main menu of the game */
Menu.prototype = Object.create(Phaser.Group.prototype);
Menu.prototype.constructor = Menu;

function Menu () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var centerX = game.world.centerX;
	var centerY = game.world.centerY;

	game.add.button(5, 5, 'wood', function () { showMenu(true); }, this, 0, 0, 1, 0, this);
	game.add.text(125, 15, '=', { // These position values were set by trial and error
		font: '70pt ' +  GLOBAL.FONT,
		stroke: '#000000',
		strokeThickness: 5
	}, this).angle = 90;

	/* The menu group will be shown when the button is clicked. */
	var menuGroup = game.add.group(this);
	showMenu(false);

	// Create a background behind the menu, traps all mouse events.
	menuGroup.add(new Cover('#056449', 0.7));

	var bmd = game.add.bitmapData(parseInt(game.world.width/3), parseInt(game.world.height/2));
	bmd.ctx.fillStyle = '#b9d384';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 20).fill();
	game.add.sprite(game.world.width/3, centerY - centerY/3, bmd, null, menuGroup).alpha = 0.7;

	var title = game.add.text(game.world.centerX, game.world.centerY/2, LANG.TEXT.title, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	}, menuGroup);
	title.anchor.set(0.5);

	var resume = game.add.text(centerX, centerY, LANG.TEXT.resume, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#dd00dd'
	}, menuGroup);
	resume.anchor.set(0.5);
	resume.inputEnabled = true;
	resume.events.onInputDown.add(function () {
		showMenu(false);
	}, this);

	var quit = game.add.text(centerX, centerY/0.75, LANG.TEXT.quit, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#000000'
	}, menuGroup);
	quit.anchor.set(0.5);
	quit.inputEnabled = true;
	quit.events.onInputDown.add(function () {
		game.state.start(GLOBAL.STATE.entry);
	}, this);

	function showMenu (value) {
		menuGroup.visible = value;
	}

	return this;
}