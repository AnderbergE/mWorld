/**
 * A publish/subscribe style event system.
 * Subscribe to an event and it will run when someone publish it.
 *
 * There are two subscription types: regular and persistent.
 * The difference is that persistent will not be removed by
 * the clear function unless explicitly specified.
 * @global
 */
var EventSystem = {
	/**
	 * Registered subscriptions.
	 * @property {Object} _events
	 * @private
	 */
	_events: {},

	/**
	 * Registered persistent subscriptions.
	 * @property {Object} _persistent
	 * @private
	 */
	_persistent: {},

	/**
	 * Push a subscription to a list.
	 * @param {Object} to - The list to add to (use _events or _persistent).
	 * @param {string} topic - The topic of the event.
	 * @param {function} callback - The function to run when topic is published.
	 * @private
	 */
	_pushEvent: function (to, topic, callback) {
		if (!to[topic]) {
			to[topic] = [];
		}
		to[topic].push(callback);
	},

	/**
	 * Publish an event. This will run all its subscriptions.
	 * @param {string} topic - The topic of the event.
	 * @param {Array} args - The arguments to supply to the subscriptions.
	 */
	publish: function (topic, args) {
		var subs = [].concat(this._events[topic], this._persistent[topic]);
		var len = subs.length;

		while (len--) {
			if (subs[len]) {
				subs[len].apply(this, args || []);
			}
		}
	},

	/**
	 * Subscribe to a certain event.
	 * NOTE: scope will be lost.
	 * @param {string} topic - The topic of the event.
	 * @param {function} callback - The function to run when event is published.
	 * @param {boolean} persistent - If the subscription should be added to the persistent list.
	 * @return {Array} A handle to the subscription.
	 */
	subscribe: function (topic, callback, persistent) {
		this._pushEvent((persistent ? this._persistent : this._events), topic, callback);
		return [topic, callback]; // Array
	},

	/**
	 * Unsubscribe to a certain regular event.
	 * @param {Array|string} handle - The array returned by the subscribe function or
	 *                                the topic if handle is missing.
	 * @param {function} callback - Supply this if you do not have an array handle.
	 */
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

	/**
	 * Clear the event lists.
	 * @param {boolean} persistent - True will delete all persistent events as well.
	 */
	clear: function (persistent) {
		this._events = {};
		if (persistent) {
			this._persistent = {};
		}
	}
};