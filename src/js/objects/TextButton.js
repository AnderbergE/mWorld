/* A button for a number with flexible text. */
TextButton.prototype = Object.create(GeneralButton.prototype);
TextButton.prototype.constructor = TextButton;
/**
 * A button with text on it (publishes textPress event on click).
 * @param {string} The text for the button
 * @param {Object} A list of options (in addition to GeneralButton):
 *		fontSize: The size of the font
 *		strokeThickness: The size of the stroke (default: 3)
 *		strokeColor: The color of stroke (if any) (default: same as color)
 *		onClick: a function to run when a button is clicked
 * @returns {Object} Itself.
 */
function TextButton (text, options) {
	GeneralButton.call(this, options); // Parent constructor.
	this.clicker = options.onClick;
	var half = this.size/2;
	var fontSize = (options.fontSize || this.size*0.8);
	this._text = game.add.text(half, half, text, {
		font: fontSize + 'pt ' + GLOBAL.FONT,
		fill: this.color,
		stroke: options.strokeColor || this.color,
		strokeThickness: options.strokeThickness || 3
	}, this);
	this._text.anchor.set(0.5);

	// This will be called in the general button's onInputDown
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