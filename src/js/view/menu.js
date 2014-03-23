/*
 * Main menu of the game.
 */
function menu () {
	var container = game.add.group();
	container.visible = false;

	var button = game.add.text(0, 0, 'MENU');
	button.font = 'The Girl Next Door';
	button.fontSize = 20;
	button.fill = '#ffff00';
	button.inputEnabled = true;
	button.events.onInputDown.add(function () {
		showMenu(true);
	}, this);
	container.add(button);

	var menuGroup = game.add.group();
	showMenu(false);
	container.add(menuGroup);

	var resume = game.add.text(game.world.centerX, game.world.centerY, 'Resume');
	resume.anchor.setTo(0.5);
	resume.font = 'The Girl Next Door';
	resume.fontSize = 40;
	resume.fill = '#ffff00';
	resume.inputEnabled = true;
	resume.events.onInputDown.add(function () {
		showMenu(false);
	}, this);
	menuGroup.add(resume);

	var quit = game.add.text(game.world.centerX, 3*game.world.centerY/2, 'Quit');
	quit.anchor.setTo(0.5);
	quit.font = 'The Girl Next Door';
	quit.fontSize = 40;
	quit.fill = '#ffff00';
	quit.inputEnabled = true;
	quit.events.onInputDown.add(function () {
		showMenu(false);
		publish('viewChange', [1]);
	}, this);
	menuGroup.add(quit);

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

	subscribe('menuShow', function () {
		showButton(true);
	});

	subscribe('menuHide', function () {
		showButton(false);
	});
}