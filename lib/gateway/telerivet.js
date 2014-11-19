var reportProcessor = require('../util/report-processor')

var express = require( 'express' );
var router = express.Router();

router.post( '/', function(req, res) {
  if ( !req.body || !req.body.message || !req.body.from )
    return res.status(400).send("Bad request.");

  var timestamp = new Date( parseInt( req.body.time_sent || req.body.time_created ) * 1000 );
  if ( isNaN( timestamp ) )
    return res.send( 400, "Invalid timestamp input." );

  reportProcessor( {
    timestamp: timestamp,
    gsmid: req.body.from_number,
    content: req.body.content
  }, function( err, report ) {
    if ( err ) {
      res.status(500).send("Something bad happened!");
    }
    res.status(200).send( report );
  });
});

module.exports = router;