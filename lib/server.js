var express = require( 'express' );

var app = express();

var bodyParser = require( 'body-parser' )
var compression = require( 'compression' );

var path = require('path');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse text
app.use(bodyParser.text())

app.use( compression({
  threshold: 512
}) );

app.use('/api', require('./api-router') );
app.use('/gateway', require('./gateway-router') );

app.use("/", express.static(path.join( __dirname, '..', 'www' )));

module.exports = app;