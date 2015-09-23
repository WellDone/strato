var BPromise = require('bluebird');
var db = require('./db');

module.exports.start = function(params) {
	console.log("Connecting to the database '%s'...", params.db);

	var api = require('./api/api.v1.0')(params);

	return BPromise.join(
		api.connect(),
		db.connect(params.db)
	).then(function() {
		var server = BPromise.promisifyAll(require('./server')(api));

		console.log("Starting server on port %d...", params.port);
		return server.listen(params.port);
	});
};
