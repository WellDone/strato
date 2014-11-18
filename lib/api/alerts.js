var db = require('../db').alerts;

var express = require( 'express' );
var router = express.Router();

router.get( '/', function(req, res) {
	res.status(200).send([]);
})

router.post( '/', function(req, res) {
	res.status(404).send("unimplemented");
});

module.exports = router;