var db = require('../db').reports;

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "HOLLA REPORTS" );
	next();
} );

router.get( '/', function(req, res) {
	//TODO
})

router.post( '/', function(req, res) {
	//TODO
});

module.exports = router;