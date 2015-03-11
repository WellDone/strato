var BPromise = require('bluebird');
var mongodb = BPromise.promisifyAll(require('mongodb'));
var MongoClient = mongodb.MongoClient;
BPromise.promisifyAll(mongodb.Cursor.prototype);

var DB = function() {
	this.db = null;

	this.ObjectID = mongodb.ObjectID;
};

DB.prototype.collection = function(name) {
	return this.db.collection(name);
}

DB.prototype.connect = function() {
	if ( !process.env.DATABASE_URL )
	{
		console.error("Environment variable DATABASE_URL does not exist.");
		process.exit(-1);
	}
	return MongoClient.connectAsync( process.env.DATABASE_URL )
		.bind(this)
		.then(function(db) {
			this.db = db;
		})
		.bind(null);
};

module.exports = new DB();

// db.monitors.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
// 	if ( err ) {
// 		console.log( err );
// 		process.exit();
// 	}
// });