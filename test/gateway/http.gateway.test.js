var expect = require('expect.js')
var gatewayScaffold = require('./_scaffold_.gateway.test');

gatewayScaffold( 'http', 3, function( payload ) {
	return payload.content;
}, function(payload, res) {
  expect(res.status).to.eql(200);
});
