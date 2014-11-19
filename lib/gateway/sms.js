var reportProcessor = require('../util/report-processor')


var express = require( 'express' );
var router = express.Router();



router.post( '/', function(req, res) {
	if ( !req.body || !req.body.message || !req.body.from )
		return res.status(400).send("Bad request.");

	var timestamp = new Date( parseInt( req.body.sent_timestamp ) );
  if ( isNaN( timestamp ) )
    timestamp = new Date();

	reportProcessor( {
		timestamp: timestamp,
		gsmid: req.body.from,
		content: req.body.message
	}, function( err, report ) {
		if ( err || !report )
		{
			console.log("Adding error");
			return res.status(500).send("Something went wrong.");
		}
		else
		{
			return res.status(200).send(report);
		}
	})
});

module.exports = router;