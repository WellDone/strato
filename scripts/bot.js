var superagent = require('superagent');

var sequence = 0;

function ConstructReport( value ) {
  var bytes = new Buffer(104);

  bytes[0] = 2; //version
  bytes[1] = 42; //sensor ID
  bytes.writeUInt16LE( sequence++, 2 );
  bytes.writeUInt16LE( 0, 4 ); //flags
  bytes.writeUInt16LE( 650, 6 ); //battery voltage
  bytes.writeUInt16LE( 0, 8 ); //diagnostics1
  bytes.writeUInt16LE( 0, 10 ); //diagnostics2
  bytes[12] = 0x61; // count, min, max
  bytes[13] = 0x05; // count, mean
  bytes[14] = 0x60;
  bytes[15] = 0x0A;

  bytes.writeUInt16LE( Math.floor(Math.random()*100)*10, 16 ) //count
  bytes.writeUInt16LE( Math.floor(Math.random()*200), 18 ) //min
  bytes.writeUInt16LE( (Math.random() < 0.5)? 0 : (Math.floor(Math.random()*200)+800), 20 ) //max

  for ( var i = 0; i < 10; ++i ) {
    bytes.writeUInt16LE( Math.floor(Math.random()*100), 22+(i*4) ) //count
    bytes.writeUInt16LE( Math.floor(Math.random()*600)+200, 24+(i*4) ) //mean
  }

  return bytes.toString( 'base64' );
}

function SendFakeReport() {
  var data = {
    from: "+123456",
    message: ConstructReport()
  }
  
  superagent.post('http://localhost:3000/gateway/sms')
    .send(data)
    .end(function(e,res) {
      if ( e )
      {
        console.log( "ERR %s", e );
        return;
      }
      if ( res.statusCode != 200 )
      {
        console.log("HTTP ERROR ", res.statusCode);
        console.log( res.text );
        return;
      }
      console.log("\t" + res.body._id);
    })
}
function SendFakeReportEvery(ms) {
  setInterval( SendFakeReport, ms );
}

SendFakeReportEvery(process.argv[2] || 1000);
