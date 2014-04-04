/*
 * Inherits View
 * The view that you start the game with.
 */
function EntryView () {
	View.call(this); // Call parent constructor.

	// Add background
	game.add.image(0, 0, 'jungle', null, this.group);

	var title = game.add.text(game.world.centerX, game.world.centerY/2, GLOBAL.TEXT.title, {
		font: '50pt The Girl Next Door',
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	}, this.group);
	title.anchor.setTo(0.5);

	var text = game.add.text(game.world.centerX, game.world.centerY, GLOBAL.TEXT.start, {
		font: '50pt The Girl Next Door',
		fill: '#dd00dd'
	}, this.group);
	text.anchor.setTo(0.5);
	text.inputEnabled = true;
	text.events.onInputDown.add(function () {
		user.login('debug', 'debug');
		//game.add.audio('yeah').play();
		publish(GLOBAL.EVENT.viewChange, [GLOBAL.VIEW.home]);
	}, this);

	var credits = game.add.text(game.world.centerX, game.world.centerY/0.75, GLOBAL.TEXT.credits, {
		font: '50pt The Girl Next Door',
		fill: '#000000'
	}, this.group);
	credits.anchor.setTo(0.5);
	credits.inputEnabled = true;
	credits.events.onInputDown.add(function () {
		credits.visible = false;
		text.visible = false;
		allCredits.visible = true;
	}, this);

	var allCredits = game.add.text(game.world.centerX, game.world.centerY/2+50,
		'This game was made at Lund University\n\n' +
		'Game development:\nAgneta Gulz, Magnus Haake, Layla Husein, Erik Anderberg\n' +
		'Programming:\nErik Anderberg, Marcus Malmberg\n' +
		'Graphics:\n Sebastian Gulz Haake\n' +
		'Special Thanks:\nAnton Axelsson, Sanne Bengtsson, Maja Håkansson, Lisa Lindberg', {
		font: '15pt The Girl Next Door',
		fill: '#000000',
		align: 'center'
	}, this.group);
	allCredits.anchor.setTo(0.5, 0);
	allCredits.visible = false;
	allCredits.inputEnabled = true;
	allCredits.events.onInputDown.add(function () {
		allCredits.visible = false;
		credits.visible = true;
		text.visible = true;
	}, this);

	return this;
}

// inheritance
EntryView.prototype = new View();
EntryView.prototype.constructor = EntryView;
EntryView.prototype.toString = function () { return 'EntryView'; };