var Router = require('./util/router');

module.exports = function(api) {
	var routes = {
		'v1': api.router,
		'v1.0': api.router
	};

	return Router(routes);
};
