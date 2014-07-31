/**
 * The first state of the game, where you start the game or do settings.
 */
function EntryState () {}

/* Entry state assets are loaded in the boot section */

/* Phaser state function */
EntryState.prototype.create = function () {
	this.add.image(0, 0, 'entryBg');

	var title = this.add.text(this.world.centerX, this.world.centerY/2, LANG.TEXT.title, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	});
	title.anchor.set(0.5);

	var start = this.add.text(this.world.centerX, this.world.centerY, LANG.TEXT.continuePlaying, {
		font: '50pt ' +  GLOBAL.FONT,
		fill: '#dd00dd'
	});
	start.anchor.set(0.5);
	start.inputEnabled = true;

	var changeAgent = this.add.text(this.world.centerX, this.world.centerY*1.4, '', {
		font: '40pt ' +  GLOBAL.FONT,
		fill: '#000000'
	});
	changeAgent.anchor.set(0.5);
	changeAgent.inputEnabled = true;

	if (player.agent) {
		// Player has played before, we go to garden directly and show the agent change option.
		start.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.garden); }, this);

		changeAgent.text = LANG.TEXT.changeAgent;
		changeAgent.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.agentSetup); }, this);

	} else {
		// Player has not played before, go to setup.
		start.text = LANG.TEXT.start;
		start.events.onInputDown.add(function () { this.state.start(GLOBAL.STATE.agentSetup); }, this);
	}


	/* Credits related objects: */
	var credits = this.add.text(this.world.width - 100, this.world.height - 40, LANG.TEXT.credits, {
		font: '30pt ' +  GLOBAL.FONT,
		fill: '#000000'
	});
	credits.anchor.set(0.5);
	credits.inputEnabled = true;
	credits.events.onInputDown.add(function () {
		fade(credits, false, 0.3);
		fade(start, false, 0.3);
		fade(changeAgent, false, 0.3);
		fade(allCredits, true);
		rolling.restart();
		cover.visible = true;
		TweenMax.to(cover, 0.5, { alpha: 0.7 });
	}, this);

	var cover = new Cover('#000000', 0);
	cover.visible = false;
	cover.inputEnabled = true;
	cover.events.onInputDown.add(function () {
		fade(credits, true);
		fade(start, true);
		fade(changeAgent, true);
		fade(allCredits, false, 0.3);
		rolling.pause();
		TweenMax.to(cover, 0.3, { alpha: 0, onComplete: function () { cover.visible = false; } });
	}, this);
	this.world.add(cover);

	var allCredits = this.add.text(this.world.centerX, this.world.height,
		'This game was made at Lund University\n\n' +
		'Game development:\nErik Anderberg, Agneta Gulz, Magnus Haake, Layla Husain\n' +
		'Programming:\nErik Anderberg, Marcus Malmberg, Henrik Söllvander\n' +
		'Graphics:\nSebastian Gulz Haake\n\n' +
		'Special Thanks:\nAnton Axelsson, Sanne Bengtsson, Maja Håkansson, Lisa Lindberg, Björn Norrliden', {
		font: '15pt ' +  GLOBAL.FONT,
		fill: '#ffffff',
		align: 'center'
	});
	allCredits.anchor.set(0.5, 0);
	allCredits.visible = false;
	var rolling = TweenMax.fromTo(allCredits, 15,
		{ y: this.world.height },
		{ y: -allCredits.height, ease: Power0.easeInOut, repeat: -1, paused: true });
};

/* Phaser state function */
EntryState.prototype.shutdown = onShutDown;