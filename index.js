var BPromise = require('bluebird');


var api = require('./lib/api/api.v1.0');
var db = require('./lib/db');
var server = require('./lib/server');

console.log("Connecting to the database...");
BPromise.join(
	api.connect(),
	db.connect()
).then(function() {
	var port = process.env['PORT'] || 3000;
	console.log("Starting server on port %d...", port);
	server.listen( port );
})