var Router = require('./util/router');

var routes = {
	'v1': require( './api/api.v1.0' ).router,
	'v1.0': require( './api/api.v1.0' ).router
}

module.exports = Router(routes);