function getBatteryVoltage( rawValue ) {
  return rawValue / 1024 * 2.78 * 2;
}

var agg_names = ['count','sum','mean','<none>','<none>','min','max'];
var interval_types = ['second', 'minute', 'hour', 'day'];

function convertToJSTimestamp( deviceTimestamp ) {
  deviceTimestamp += 946684800; // timestamp starts in the year 2000
  deviceTimestamp *= 1000; // ms to s
  return deviceTimestamp;
}
function parseReport( reportValue ) {
  var reportBytes = new Buffer( reportValue, 'base64' );
  var report = {};
  if ( reportBytes.length == 0 )
    throw new Error( "MoMo reports must be encoded as base64." );
  report.version = reportBytes[0];
  if ( report.version & 0x80 ) {
    // Registration
    report.isRegistration = true;
    report.version &= 0x7F; //Mask out the high registration marker bit.
    if ( report.version == 0 ) {
      report.errorCount = reportBytes[1];
      return report;
    } else {
      throw new Error( "Unrecognized registration version." );
      return;
    }
  }
  else if ( report.version == 1 ) //TODO: Make extensible
  {
    if ( reportBytes.length != 104 ) {
      throw new Error( "Poorly formed report (version 1)" );
    }
    report.currentHour = reportBytes[1]
    report.batteryVoltage = getBatteryVoltage( reportBytes.readUInt16LE(2) );
    report.hourCount = reportBytes[4];
    report.eventCount = reportBytes[5]
    report.sensorType = reportBytes[6];
    var __unused = reportBytes[7]
    var bucketString = reportBytes.slice(8);
    report.buckets = [];
    for (var i=0; i<24; ++i)
    {
      report.buckets[i] = bucketString.readUInt32LE(i*4);
    }
    console.log( "Parsed report." );
    console.log( report );
    return report;
  }
  else if ( report.version == 2 )
  {
    if ( reportBytes.length < 16 ) {
      throw new Error( "Poorly formed report (version 2)" );
    }
    report.sensor = reportBytes[1];
    report.sequence = reportBytes.readUInt16LE(2);
    report.flags = reportBytes.readUInt16LE(4);
    report.batteryVoltage = reportBytes.readUInt16LE(6) / 1024 * 2.8 * 2;
    report.diagnostice = [ reportBytes.readUInt16LE(8), reportBytes.readUInt16LE(10) ];

    var bulkAggregateFunctions = []
    agg = reportBytes[12]
    for ( var i = 0; i < 8; ++i )
    {
      if ( agg & ( 0x1 << i ) )
        bulkAggregateFunctions.push( agg_names[i] )
    }

    var intervalAggregateFunctions = []
    agg = reportBytes[13]
    for ( var i = 0; i < 8; ++i )
    {
      if ( agg & ( 0x1 << i ) )
        intervalAggregateFunctions.push( agg_names[i] )
    }

    var interval_def = reportBytes[14];
    report.interval = {
      type: (interval_def & 0xF),
      step: (interval_def >> 4),
      count: reportBytes[15]
    }

    var index = 16;
    report.bulkAggregates = {};
    for ( var f in bulkAggregateFunctions )
    {
      report.bulkAggregates[bulkAggregateFunctions[f]] = reportBytes.readUInt16LE(index);
      index += 2;
    }

    report.intervalAggregates = [];
    for ( var i = 0; i < report.interval.count; ++i )
    {
      var aggregate = {};
      for ( var f in intervalAggregateFunctions )
      {
        aggregate[intervalAggregateFunctions[f]] = reportBytes.readUInt16LE(index);
        index += 2;
      }
      report.intervalAggregates.push( aggregate );
    }
    console.log( "Parsed report." );
    console.log( report );
    return report;
  }
  else if ( report.version == 3 )
  {
    if ( reportBytes.length < 16 ) {
      throw new Error( "Poorly formed report (version 2)" );
    }
    report.sequence = reportBytes[1];
    report.uuid = reportBytes.readUInt32LE(2);
    report.flags = reportBytes.readUInt16LE(6);
    report.timestamp = new Date( convertToJSTimestamp( reportBytes.readUInt32LE(8) ) );
    report.batteryVoltage = reportBytes.readUInt16LE(12) / 1024 * 2.8 * 2;

    var bulkAggregateFunctions = []
    agg = reportBytes[14]
    for ( var i = 0; i < 8; ++i )
    {
      if ( agg & ( 0x1 << i ) )
        bulkAggregateFunctions.push( agg_names[i] )
    }

    var intervalAggregateFunctions = []
    agg = reportBytes[15]
    for ( var i = 0; i < 8; ++i )
    {
      if ( agg & ( 0x1 << i ) )
        intervalAggregateFunctions.push( agg_names[i] )
    }

    var interval_def = reportBytes[16];
    report.interval = {
      type: (interval_def & 0xF),
      step: (interval_def >> 4),
      count: reportBytes[17]
    }

    var index = 18;
    report.bulkAggregates = {};
    for ( var f in bulkAggregateFunctions )
    {
      report.bulkAggregates[bulkAggregateFunctions[f]] = reportBytes.readUInt16LE(index);
      index += 2;
    }

    report.intervalAggregates = [];
    for ( var i = 0; i < report.interval.count; ++i )
    {
      var aggregate = {};
      for ( var f in intervalAggregateFunctions )
      {
        aggregate[intervalAggregateFunctions[f]] = reportBytes.readUInt16LE(index);
        index += 2;
      }
      report.intervalAggregates.push( aggregate );
    }
    console.log( "Parsed report." );
    console.log( report );
    return report;
  }
  else if ( report.version == 4 )
  {
    // Byte 1 reserved, unused.
    report.batteryVoltage = reportBytes.readUInt16LE(2) / 1024 * 2.8 * 2;
    report.uuid = reportBytes.readUInt32LE(4);
    report.timestamp = new Date( convertToJSTimestamp( reportBytes.readUInt32LE(8) ) );
    report.entries = [];
    var i = 12;
    while ( i < reportBytes.length )
    {
      if ( i + 9 >= reportBytes.length )
      {
        console.error("Bad report format, dropped " + (reportBytes.length - i) + "bytes");
        break;
      }
      var entry = {
        timestamp: new Date( convertToJSTimestamp( reportBytes.readUInt32LE(i) ) ),
        value: reportBytes.readUInt32LE(i+4),
        streamID: reportBytes[i+8]
      }

      if ( reportBytes.readUInt32LE(i) == 0xFFFFFFFF )
        console.error("Dummy report entry encountered. Skipping.")
      else
        report.entries.push(entry);
      
      i += 9;
    }

    console.log( "Parsed report." );
    console.log( report );

    return report;
  }
  else
  {
    throw new Error( "Unrecognized MoMo report version " + report.version + "." );
  }
}

module.exports = parseReport;