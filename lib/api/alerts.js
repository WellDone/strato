var db = require('../db').alerts;

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "HOLLA ALERTS" );
	next();
} );

router.get( '/', function(req, res) {
	//TODO
})

router.post( '/', function(req, res) {
	//TODO
});

module.exports = router;