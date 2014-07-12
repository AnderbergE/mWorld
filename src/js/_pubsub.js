var EventSystem = {
	_events: {},
	_persistent: {},

	pushEvent: function (to, topic, callback) {
		if (!to[topic]) {
			to[topic] = [];
		}
		to[topic].push(callback);
	},

	publish: function (topic, args) {
		var subs = [].concat(this._events[topic], this._persistent[topic]);
		var len = subs.length;

		while (len--) {
			if (subs[len]) {
				subs[len].apply(this, args || []);
			}
		}
	},

	subscribe: function (topic, callback, persistent) {
		this.pushEvent((persistent ? this._persistent : this._events), topic, callback);
		return [topic, callback]; // Array
	},

	unsubscribe: function (handle, callback) {
		var subs = this._events[callback ? handle : handle[0]];
		callback = callback || handle[1];
		var len = subs ? subs.length : 0;

		while (len--) {
			if (subs[len] === callback) {
				subs.splice(len, 1);
			}
		}
	},

	clear: function (persistent) {
		this._events = {};
		if (persistent) {
			this._persistent = {};
		}
	}
};