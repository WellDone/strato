var http = require('http');
var _ = require('lodash');

var monitors = [
	{name: 'Aidan Ulungi', location: [-8.09338,36.51612]},
	{name: 'Musfa Madanga', location: [-8.13364,36.66714]},
	{name: 'Chingilile', location: [-8.09336,36.69564]},
	{name: 'Mwalima Njayaga', location: [-8.1166,36.66723]}
]

var statusNames = [
  'ok', 'failed', 'unknown'
]
monitors = _.map( monitors, function( v ) {
  v['status'] = statusNames[Math.floor( Math.random() * 3 )];
  return v;
})

function addMonitor(monitor) {
	monitor = JSON.stringify( monitor );
	var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/monitors',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': monitor.length
    },
    method: 'POST',
    rejectUnauthorized: false,
    agent:false
  };
  var req = http.request(options, function(res) {
    if ( res.statusCode != 201 )
    {
      console.log( "FAILED" );
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);
    }
    res.on('data', function(d) {
      process.stdout.write(d);
    });
    res.on('end', function() {
      process.stdout.write('\n');
    })
  });
  req.write( monitor )
  req.end();

  req.on( 'error', function(e) {
    console.log( "ERROR: " + e );
  } )
}

for ( var i in monitors ) {
	addMonitor( monitors[i] );
}