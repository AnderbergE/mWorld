TextButton.prototype = Object.create(GeneralButton.prototype);
TextButton.prototype.constructor = TextButton;

/**
 * A button with text on it.
 * Publishes textPress event on click.
 * NOTE: This button will automatically go to "up" state after click.
 * @param {string} text - The text for the button.
 * @param {Object} options - A list of options (in addition to GeneralButton):
 *        {number} fontSize: The size of the font (default is options.size * 0.8).
 *        {number} strokeThickness: The size of the stroke (default is 3).
 *        {string} strokeColor: The color of stroke (if any) (default options.color).
 *        {function} onClick: a function to run when a button is clicked.
 * @return {Object} Itself.
 */
function TextButton (text, options) {
	GeneralButton.call(this, options); // Parent constructor.

	var half = this.size/2;
	var fontSize = (options.fontSize || this.size*0.8);
	this._text = game.add.text(half, half, text, {
		font: fontSize + 'pt ' + GLOBAL.FONT,
		fill: this.color,
		stroke: options.strokeColor || this.color,
		strokeThickness: options.strokeThickness || 3
	}, this);
	this._text.anchor.set(0.5);

	this.clicker = options.onClick;
	// This will be called in the GeneralButton's onInputDown
	this.onClick = function () {
		EventSystem.publish(GLOBAL.EVENT.textPress, [this.text]);
		if (this.clicker) {
			this.clicker(this.text);
		}
	};

	return this;
}

/**
 * @property {string} text - The text on the button.
 */
Object.defineProperty(TextButton.prototype, 'text', {
	get: function() {
		return this._text.text;
	},
	set: function(value) {
		this._text.text = value;
	}
});