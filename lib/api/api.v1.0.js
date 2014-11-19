var REM = require('remjs');
var Router = require('../util/router');
var db = require('../db')

module.exports = REM( {
	version: "1.0",
	engine: db,
	resources: {
		'monitors': {
			children: ['reports']
		},
		'reports': {
			forbid: ['post']
		},
		'alerts': {}
	}
} );