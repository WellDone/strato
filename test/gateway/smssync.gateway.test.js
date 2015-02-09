var expect = require('expect.js')
var gatewayScaffold = require('./_scaffold_.gateway.test');

gatewayScaffold( 'smssync', 2, function(payload) {
  return {
    message: payload.content,
    from: payload.gsmid,
    send_timestamp: payload.timestamp.getTime()
  }
}, function(payload, res) {
  expect(res.status).to.eql(200);
  expect(res.body).to.be.an('object');
  expect(res.body).not.to.be.an('array');
  expect(res.body.payload.success).to.eql(true);
  expect(res.body.payload.error).to.eql(null);
});
