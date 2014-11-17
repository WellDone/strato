var express = require( 'express' );

module.exports = function( routes, middlewareCallback ) {
	var router = express.Router();

	if ( middlewareCallback )
		middlewareCallback( router );
	
	for (var r in routes)
	{
		router.use( '/' + r, routes[r] );
	}

	return router;
};