var db = require('../db').monitors;

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "HOLLA MONITORS" );
	next();
} );

router.get( '/', function(req, res) {
	// Find all documents in the collection
	db.find({}, function (err, docs) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		else
			return res.status(200).send(docs);
	});
})

router.post( '/', function(req, res) {
	if ( !req.body 
		|| !req.body.name 
	  || !req.body.location 
	  || !Array.isArray(req.body.location) 
	  || req.body.location.length != 2 )
	{
		console.log( "Invalid request!")
		return res.status(400).send("Invalid parameters.");
	}

	db.insert(req.body, function (err, newDoc) {
		if ( err ) {
			console.log( "Error occurred adding doc to the monitors db, err: %s", err );
			return res.status(500).send("Something bad happened...");
		}
		console.log( "Successfully created document with ID '%s'", newDoc._id );
		res.status(201).send(newDoc);
	});
});

module.exports = router;