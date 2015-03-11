var reportProcessor = require('../util/report-processor')
var bodyParser = require('body-parser');

var express = require( 'express' );
var router = express.Router();

router.use( bodyParser.text() )
router.post( '/', function(req, res) {
  if ( !req.body )
    return res.status(400).send("Bad request.");
  
  reportProcessor( {
    gateway: 'http',
    content: req.body
  }, function( err, report ) {
    if ( err ) {
      console.error(err);
      res.status(500).send("Something bad happened!");
    }
    res.status(200).send( report );
  });
});

module.exports = router;