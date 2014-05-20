var Event = (function () {
	var _events = {};

	this.publish = function (topic, args) {
		var subs = _events[topic];
		var len = subs ? subs.length : 0;

		while (len--) {
			subs[len].apply(this, args || []);
		}
	};

	this.subscribe = function (topic, callback) {
		if (!_events[topic]) {
			_events[topic] = [];
		}
		_events[topic].push(callback);
		return [topic, callback]; // Array
	};

	this.unsubscribe = function (handle, callback) {
		var subs = _events[callback ? handle : handle[0]];
		callback = callback || handle[1];
		var len = subs ? subs.length : 0;

		while (len--) {
			if (subs[len] === callback) {
				subs.splice(len, 1);
			}
		}
	};

	this.clear = function () {
		_events = {};
	};

	return this;
})();