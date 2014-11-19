var superagent = require('superagent')
var expect = require('expect.js')
var _ = require('lodash')

function ConstructReport() {
  var bytes = new Buffer(104);

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

  return bytes.toString( 'base64' );
}

describe('SMSSync Gateway:', function(){
  var monitor = null;
  var gsmid = "+5555555555";
  it('create new monitor', function(done){
    superagent.post('http://localhost:3000/api/v1/monitors')
      .send({
      	name: 'TestMonitor',
        location: [0,0],
        gsmid: gsmid
      })
      .end(function(e,res){
      	expect(e).to.eql(null);
      	expect(res.status).to.eql(201);
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
        expect(res.body._id.length).to.eql(16);
        monitor = res.body;
        done();
      })
  });
  var reportID = null;
  it('post a report to the gateway', function(done){
  	superagent.post('http://localhost:3000/gateway/smssync')
      .send({
        from: gsmid,
        message: ConstructReport()
      })
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
        expect(res.body.payload.success).to.eql(true);
        expect(res.body.payload.error).to.eql(null);
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
        expect(res.body[0].gsmid).to.eql(monitor.gsmid);
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
  })
  
  it('delete the monitor', function(done){
  	superagent.del('http://localhost:3000/api/v1/monitors/' + monitor._id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			done();
  		})
  })
})