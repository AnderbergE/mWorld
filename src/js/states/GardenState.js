/* The garden */
function GardenState () {}

GardenState.prototype.preload = function() {
	
};

GardenState.prototype.create = function () {
	var panda = this.add.sprite(100, 0, 'panda', null, this.group);
	panda.inputEnabled = true;
	panda.events.onInputDown.add(function () {
		var info = Backend.nextGame();
		this.state.start(GLOBAL.VIEW[info.type], true, false, info);
	}, this);

	menu(this);
};