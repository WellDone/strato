var BPromise = require('bluebird');
var api = require('./api/api.v1.0');
var db = require('./db');

module.exports.start = function(params) {
	console.log("Connecting to the database...");
	BPromise.join(
		api.connect(),
		db.connect(params.db)
	).then(function() {
		var server = require('./server');

		console.log("Starting server on port %d...", params.port);
		server.listen(params.port);

		// if ( !db.db.collection('people').findOne({masterOfTheUniverse: true}) ) {
		// 	console.error("WARNING: No master of the universe!")
		// }
	});
};
