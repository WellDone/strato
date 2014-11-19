var Router = require('./util/router');

var routes = {
	'v1': require( './api/api.v1.0' ),
	'v1.0': require( './api/api.v1.0' )
}

module.exports = Router(routes);