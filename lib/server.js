var express = require( 'express' );

var app = express();

var bodyParser = require( 'body-parser' )
var compression = require( 'compression' );

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use( compression({
  threshold: 512
}) );

app.use( express.static('www') );
app.use('/api', require('./api-router') );
app.use('/gateway', require('./gateway-router') );

module.exports = app;