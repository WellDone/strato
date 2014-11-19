var db = require('../db');
var reportParser = require('../util/report-parser.js')

var express = require( 'express' );
var router = express.Router();

router.use(function(req, res, next) {
	console.log( "SMS GATEWAY" );
	next();
} );

var addReport = function( report, monitor, timestamp, callback ) {
	report.monitors_id = monitor;
	report.gateway = 'sms';
	report.timestamp = timestamp.getTime();

	report.status = "unknown";
	if ( report.bulkAggregates )
	{
		if ( report.bulkAggregates.max == 0 )
			report.status = "failed";
		else
			report.status = "ok";
	}
	db.reports.insert( report, callback );
	db.monitors.update({_id: report.monitors_id}, { $set: { status: report.status } }, { multi: false }, function (err, numReplaced) {
		//done
	})
}

router.post( '/', function(req, res) {
	if ( !req.body || !req.body.message || !req.body.from )
		return res.status(400).send("Bad request.");

	var timestamp = new Date( parseInt( req.body.sent_timestamp ) );
  if ( isNaN( timestamp ) )
    timestamp = new Date();

	var report = null;
	try
	{
		console.log( req.body.message)
		report = reportParser(req.body.message);
	}
	catch (e)
	{
		console.log(e);
		console.log("Parsing error");
		return res.status(500).send("Something went wrong.");
	}
	report.gsmid = req.body.from;
	db.monitors.find({gsmid: req.body.from}, function(err, docs) {
		if ( err || !docs || docs.length == 0 )
		{
			db.monitors.insert({
				name: "New monitor (" + req.body.from + ")",
				location: [0,0],
				gsmid: req.body.from,
				status: "unknown"
			}, function( err, newMonitor ) {
				var monitor;
				if ( err )
					monitor = null;
				else
					monitor = newMonitor._id;

				addReport( report, monitor, timestamp, function( err, newReport ) {
					if ( err || !newReport )
					{
						console.log("Adding error");
						return res.status(500).send("Something went wrong.");
					}
					else
						return res.status(200).send(newReport);
				} );
			})
		}
		else
		{
			addReport( report, docs[0]._id, timestamp, function( err, newReport ) {
				if ( err || !newReport )
				{
					console.log("Adding error");
					return res.status(500).send("Something went wrong.");
				}
				else
					return res.status(200).send(newReport);
			} );
		}
	});
});

module.exports = router;