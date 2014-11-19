var superagent = require('superagent');
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
  superagent.post('http://localhost:3000/api/v1/monitors')
    .send(monitor)
    .end(function(e,res) {
      if ( e )
      {
        console.log( "ERR %s", e );
        return;
      }
      if ( res.statusCode != 201 )
      {
        console.log("HTTP ERROR ", res.statusCode);
        console.log( res.text );
        return;
      }
      console.log("\t" + res.body._id);
    });
}

for ( var i in monitors ) {
	addMonitor( monitors[i] );
}
console.log( "Creating %d monitors...", monitors.length );