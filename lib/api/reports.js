var db = require('../db').reports;

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "HOLLA REPORTS" );
	next();
} );

router.get( '/', function(req, res) {
	res.status(200).send([]);
})

router.post( '/', function(req, res) {
	res.status(404).send("unimplemented");
});

module.exports = router;