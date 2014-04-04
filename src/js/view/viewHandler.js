/*
 * Singleton
 * Handles the different views.
 */
function ViewHandler () {
	if (ViewHandler.prototype.singleton) {
		return ViewHandler.prototype.singleton;
	}
	ViewHandler.prototype.singleton = this;
	// Save this for usage in other scope.
	var _this = this;

	/*
	 * Constant with all the views that are available.
	 * The key is the unique identifier that is recieved from the backend.
	 * The value is a view object pointer.
	 */
	var VIEWS = {
		0: EntryView,
		1: HomeView,
		2: LizardGame,
		3: 'Mountain',
		4: BirdHeroGame
	};

	subscribe(GLOBAL.EVENT.viewChange, function (id, representation, amount) {
		_this.currentView.destroy();
		_this.currentView = new VIEWS[id](representation, amount);
		if (id === 0) {
			publish(GLOBAL.EVENT.menuHide);
		} else {
			publish(GLOBAL.EVENT.menuShow);
		}
	});


	this.currentView = new View();
	return this;
}