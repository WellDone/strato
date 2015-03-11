var superagent = require('superagent')
var expect = require('expect.js')
var _ = require('lodash')

function ConstructReport( version ) {
  var bytes;
  if ( version == 2 )
  {
    bytes = new Buffer(104);
    bytes[0] = 2; //version
    bytes[1] = 42; //sensor ID
    bytes.writeUInt16LE( 0, 2 );
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
  }
  else if ( version == 3 )
  {
    var timestamp = Math.floor((new Date().getTime() - new Date('January 1, 2000 GMT').getTime())/1000);
    bytes = new Buffer(108);
    bytes[0] = 3; //version
    bytes[1] = 42; // sequence
    bytes.writeUInt32LE( 42, 2 ); // uuid
    bytes.writeUInt16LE( 0, 6 ); // flags
    bytes.writeUInt32LE( timestamp, 8 ); // timestamp
    bytes.writeUInt16LE( 650, 12 ); // battery voltage
    bytes[14] = 0x61; // count, min, max
    bytes[15] = 0x05; // count, mean
    bytes[16] = 0x60;
    bytes[17] = 0x0A;

    bytes.writeUInt16LE( Math.floor(Math.random()*100)*10, 18 ) //count
    bytes.writeUInt16LE( Math.floor(Math.random()*200), 20 ) //min
    bytes.writeUInt16LE( (Math.random() < 0.5)? 0 : (Math.floor(Math.random()*200)+800), 22 ) //max

    for ( var i = 0; i < 10; ++i ) {
      bytes.writeUInt16LE( Math.floor(Math.random()*100), 24+(i*4) ) //count
      bytes.writeUInt16LE( Math.floor(Math.random()*600)+200, 26+(i*4) ) //mean
    }
  }

  return bytes.toString( 'base64' );
}

all_versions = [ 3 ];
function testGateway( gatewayName, minVersion, payloadFormatter, callback ) {
  describe("Gateway '" + gatewayName + "'", function(){
    before( function() {
      
    })
    var monitor = null;
    var uuid = 42;
    var gsmid = "+5555555";
    before(function(done){
      console.log("Creating monitor...");
      superagent.post('http://localhost:3000/api/v1/monitors')
        .send({
          name: 'TestMonitor',
          location: [0,0],
          uuid: uuid,
          gsmid: gsmid
        })
        .end(function(e,res){
          expect(e).to.eql(null);
          expect(res.status).to.eql(201);
          expect(res.body).to.be.an('object');
          expect(res.body).not.to.be.an('array');
          expect(res.body._id.length).to.eql(24);
          monitor = res.body;
          done();
        })
    });
    var reportID = null;
    var versions = _.filter( all_versions, function(v) { return v >= minVersion; } );
    versions.forEach(function(v) {
      describe("Report version " + v, function() {
        var report = ConstructReport(v);
        console.log(report);
        it('post a report to the gateway', function(done){
          var payload = {
            gsmid: gsmid,
            timestamp: new Date(),
            content: report
          }
          payload = payloadFormatter(payload);
          superagent.post('http://localhost:3000/gateway/' + gatewayName)
            .type(typeof payload == 'string'? 'text':'json')
            .send(payload)
            .end(function(e,res){
              expect(e).to.eql(null);
              callback(payload, res);
              done()
            })
        })

        it('get the report to ensure it was created', function(done) {
          superagent.get('http://localhost:3000/api/v1/monitors/' + monitor._id + '/reports')
            .end(function(e,res){
              expect(e).to.eql(null);
              expect(res.status).to.eql(200);
              expect(res.body).to.be.an('object');
              expect(res.body).to.be.an('array');
              expect(res.body.length).to.eql(1);
              expect(res.body[0].monitors_id).to.eql(monitor._id);
              reportID = res.body[0]._id;
              done();
            })
        })
        it('clean up the report', function(done) {
          superagent.del('http://localhost:3000/api/v1/monitors/' + monitor._id + '/reports/' + reportID)
            .end(function(e,res){
              expect(e).to.eql(null);
              expect(res.status).to.eql(200);
              done()
            })
        });
      });
    });
    
    after(function(done){
      console.log("Deleting monitor...");
      superagent.del('http://localhost:3000/api/v1/monitors/' + monitor._id)
        .end(function(e,res){
          expect(e).to.eql(null);
          expect(res.status).to.eql(200);
          done();
        })
    })
  })
}
module.exports = testGateway;