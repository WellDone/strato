var db = require('../db');

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "SMS GATEWAY" );
	next();
} );

router.post( '/', function(req, res) {
	//TODO
});

module.exports = router;