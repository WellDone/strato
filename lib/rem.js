var db = require('./db');
var express = require('express');
var _ = require('lodash');

var REM = function(options) {
	var router = express.Router();
	var engine = db[options.name];
	options.id_key = options.id_key || '_id';
	options.filter = options.filter || {};
	options.defaults = options.defaults || {};
	options.immutable_keys = options.immutable_keys || {};
	options.children = options.children || {};
	if (_.isArray(options.children))
		options.children = _.reduce(options.children, function(result, child) {
			result[child] = { name: child };
			return result;
		}, {});

	var buildQuery = function(req) {
		var query = {};
		_.forEach( options.filter, function( v, i ) {
			if ( _.isFunction(v) ) {
				query[i] = v(req);
			} else {
				query[i] = v;
			}
		} );
		return query;
	}
	var buildDefaults = function(req) {
		var obj = {};
		_.forEach( options.defaults, function( v, i ) {
			if ( _.isFunction(v) ) {
				obj[i] = v(req);
			} else {
				obj[i] = v;
			}
		} );
		return obj;
	}
	var makeForeignKey = function(target) {
		return target + "_id"
	}

	router.get( '/', function(req, res) {
		var query = buildQuery(req);
		engine.find(query)
			.exec(function (err, docs) {
				if ( err )
					return res.status(500).send("An unexpected error occurred.");
				else
					return res.status(200).send(docs);
			});
	})
	router.post( '/', function(req, res) {
		// if ( !req.body 
		// 	|| !req.body.name 
		//   || !req.body.location 
		//   || !Array.isArray(req.body.location) 
		//   || req.body.location.length != 2 )
		// {
		// 	console.log( "Invalid request!")
		// 	return res.status(400).send("Invalid parameters.");
		// }

		// TODO: CONSTRAINTS

		var badKeys = _.reduce( options.immutable_keys, function( result, key ) {
			if ( _.has( req.body, key) )
				result.push( key );
			return result;
		}, []);
		if ( badKeys.length > 0 )
			return res.status(400).send("The following keys are immutable: " + badKeys.join( ", " ) );
		var obj = _.extend( buildDefaults(req), req.body );

		engine.insert(obj, function (err, newDoc) {
			if ( err ) {
				console.log( "Error occurred creating resource, err: %s", err );
				return res.status(500).send("Something bad happened...");
			}
			console.log( "Successfully created document with ID '%s'", newDoc._id );
			res.status(201).send(newDoc);
		});
	});

	var findResource = function(req,res,next) {
		var query = buildQuery(req);
		query[options.id_key] = req.params.id;

		engine.find(query, function (err, docs) {
			if ( err )
				return res.status(500).send("An unexpected error occurred.");
			else if ( !docs || docs.length == 0 )
				return res.status(404).send("Resource not found.");
			else if ( docs.length != 1 )
				return res.status(500).send("This should never happen.");
			
			req.resource = req.resource || {};
			req.resource[options.name] = docs[0];
			next();
		});
	}
	router.get( '/:id', findResource, function(req, res) {
		if ( !req.resource[options.name] )
			res.status(500).send("This should never happen.");

		res.status(200).send(req.resource[options.name]);
	})
	router.delete( '/:id', function(req, res) {
		var query = buildQuery(req);
		query[options.id_key] = req.params.id;

		engine.remove(query, {}, function(err, num) {
			if ( err )
				return res.status(500).send(err);
			else if ( num == 0 )
				return res.status(404).send("Resource not found.");
			else if ( num != 1 )
				return res.status(500).send("This should never happen.");

			return res.status(200).send("OK");
		})
	})

	_.forEach( options.children, function(child_options, child_name) {
		if ( _.isString(child_options) )
			child_options = { name: child_options };

		child_options.filter = child_options.filter || {};
		child_options.filter[makeForeignKey(options.name)] = function(req) {
			return req.resource[options.name][options.id_key];
		}
		child_options.defaults = child_options.defaults || {};
		child_options.defaults[makeForeignKey(options.name)] = function(req) {
			return req.resource[options.name][options.id_key];
		}

		child_options.immutable_keys = child_options.immutable_keys || [];
		child_options.immutable_keys.push( makeForeignKey(options.name) );

		router.use( '/:id/' + child_name, findResource, REM(child_options) );
	})

	return router;
}

module.exports = REM;