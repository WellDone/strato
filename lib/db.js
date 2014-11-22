var Datastore = require('nedb');

var db = {
	monitors: new Datastore({ filename: './data/monitors.db', autoload: true }),
	reports: new Datastore({ filename: './data/reports.db', autoload: true }),
	alerts: new Datastore({ filename: './data/alerts.db', autoload: true }),
	people: new Datastore({ filename: './data/people.db', autoload: true })
}

db.monitors.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
	if ( err ) {
		console.log( err );
		process.exit();
	}
});

module.exports = db;