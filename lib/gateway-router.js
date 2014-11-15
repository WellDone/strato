var router = require( './router' )
module.exports = router({
	'sms': require( './gateway/sms' )
});