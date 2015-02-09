var router = require( './util/router' )
module.exports = router({
	'nexmo': require( './gateway/nexmo' ),
	'smssync': require( './gateway/smssync' ),
	'twilio': require( './gateway/twilio' ),
	'telerivet': require( './gateway/telerivet' ),
	'http': require( './gateway/http' )
});