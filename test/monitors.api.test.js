var superagent = require('superagent')
var expect = require('expect.js')

describe('REST api server, monitors resource:', function(){
  var id = null;
  var name = 'TestMonitor'
  var location = [0,0]

  it('create new monitor', function(done){
    superagent.post('http://localhost:3000/api/monitors')
      .send({
      	name: name,
        location: location
      })
      .end(function(e,res){
      	expect(e).to.eql(null);
      	console.log(res.body)
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
        expect(res.body._id.length).to.eql(16);
        id = res.body._id;
        done();
      })
  });
  it('fetch new monitor', function(done){
  	superagent.get('http://localhost:3000/api/monitors/' + id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
  			expect(res.body._id).to.eql(id);
  			expect(res.body.name).to.eql(name);
  			expect(res.body.location).to.eql(location);
  			done()
  		})
  })
  it('delete the monitor', function(done){
  	superagent.del('http://localhost:3000/api/monitors/' + id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			done();
  		})
  })
})