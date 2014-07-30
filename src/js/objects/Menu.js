Menu.prototype = Object.create(Phaser.Group.prototype);
Menu.prototype.constructor = Menu;

/**
 * The game's main menu.
 * @return {Object} Itself.
 */
function Menu () {
	Phaser.Group.call(this, game, null); // Parent constructor.
	var centerX = game.world.centerX;
	var centerY = game.world.centerY;

	/* Add menu button. */
	var button = game.add.button(5, 5, 'wood', function () { showMenu(true); }, this, 0, 0, 1, 0, this);
	var menuSplit = Math.ceil(LANG.TEXT.menu.length/2);
	var menuText = game.add.text(
		button.x + button.width/2,
		button.y + button.height/2 + 7,
		'\n' + LANG.TEXT.menu.substr(0, menuSplit) + '\n' + LANG.TEXT.menu.substr(menuSplit),
		{
			font: '20pt ' +  GLOBAL.FONT,
			stroke: '#000000',
			strokeThickness: 2,
			align: 'center'
		},
		this
	);
	menuText.lineSpacing = -30;
	menuText.anchor.set(0.5);


	/* For skipping timelines */
	var skipper = null;
	var skipButton = new TextButton('>>', {
		x: 75, y: 5, size: 56, fontSize: 30,
		doNotAdapt: true,
		onClick: function () {
			if (skipper) {
				skipper.totalProgress(1);
			}
		}
	});
	skipButton.visible = false;
	this.add(skipButton);

	EventSystem.subscribe(GLOBAL.EVENT.skippable, function (timeline) {
		skipper = timeline;
		skipButton.visible = !!timeline;
	});


	/* Create the menu group. It will be shown when the button is clicked. */
	var menuGroup = game.add.group(this);
	showMenu(false);


	/* Create a cover behind the menu. */
	menuGroup.add(new Cover('#056449', 0.7));

	/* Create the background of the menu. */
	var bmd = game.add.bitmapData(parseInt(game.world.width*0.4), parseInt(game.world.height*0.6));
	bmd.ctx.fillStyle = '#b9d384';
	bmd.ctx.roundRect(0, 0, bmd.width, bmd.height, 20).fill();
	menuGroup.create(game.world.width*0.3, centerY*0.6, bmd).alpha = 0.7;

	/* Create the texts. */
	var title = game.add.text(centerX, centerY*0.4, LANG.TEXT.title, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	}, menuGroup);
	title.anchor.set(0.5);

	var resume = new TextButton(LANG.TEXT.resume, {
		x: centerX,
		y: centerY*0.8,
		fontSize: 30,
		onClick: function () {
			showMenu(false);
		}
	});
	resume.x -= resume.width/2;
	menuGroup.add(resume);

	/* Add volume control. */
	var volumeSlider = new Slider(
		centerX - bmd.width*0.2,
		centerY/0.85,
		bmd.width*0.5,
		40,
		function (value) {
			game.sound.volume = value;
			localStorage.mainVolume = value;

			if (value > 0) {
				muteButton.sprite.frame = 0;
				muteButton.muteValue = value;
			} else {
				muteButton.sprite.frame = 1;
			}
		},
		game.sound.volume
	);
	menuGroup.add(volumeSlider);

	// TODO: Change graphics to volume object
	var muteButton = new SpriteButton('drop', game.sound.volume > 0 ? 0 : 1, {
		x: centerX - bmd.width*0.35,
		y: volumeSlider.y - volumeSlider.height*0.75,
		size: volumeSlider.height*1.5,
		onClick: function () {
			if (this.sprite.frame === 1) {
				volumeSlider.value = this.muteValue > 0.1 ? this.muteValue : 1;
			} else {
				volumeSlider.value = 0;
			}
		}
	});
	muteButton.muteValue = volumeSlider.value;
	menuGroup.add(muteButton);

	if (game.state.current !== GLOBAL.STATE.garden && player.agent) {
		var garden = game.add.text(centerX, centerY/0.7, LANG.TEXT.gotoGarden, {
			font: '30pt ' +  GLOBAL.FONT,
			fill: '#000000'
		}, menuGroup);
		garden.anchor.set(0.5);
		garden.inputEnabled = true;
		garden.events.onInputDown.add(function () {
			game.state.start(GLOBAL.STATE.garden);
		}, this);
	}

	var quit = game.add.text(centerX, centerY/0.6, LANG.TEXT.quit, {
		font: '30pt ' +  GLOBAL.FONT,
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