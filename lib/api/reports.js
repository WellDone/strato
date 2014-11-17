var db = require('../db').reports;
var _ = require('lodash');

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "HOLLA REPORTS" );
	next();
} );

router.get( '/', function(req, res) {
	var query = {};
	if ( req.monitor ) {
		query.monitor_id = req.monitor._id;
	}
	db.find(query, function( err, docs ) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		res.status(200).send(docs);
	})
})
router.get( '/:reportid', function(req, res) {
	db.find({ _id: req.params.reportid }, function (err, docs) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		else if ( !docs || docs.length == 0 )
			return res.status(404).send("Resource not found.");
		else
			return res.status(200).send(docs[0]);
	});
})

router.post( '/', function(req, res) {
	if ( !req.monitor ) {
		return res.status(404).send("unimplemented");
	}

	if (!req.body)
	{
		console.log( "Invalid request!" )
		return res.status(400).send("Invalid parameters.");
	}
	var obj = _.extend( req.body, { monitor_id: req.monitor._id } );
	db.insert( obj, function( err, newDoc ) {
		if ( err ) {
			console.log( "Error occurred adding doc to the reports db, err: %s", err );
			return res.status(500).send("Something bad happened...");
		}
		console.log( "Successfully created document with ID '%s'", newDoc._id );
		res.status(201).send(newDoc);
	});
});

module.exports = router;