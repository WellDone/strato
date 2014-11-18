var server = require('./lib/server');

var port = process.env['PORT'] || 3000;
console.log("Starting server on port %d...", port);
server.listen( port );