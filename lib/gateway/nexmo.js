var reportProcessor = require('../util/report-processor')

var express = require( 'express' );
var router = express.Router();

router.post( '/', function(req, res) {
  if ( !req.body || !req.body.text || !req.body.msisdn )
    return res.status(400).send("Bad request.");

  var timestamp = new Date( req.body["message-timestamp"] );
  if ( isNaN( timestamp ) )
    return res.status(400).send("Bad timestamp format.");

  reportProcessor( {
    timestamp: timestamp,
    gsmid: req.body.msisdn,
    content: req.body.text
  }, function( err, report ) {
    if ( err ) {
      res.status(500).send("Something bad happened!");
    }
    res.status(200).send( report );
  });
});

module.exports = router;