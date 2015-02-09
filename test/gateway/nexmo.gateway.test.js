var expect = require('expect.js')
var gatewayScaffold = require('./_scaffold_.gateway.test');

gatewayScaffold( 'nexmo', 2, function( payload ) {
	return {
		text: payload.content,
		msisdn: payload.gsmid,
		"message-timestamp": payload.timestamp.getTime()
	}
}, function(payload, res) {
  expect(res.status).to.eql(200);
});
