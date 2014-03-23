/*
 * Inherits View
 * The view where you choose game, aka the Garden.
 */
function HomeView () {
	View.call(this); // Call parent constructor.
	this.niceName = 'Garden';

	var panda = game.add.sprite(100, 0, 'panders');
	panda.inputEnabled = true;
	panda.events.onInputDown.add(function () { startMinigame(); }, this);
	this.group.add(panda);

	function startMinigame () {
		var next = backend.nextGame();
		publish('viewChange', next);
	}

	return this;
}

// inheritance
HomeView.prototype = new View();
HomeView.prototype.constructor = HomeView;

HomeView.prototype.update = function () {
	console.log('HomeView update');
};