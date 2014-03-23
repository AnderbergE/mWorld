/*
 * Inherits View
 * Holds shared logic for the different minigames.
 */
function MinigameView (representation, amount) {
	View.call(this); // Call parent constructor.
	this.niceName = 'Minigame';
	this.representation = representation;
	this.amount = amount;

	return this;
}

// inheritance
MinigameView.prototype = new View();
MinigameView.prototype.constructor = MinigameView;

MinigameView.prototype.update = function () {
	console.log('MinigameView update');
};