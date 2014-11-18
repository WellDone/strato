var db = require('../db').monitors;
var reports = require('./reports.js');

var express = require( 'express' );
var router = express.Router();

router.get( '/', function(req, res) {
	// Find all documents in the collection
	db.find({}, function (err, docs) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		else
			return res.status(200).send(docs);
	});
})

var findMonitor = function( req, res, next ) {
	db.find({ _id: req.params.monitorid }, function (err, docs) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		else if ( !docs || docs.length == 0 )
			return res.status(404).send("Resource not found.");
		
		req.monitor = docs[0];
		next();
	});
}
router.get( '/:monitorid', findMonitor, function(req, res) {
	console.log( req.monitor );
	if ( !req.monitor )
		res.status(500).send("This should never happen.");

	res.status(200).send(req.monitor);
})
router.delete( '/:monitorid', function(req, res) {
	db.remove({_id: req.params.monitorid }, {}, function(err, num) {
		console.log(num);
		if ( err )
			return res.status(500).send(err);
		else if ( num == 0 )
			return res.status(404).send("Resource not found.");
		else if ( num != 1 )
			return res.status(500).send("This should never happen.");

		return res.status(200).send("OK");
	})
})

router.use( '/:monitorid/reports', findMonitor, reports );

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