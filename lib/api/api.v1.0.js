var REM = require('../rem');
var Router = require('../util/router');

var routes = {
	'monitors': REM({
		name: 'monitors',
		children: 'reports'
	}),
	'reports': REM({
		name: 'reports'
	}),
	'alerts': REM({
		name: 'alerts'
	})
}

module.exports = Router(routes, {log: false});