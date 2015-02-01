var Datastore = require('nedb');
var REM = require('remjs');

var db = REM.engine.mongo({
	url: process.env.database_url
})

// db.monitors.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
// 	if ( err ) {
// 		console.log( err );
// 		process.exit();
// 	}
// });

module.exports = db;