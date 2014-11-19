var expect = require('expect.js')
var gatewayScaffold = require('./_scaffold_.gateway.test');

gatewayScaffold( 'telerivet', function( payload ) {
	return {
		content: payload.content,
		from_number: payload.gsmid,
		time_sent: "" + Math.floor(payload.timestamp.getTime() / 1000)
	}
}, function(payload, res) {
  expect(res.status).to.eql(200);
});
