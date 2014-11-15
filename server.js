var express = require( 'express' );
var bodyParser = require( 'body-parser' )
var compression = require( 'compression' );

var app = express();

var Datastore = require('nedb')
  , monitorsdb = new Datastore({ filename: './data/monitors.db', autoload: true })
  , reportsdb = new Datastore({ filename: './data/reports.db', autoload: true })
  , alertsdb = new Datastore({ filename: './data/alerts.db', autoload: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use( compression({
  threshold: 512
}) );

app.use( express.static('www') );

app.use( function(req, res, next) { // Log requests
	console.log('%s %s', req.method, req.url );
	if ( req.headers.contentType )
		console.log( req.headers.contentType );
	if ( req.body )
		console.log( "  body: " + JSON.stringify( req.body ) );
	next();
})

app.post( "/gateway/sms", function( req, res ) {
	
} );
app.get( "/monitors", function( req, res ) {
	// Find all documents in the collection
	monitorsdb.find({}, function (err, docs) {
		if ( err )
			return res.status(500).send("An unexpected error occurred.");
		else
			return res.status(200).send(docs);
	});
});
app.post( "/monitors", function( req, res ) {
	if ( !req.body 
		|| !req.body.name 
	  || !req.body.location 
	  || !Array.isArray(req.body.location) 
	  || req.body.location.length != 2 )
	{
		console.log( "Invalid request!")
		return res.status(400).send("Invalid parameters.");
	}

	monitorsdb.insert(req.body, function (err, newDoc) {
		if ( err ) {
			console.log( "Error occurred adding doc to the monitors db, err: %s", err );
			return res.status(500).send("Something bad happened...");
		}
		console.log( "Successfully created document with ID '%s'", newDoc._id );
		res.status(201).send(newDoc);
	});
});

app.get( "/reports", function( req, res ) {
	//TODO
});

app.get( "/alerts", function( req, res ) {
	//TODO
});

app.listen( 3000 );