/* A button for a number with flexible text. */
TextButton.prototype = Object.create(GeneralButton.prototype);
TextButton.prototype.constructor = TextButton;
/**
 * A button with text on it (publishes textPress event on click).
 * @param {Number} The number for the button
 * @param {Number} The representations of the button (see GLOBAL.REPRESENTATION)
 * @param {Object} A list of options (in addition to GeneralButton):
 *		vertical: stretch button vertically, otherwise horisontally (default true)
 *		onClick: a function to run when a button is clicked
 * @returns {Object} Itself.
 */
function TextButton (text, options) {
	GeneralButton.call(this, options); // Parent constructor.
	this.clicker = options.onClick;
	var half = this.size/2;
	this._text = game.add.text(half, half, text, {
		font: half + 'pt ' + GLOBAL.FONT,
		fill: this.color,
		stroke: this.color,
		strokeThickness: 3
	}, this);
	this._text.anchor.set(0.5);

	this.onClick = function () {
		if (this.clicker) { this.clicker(this.text); }
		Event.publish(GLOBAL.EVENT.textPress, [this.text]);
	};
	this.bg.events.onInputUp.add(function () {
		this.reset();
	}, this);

	return this;
}

Object.defineProperty(TextButton.prototype, 'text', {
	get: function() { return this._text.text; },
	set: function(value) {
		this._text.text = value;
	}
});