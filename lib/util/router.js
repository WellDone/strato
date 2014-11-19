var express = require( 'express' );
var _ = require('lodash');

module.exports = function( routes, options ) {
	options = options || {};
	var router = express.Router();

	if ( options.middleware )
		options.middleware( router );

	if ( options.log !== false )
	{
		router.use( function(req, res, next) { // Log requests
			console.log('%s %s', req.method, req.url );
			if ( req.body )
				console.log( "  body: " + JSON.stringify( req.body ) );
			next();
		})
	}
	
	for (var r in routes)
	{		
		router.use( '/' + r, routes[r] );
	}

	return router;
};