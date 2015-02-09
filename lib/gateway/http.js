var reportProcessor = require('../util/report-processor')

var express = require( 'express' );
var router = express.Router();

router.post( '/', function(req, res) {
  if ( !req.body )
    return res.status(400).send("Bad request.");
  
  reportProcessor( {
    timestamp: new Date(),
    content: req.body
  }, function( err, report ) {
    if ( err ) {
      res.status(500).send("Something bad happened!");
    }
    res.status(200).send( report );
  });
});

module.exports = router;