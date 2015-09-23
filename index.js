var strato = require('./lib/strato');

if ( !process.env.DATABASE_URL )
{
	console.error("Environment variable DATABASE_URL does not exist.");
	process.exit(-1);
}

strato.start({ db: process.env.DATABASE_URL, port: process.env.PORT || 3000 });
