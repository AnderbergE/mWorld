/*
 * Inherits MinigameView
 * Holds the specific logic and graphics for the Lizard game.
 */
 function LizardGame (representation, amount) {
	MinigameView.call(this, representation, amount); // Call parent constructor.
	this.niceName = 'LizardGame';

	var panda = game.add.sprite(100, 0, 'panders');
	panda.scale.setTo(0.2, 0.2);
	this.group.add(panda);

	return this;
}

// inheritance
LizardGame.prototype = new MinigameView();
LizardGame.prototype.constructor = LizardGame;

LizardGame.prototype.update = function () {
	console.log('LizardGame update');
};