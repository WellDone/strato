var Datastore = require('nedb');

module.exports = {
	monitors: new Datastore({ filename: './data/monitors.db', autoload: true }),
	reports: new Datastore({ filename: './data/reports.db', autoload: true }),
	alerts: new Datastore({ filename: './data/alerts.db', autoload: true })
}