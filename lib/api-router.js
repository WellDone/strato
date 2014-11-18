var Router = require('./util/router');

var routes = {
	'monitors': require( './api/monitors' ),
	'reports': require( './api/reports' ),
	'alerts': require( './api/alerts' )
}

module.exports = Router(routes);