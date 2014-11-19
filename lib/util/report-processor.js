var reportParser = require('../util/report-parser.js')
var db = require('../db');

var addReport = function( report, monitor, timestamp, callback ) {
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
	db.reports.insert( report, callback );
	db.monitors.update({_id: report.monitors_id}, { $set: { status: report.status } }, { multi: false }, function (err, numReplaced) {
		//done
	})
}

var processReport = function( options, callback ) {
	if ( !options.content || !options.gsmid || !options.timestamp )
		return callback( "Bad report processor arguments." );

	var report = null;
	try
	{
		console.log( options.content )
		report = reportParser(options.content);
	}
	catch (e)
	{
		console.log(e);
		console.log("Report parsing error");
		return callback( "Report parsing error." );
	}
	report.gsmid = options.gsmid;
	db.monitors.find({gsmid: options.gsmid}, function(err, docs) {
		if ( err || !docs || docs.length == 0 )
		{
			db.monitors.insert({
				name: "New monitor (" + options.gsmid + ")",
				location: [0,0],
				gsmid: options.gsmid,
				status: "unknown"
			}, function( err, newMonitor ) {
				var monitor;
				if ( err )
					monitor = null;
				else
					monitor = newMonitor._id;

				addReport( report, monitor, options.timestamp, callback );
			})
		}
		else
		{
			addReport( report, docs[0]._id, options.timestamp, callback );
		}
	});
}

module.exports = processReport;