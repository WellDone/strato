var expect = require('expect.js')
var gatewayScaffold = require('./_scaffold_.gateway.test');

gatewayScaffold( 'twilio', function( payload ) {
	return {
		Body: payload.content,
		From: payload.gsmid
	}
}, function(payload, res) {
  expect(res.status).to.eql(200);
});
