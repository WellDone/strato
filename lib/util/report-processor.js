var reportParser = require('../util/report-parser.js')
var _ = require('lodash');
var db = require('../db');

var addReport = function( report, options, callback ) {
	options = _.clone(options);
	options.report = _.cloneDeep(report);
	options.status = "unknown";
	if ( options.report.bulkAggregates )
	{
		if ( options.report.bulkAggregates.max == 0 )
			options.status = "failed";
		else
			options.status = "ok";
	}

	console.log(options);
	db.collection('reports').insert( options, callback );
	db.collection('monitors').update({_id: options.monitors_id}, { $set: { status: options.status } }, { multi: false }, function (err, numReplaced) {
		console.log(err, numReplaced);
	})
}

var processReport = function( options, callback ) {
	console.log(options);
	if ( !options.content )
		return callback( "Bad report processor arguments." );

	var report = null;
	try
	{
		console.log( options.content )
		report = reportParser(options.content);
		if ( !options.gsmid && ( !report.uuid && report.uuid != 0 ) )
			return callback( "No momo identifier found in report." );			
	}
	catch (e)
	{
		console.log(e);
		console.log("Report parsing error");
		return callback( "Report parsing error." );
	}

	if ( !report.uuid )
	{
		console.error( "Report does not have a valid UUID!" );
		return;
	}
	
	var query = {uuid: report.uuid}
	db.collection('monitors').findOneAsync(query)
	.then(function(doc) {
		console.log(doc);
		if ( !doc )
		{
			db.collection('monitors').insert({
				name: "New monitor (" + report.uuid + ")",
				location: [0,0],
				uuid: report.uuid,
				status: "unknown"
			}, function( err, results ) {
				console.log(err);
				if ( err )
					options.monitors_id = null;
				else
					options.monitors_id = results[0]._id.toString();

				addReport( report, options, callback );
			})
		}
		else
		{
			options.monitors_id = doc._id.toString();
			if ( doc.owner )
				options.owner = doc.owner;
			addReport( report, options, callback );
		}
	})
	.catch(function(err) {
		console.log(err);
	});
}

module.exports = processReport;