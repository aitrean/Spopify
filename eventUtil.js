/*
* Utility function for testing that events were emitted
* pulled from a response by mkaj on stackoverflow
* https://ethereum.stackexchange.com/questions/15353/how-to-listen-for-contract-events-in-javascript-tests
*/

var _ = require("lodash");
var Promise = require("bluebird");

module.exports = {
	assertEvent: function (contract, filter) {
		return new Promise((resolve, reject) => {
			var event = contract[filter.event]();
			event.watch();
			event.get((error, logs) => {
				console.log('IN EVENT HANDLER : ' + logs[0])
				var log = _.filter(logs, filter);
				if (log[0]) {
					resolve(log);
				} else {
					throw Error("\n Failed to find filtered event for " + filter.event);
				}
			});
			event.stopWatching();
		});
	}
}