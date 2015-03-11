var reportProcessor = require('../util/report-processor')

var express = require( 'express' );
var router = express.Router();

router.post( '/', function(req, res) {
	if ( !req.body || !req.body.message || !req.body.from )
		return res.status(400).send("Bad request.");

	var timestamp = new Date( parseInt( req.body.sent_timestamp ) );
  if ( isNaN( timestamp ) )
  {
    console.log("Bad timestamp format : " + req.body["message-timestamp"] );
    timestamp = null;
  }

	reportProcessor( {
    gateway: 'smssync',
		smssync_timestamp: timestamp,
		gsmid: req.body.from,
		content: req.body.message
	}, function( err, report ) {
		var result = { payload: {} };
    if ( err || !report ) {
      result.payload.success = false;
      result.payload.error = ""+err;
    } else {
      result.payload.success = true;
      result.payload.error = null;
    }
    res.status(200).send( result );
  });
});

module.exports = router;