/* The first state of the game. */
function EntryState () {}

/* Entry state assets are loaded in the boot section */

/* Phaser state function */
EntryState.prototype.create = function () {
	this.add.image(0, 0, 'entryBg');

	var title = this.add.text(this.world.centerX, this.world.centerY/2, GLOBAL.TEXT.title, {
		font: '50pt The Girl Next Door',
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	});
	title.anchor.setTo(0.5);

	var text = this.add.text(this.world.centerX, this.world.centerY, GLOBAL.TEXT.start, {
		font: '50pt The Girl Next Door',
		fill: '#dd00dd'
	});
	text.anchor.setTo(0.5);
	text.inputEnabled = true;
	text.events.onInputDown.add(function () {
		user.login('debug', 'debug');
		//this.add.audio('yeah').play();
		this.state.start(GLOBAL.STATE.garden);
	}, this);

	var credits = this.add.text(this.world.centerX, this.world.centerY/0.75, GLOBAL.TEXT.credits, {
		font: '50pt The Girl Next Door',
		fill: '#000000'
	});
	credits.anchor.setTo(0.5);
	credits.inputEnabled = true;
	credits.events.onInputDown.add(function () {
		credits.visible = false;
		text.visible = false;
		allCredits.visible = true;
	}, this);

	var allCredits = this.add.text(this.world.centerX, this.world.centerY/2+50,
		'This game was made at Lund University\n\n' +
		'Game development:\nErik Anderberg, Agneta Gulz, Magnus Haake, Layla Husain\n' +
		'Programming:\nErik Anderberg, Marcus Malmberg\n' +
		'Graphics:\n Sebastian Gulz Haake\n' +
		'Special Thanks:\nAnton Axelsson, Sanne Bengtsson, Maja Håkansson, Lisa Lindberg, Björn Norrliden', {
		font: '15pt The Girl Next Door',
		fill: '#000000',
		align: 'center'
	});
	allCredits.anchor.setTo(0.5, 0);
	allCredits.visible = false;
	allCredits.inputEnabled = true;
	allCredits.events.onInputDown.add(function () {
		allCredits.visible = false;
		credits.visible = true;
		text.visible = true;
	}, this);
};