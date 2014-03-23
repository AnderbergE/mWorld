/*
 * Inherits View
 * The view that you start the game with.
 */
function EntryView () {
	View.call(this); // Call parent constructor.
	this.niceName = 'Entrance';

	// Add background
	game.add.image(0, 0, 'jungle', null, this.group);

	var title = game.add.text(game.world.centerX, game.world.centerY/2, 'BOOM shackalack!', {
		font: '50pt The Girl Next Door',
		fill: '#ffff00',
		stroke: '#000000',
		strokeThickness: 5
	}, this.group);
	title.anchor.setTo(0.5);

	var text = game.add.text(game.world.centerX, game.world.centerY, 'Start', {
		font: '50pt The Girl Next Door',
		fill: '#dd00dd'
	}, this.group);
	text.anchor.setTo(0.5);
	text.inputEnabled = true;
	text.events.onInputDown.add(function () {
		game.add.audio('yeah').play();
		publish('viewChange', [1]);
	}, this);

	return this;
}

// inheritance
EntryView.prototype = new View();
EntryView.prototype.constructor = EntryView;

EntryView.prototype.update = function () {
	console.log('EntryView update');
};