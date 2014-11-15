var Router = require('./router');

var routes = {
	'monitors': require( './api/monitors' ),
	'reports': require( './api/reports' ),
	'alerts': require( './api/alerts' )
}

module.exports = Router(routes, function( router ) {
	router.use( function(req, res, next) { // Log requests
		console.log('%s %s', req.method, req.url );
		if ( req.headers.contentType )
			console.log( req.headers.contentType );
		if ( req.body )
			console.log( "  body: " + JSON.stringify( req.body ) );
		next();
	})
});