var superagent = require('superagent')
var expect = require('expect.js')
var _ = require('lodash')

describe('REST api server, monitors resource:', function(){
  var id = null;
  var name = 'TestMonitor'
  var location = [0,0]

  it('create new monitor', function(done){
    superagent.post('http://localhost:3000/api/v1/monitors')
      .send({
      	name: name,
        location: location
      })
      .end(function(e,res){
      	expect(e).to.eql(null);
      	expect(res.status).to.eql(201);
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
        expect(res.body._id.length).to.eql(16);
        id = res.body._id;
        done();
      })
  });
  it('fetch new monitor', function(done){
  	superagent.get('http://localhost:3000/api/v1/monitors/' + id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
  			expect(res.body._id).to.eql(id);
  			expect(res.body.name).to.eql(name);
  			expect(res.body.location).to.eql(location);
  			done()
  		})
  })

  it('get the empty reports list', function(done) {
  	superagent.get('http://localhost:3000/api/v1/monitors/' + id + '/reports')
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			expect(res.body).to.be.an('object');
        expect(res.body).to.be.an('array');
  			expect(res.body.length).to.eql(0);
  			done()
  		})
  })
  var reports = [];
  _.forEach( ['a','b','c'], function(dummy_value) {
  	it('post a report', function(done){
	  	superagent.post('http://localhost:3000/api/v1/monitors/' + id + '/reports')
	  		.send({
	  			value: dummy_value
	  		})
	  		.end(function(e,res){
	  			expect(e).to.eql(null);
	      	expect(res.status).to.eql(201);
	        expect(res.body).to.be.an('object');
	        expect(res.body).not.to.be.an('array');
	        expect(res.body._id.length).to.eql(16);
	        expect(res.body.value).to.eql(dummy_value);
	        expect(res.body.monitors_id).to.eql(id);
	        reports.push(res.body._id);
	        done();
	  		})
	  })
  })

  it('check that all the reports show up', function(done) {
  	superagent.get('http://localhost:3000/api/v1/monitors/' + id + '/reports')
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			expect(res.body).to.be.an('object');
        expect(res.body).to.be.an('array');
  			expect(res.body.length).to.eql(reports.length);
  			var ticklist = _.clone(reports);
  			_.forEach( res.body, function( report, i ) {
  				ticklist = _.without( ticklist, report._id );
  			} );
  			expect(ticklist.length).to.eql(0);
  			done()
  		})
  })

  it('try getting a report individually', function(done) {
    superagent.get('http://localhost:3000/api/v1/monitors/' + id + '/reports/' + reports[0])
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.an('array');
        expect(res.body._id).to.eql(reports[0]);
        expect(res.body.monitors_id).to.eql(id);
        done()
      })
  })

  it('delete the reports', function(done) {
  	_.forEach( reports, function( report_id ) {
	  	superagent.del('http://localhost:3000/api/v1/monitors/' + id + '/reports/'+ report_id)
	  		.end(function(e,res){
	  			expect(e).to.eql(null);
	  			expect(res.status).to.eql(200);
	  			reports = _.without( reports, report_id );
	  			if ( reports.length == 0 )
	  				done();
		  		})
  	});
  })
  it('get the empty reports list', function(done) {
  	superagent.get('http://localhost:3000/api/v1/monitors/' + id + '/reports')
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			expect(res.body).to.be.an('object');
        expect(res.body).to.be.an('array');
  			expect(res.body.length).to.eql(0);
  			done();
  		})
  })

  it('delete the monitor', function(done){
  	superagent.del('http://localhost:3000/api/v1/monitors/' + id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(200);
  			done();
  		})
  })

  it('fetch the non-existent deleted monitor', function(done){
  	superagent.get('http://localhost:3000/api/v1/monitors/' + id)
  		.end(function(e,res){
  			expect(e).to.eql(null);
  			expect(res.status).to.eql(404);
  			done();
  		})
  })
})