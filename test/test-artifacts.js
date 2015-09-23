var Artifacts = function() {
	this.port = 3000 + Math.floor(Math.random() * 1000);
	this.dbName = 'test-' + this.port;
	this.db = 'mongodb://localhost:27017/' + this.dbName;
	this.username = 'test.user@example.com';
	this.password = 'l33tp455w0rd!';
	this.url = 'http://localhost:' + this.port;
	this.token = null;
};

module.exports = new Artifacts();
