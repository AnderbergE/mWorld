TextButton.prototype = Object.create(GeneralButton.prototype);
TextButton.prototype.constructor = TextButton;

/**
 * A button with text on it.
 * @param {string} text - The text for the button.
 * @param {Object} options - A list of options (in addition to GeneralButton):
 *        {number} fontSize: The size of the font (default is options.size * 0.8).
 *        {number} strokeThickness: The size of the stroke (default is 3).
 *        {string} strokeColor: The color of stroke (if any) (default options.color).
 *        {boolean} doNotAdapt: True if the size should not adapt to text size (default false).
 * @return {Object} Itself.
 */
function TextButton (text, options) {
	GeneralButton.call(this, options); // Parent constructor.
	this.doNotAdapt = options.doNotAdapt || false;

	var half = this.size/2;
	var fontSize = (options.fontSize || this.size*0.8);
	this._text = game.add.text(half, half, text, {
		font: fontSize + 'pt ' + GLOBAL.FONT,
		fill: this.color,
		stroke: options.strokeColor || this.color,
		strokeThickness: options.strokeThickness || 3
	}, this);
	this._text.anchor.set(0.5);

	/* Do this to adapt button size. */
	this.text = this.text;

	if (options.onClick) {
		this._clicker = options.onClick;
		// This will be called in the GeneralButton's onInputDown
		this.onClick = function () {
			if (this._clicker) {
				this._clicker(this.text);
			}
		};
	}

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

		if (!this.doNotAdapt) {
			this.adaptSize();
		}
	}
});

/**
 * Adapt the button background to the text size.
 */
TextButton.prototype.adaptSize = function () {
	this.bg.width = (this._text.width > this.size ? this._text.width : this.size) + 30;
	this.bg.height = (this._text.height > this.size ? this._text.height : this.size);
	this._text.x = this.bg.width/2;
	this._text.y = this.bg.height/2;
};