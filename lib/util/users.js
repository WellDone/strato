var rp = require('request-promise');

var Promise = require('bluebird');
var mongodb = Promise.promisifyAll(require('mongodb'));
Promise.promisifyAll(mongodb.Cursor.prototype);

var MongoClient = Promise.promisifyAll(mongodb.MongoClient);

module.exports = function(opts) {
	return {
		create: function(username, password) {
			return rp.post('http://localhost:' + opts.port + '/api/v1/_signup')
			.form({ login: username, password: password });
		},

		update: function(username, properties) {
			return MongoClient.connectAsync( opts.db )
			.then(function(db) {
				var collection = db.collection('people');
				return collection.updateAsync(
					{ username: username },
					{ $set: properties }, 
					{})
				.then(function() {
					return db.close();
				});
			});
		}
	};
};
