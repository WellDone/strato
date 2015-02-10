var reportParser = require('../util/report-parser.js')
var db = require('../db');

var addReport = function( report, monitor, timestamp, callback ) {
	console.log(report, monitor);

	report.monitors_id = monitor;
	report.gateway = 'sms';
	report.timestamp = timestamp.getTime();

	report.status = "unknown";
	if ( report.bulkAggregates )
	{
		if ( report.bulkAggregates.max == 0 )
			report.status = "failed";
		else
			report.status = "ok";
	}
	db.collection('reports').insert( report, callback );
	db.collection('monitors').update({_id: report.monitors_id}, { $set: { status: report.status } }, { multi: false }, function (err, numReplaced) {
		//done
	})
}

var processReport = function( options, callback ) {
	console.log(options);
	if ( !options.content || !options.received_timestamp )
		return callback( "Bad report processor arguments." );

	var report = null;
	try
	{
		console.log( options.content )
		report = reportParser(options.content);
		if ( !options.gsmid && !report.uuid )
			return callback( "No momo identifier found in report." );			
	}
	catch (e)
	{
		console.log(e);
		console.log("Report parsing error");
		return callback( "Report parsing error." );
	}
	if ( options.gsmid )
		report.gsmid = options.gsmid;

	var query = {};
	if ( report.uuid )
	{
		query = {uuid: report.uuid}
	}
	else
	{
		query = {gsmid: options.gsmid}
	}
	db.collection('monitors').findOneAsync(query)
	.then(function(doc) {
		console.log(doc);
		if ( !doc )
		{
			db.collection('monitors').insert({
				name: "New monitor (" + options.gsmid || report.uuid + ")",
				location: [0,0],
				gsmid: options.gsmid,
				uuid: report.uuid,
				status: "unknown"
			}, function( err, results ) {
				console.log(err);
				var monitor;
				if ( err )
					monitor = null;
				else
					monitor = results[0]._id;

				addReport( report, monitor, options.timestamp, callback );
			})
		}
		else
		{
			console.log("doc", doc);
			addReport( report, doc._id, options.timestamp, callback );
		}
	})
	.catch(function(err) {
		console.log(err);
	});
}

module.exports = processReport;