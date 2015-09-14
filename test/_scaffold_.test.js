var strato = require('../lib/strato');
var assert = require('assert');
var artifacts = require('./test-artifacts');
var superagent = require('superagent');

var Promise = require('bluebird');
var mongodb = Promise.promisifyAll(require('mongodb'));
Promise.promisifyAll(mongodb.Cursor.prototype);

var MongoClient = Promise.promisifyAll(mongodb.MongoClient);

before(function() {
	this.timeout(5000);

	console.log('Constructing test scaffolding...');
	var users = require('../lib/util/users.js')({ db: artifacts.db, port: artifacts.port });

	return strato.start(artifacts)
	.then(function() {
		console.log('Creating test user...');
		return users.create(artifacts.username, artifacts.password);
	})
	.then(function() {
		console.log('Granting test user master permissions...');
		return users.update(artifacts.username, { masterOfTheUniverse: true });
	})
	.then(function() {
		console.log('Log in and obtain user token...');

		return new Promise(function(resolve, reject) {
			superagent
			.post(artifacts.url + '/api/v1/_login')
			.send( {
				login: artifacts.username,
				password: artifacts.password
			})
			.end(function(e, res) {
				if (e) {
					reject(e);
				}
				else if (res.status !== 200) {
					reject(new Error(res.status + ': ' + res.text));
				}
				else {
					artifacts.token = res.text;
					resolve();
				}
			});
		});
	})
	.then(function() {
		console.log('...scaffolding constructed.');
	});
});

after(function() {
	this.timeout(5000);

	console.log('Cleaning up database %s', artifacts.db);

	return MongoClient.connectAsync(artifacts.db)
	.then(function(db) {
		return db.dropDatabase();
	});
});
