/*
 * A View is an object that holds what you see on screen.
 */
function View () {
	this.niceName = 'View';
	if (!this.group && game && game.add) {
		this.group = game.add.group();
	}

	return this;
}

View.prototype.update = function () {
	console.log('View update');
};

View.prototype.destroy = function () {
	if (this.group) {
		this.group.destroy();
	}
};

View.prototype.niceName = function () {
	return this.niceName;
};