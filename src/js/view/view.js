/*
 * A View is an object that holds what you see on screen.
 */
function View () {
	if (!this.group && game && game.add) {
		this.group = game.add.group();
		game.input.disabled = false;
	}
	this.events = [];

	return this;
}

View.prototype.toString = function () { return 'View'; };

View.prototype.destroy = function () {
	for (var i = 0; i < this.events.length; i++) {
		unsubscribe(this.events[i]);
	}

	if (this.group) {
		this.group.destroy();
	}
};

View.prototype.addEvent = function (ev, func) {
	this.events.push(subscribe(ev, func));
};

View.prototype.removeEvent = function (ev) {
	for (var i = 0; i < this.events.length; i++) {
		if (this.events[i] === ev) {
			unsubscribe(this.events[i]);
			break;
		}
	}
};

View.prototype.update = function () {
	console.log(this + ' update');
};