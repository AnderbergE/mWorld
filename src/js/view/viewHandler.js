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
		4: 'Bird hero'
	};

	/*
	 * Constant with all the number representations that are available.
	 * The key is the unique identifier that is recieved from the backend.
	 * The value is the name of the representation.
	 */
	var NUMBER_REPRESENTATION = {
		1: 'dots',
		2: 'fingers',
		3: 'numbers'
	};

	subscribe('viewChange', function (id, representation, amount) {
		_this.currentView.destroy();
		_this.currentView = new VIEWS[id](NUMBER_REPRESENTATION[representation], amount);
		if (id === 0) {
			publish('menuHide');
		} else {
			publish('menuShow');
		}
	});


	this.currentView = new View();
	return this;
}