/*
 * Inherits View
 * The view that you start the game with.
 */
function EntryView () {
	View.call(this); // Call parent constructor.
	this.niceName = 'Entrance';

	// Setup view.
	var title = game.add.text(game.world.centerX, game.world.centerY/2, 'BOOM shackalack!');
	title.anchor.setTo(0.5);
	title.font = 'The Girl Next Door';
	title.fontSize = 60;
	title.fill = '#ffff00';
	this.group.add(title);

	var text = game.add.text(game.world.centerX, game.world.centerY, 'Start');
	text.anchor.setTo(0.5);
	text.font = 'The Girl Next Door';
	text.fontSize = 60;
	text.fill = '#dd00dd';
	text.inputEnabled = true;
	text.events.onInputDown.add(function () { startGame(); }, this);
	this.group.add(text);

	function startGame () {
		publish('viewChange', [1]);
	}

	return this;
}

// inheritance
EntryView.prototype = new View();
EntryView.prototype.constructor = EntryView;

EntryView.prototype.update = function () {
	console.log('EntryView update');
};