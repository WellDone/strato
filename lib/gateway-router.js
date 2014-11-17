var router = require( './util/router' )
module.exports = router({
	'sms': require( './gateway/sms' )
});