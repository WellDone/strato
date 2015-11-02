var superagent = require('superagent');
var hostname = 'localhost:8080';
var period = 1000;
var uuid = 2062449410;//Math.floor( Math.random()*(Math.pow(2,32)) );
console.log(uuid);
if ( process.argv.length >= 3 )
{
  hostname = process.argv[2];
}
if ( process.argv.length >= 4 )
{
  period = parseInt(process.argv[3]);
  if ( isNaN(period) )
  {
    console.error("Bad report period.");
    process.exit(1)
  }
}

var sequence = 0;

function ConstructV2Report( value ) {
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

function ConstructV3Report( value ) {
  var timestamp = Math.floor((new Date().getTime() - new Date('January 1, 2000 GMT').getTime())/1000);
  var bytes = new Buffer(108);
  bytes[0] = 3; //version
  bytes[1] = 42; // sequence
  bytes.writeUInt32LE( uuid, 2 ); // uuid
  bytes.writeUInt16LE( 0, 6 ); // flags
  bytes.writeUInt32LE( timestamp, 8 ); // timestamp
  bytes.writeUInt16LE( 650, 12 ); // battery voltage
  bytes[14] = 0x61; // count, min, max
  bytes[15] = 0x05; // count, mean
  bytes[16] = 0x60;
  bytes[17] = 0x0A;

  var zero = (Math.random() < 0.5);
  bytes.writeUInt16LE( Math.floor(Math.random()*100)*10, 18 ) //count
  bytes.writeUInt16LE( (zero)? 0 : Math.floor(Math.random()*200), 20 ) //min
  bytes.writeUInt16LE( (zero)? 0 : (Math.floor(Math.random()*200)+800), 22 ) //max

  for ( var i = 0; i < 10; ++i ) {
    bytes.writeUInt16LE( Math.floor(Math.random()*100), 24+(i*4) ) //count
    bytes.writeUInt16LE( Math.floor(Math.random()*600)+200, 26+(i*4) ) //mean
  }
  return bytes.toString('base64');
}

function ConstructV4Report( value ) {
  var timestamp = Math.floor((new Date().getTime() - new Date('January 1, 2000 GMT').getTime())/1000);
  var bytes = new Buffer(102);
  bytes[0] = 4; //version
  bytes[1] = 0; // reserved
  bytes.writeUInt16LE( 650, 2 ); // battery voltage
  bytes.writeUInt32LE( uuid++, 4 ); // uuid
  bytes.writeUInt32LE( timestamp, 8 ); // timestamp
  
  for ( var i = 0; i < 10; ++i ) {
    bytes.writeUInt32LE( timestamp - 600 + (i * 60), 12 + (i*9) ); // 10 1 minute values
    bytes.writeUInt32LE( Math.floor(Math.random()*10000), 12 + (i*9) + 4 ); //value
    bytes[12+(i*9)+8] = 42; //id
  }
  console.log( bytes );
  return bytes.toString('base64');
}

function SendFakeReport() {
  var url = 'http://' + hostname + '/gateway/http';
  var data = ConstructV4Report();

  console.log("Sending " + JSON.stringify(data) + " to " + url);
  
  superagent.post(url)
    .type('text')
    .send(data)
    .end(function(e,res) {
      console.log("END");
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
      // if ( !res.body.payload.success )
      // {
      //   console.log("Payload indicated error:");
      //   console.log( "\t"+res.body.payload.error );
      //   return;
      // }
      console.log("\tOK" );
    })
}
function SendFakeReportEvery(ms) {
  SendFakeReport();
  setInterval( SendFakeReport, ms );
}

SendFakeReportEvery(period);
