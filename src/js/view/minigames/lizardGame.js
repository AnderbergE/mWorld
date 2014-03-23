/*
 * Inherits MinigameView
 * Holds the specific logic and graphics for the Lizard game.
 */
 function LizardGame (representation, amount) {
	MinigameView.call(this, representation, amount); // Call parent constructor.
	this.niceName = 'LizardGame';

	var panda = game.add.sprite(100, 0, 'panders', null, this.group);
	panda.scale.setTo(0.2, 0.2);

	return this;
}

// inheritance
LizardGame.prototype = new MinigameView();
LizardGame.prototype.constructor = LizardGame;

LizardGame.prototype.update = function () {
	console.log('LizardGame update');
};