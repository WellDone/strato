function getBatteryVoltage(rawValue) {
  return rawValue / 1024 * 2.78 * 2;
}

function getTimestamp(rawValue) {
  // Timestamp starts in the year 2000.
  return new Date(1000 * (rawValue + 946684800));
}

function getInterval(reportBytes, index) {
  var interval = reportBytes[index];

  return {
    type: interval & 0xF,
    step: interval >> 4,
    count: reportBytes[index + 1]
  };
}

function getAggregateNames(reportBytes, index) {
  var names = ['count', 'sum', 'mean', '<none>', '<none>', 'min', 'max'];

  var aggregates = [];
  var bitset = reportBytes[index];

  for (var i = 0; i < 8; i++) {
    if (bitset & (0x1 << i)) {
      aggregates.push(names[i]);
    }
  }

  return aggregates;
}

function getAggregateValues(reportBytes, index, aggregates) {
  var values = {};

  aggregates.forEach(function(aggregate) {
    values[aggregate] = reportBytes.readUInt16LE(index);
    index += 2;
  });

  return values;
}

function getIntervalAggregateValues(reportBytes, index, aggregates, count) {
  var values = [];

  for (var i = 0; i < count; i++) {
    values.push(getAggregateValues(reportBytes, index, aggregates));
    index += 2 * aggregates.length;
  }

  return values;
}

function getAggregates(reportBytes, index, report) {
  var bulkAggregates = getAggregateNames(reportBytes, index);
  index += 1;

  var intervalAggregates = getAggregateNames(reportBytes, index);
  index += 1;

  report.interval = getInterval(reportBytes, index);
  index += 2;

  report.bulkAggregates =
    getAggregateValues(reportBytes, index, bulkAggregates);
  index += 2 * bulkAggregates.length;

  report.intervalAggregates = getIntervalAggregateValues(
    reportBytes, index, intervalAggregates, report.interval.count);
}

function parseRegistrationReport(reportBytes, version) {
  if (version !== 0) {
    throw new Error('Invalid registration report. Bad version: ' + version);
  }

  var report = {};
  
  report.version = version;
  report.isRegistration = true;
  report.errorCount = reportBytes[1];

  return report;
}

function parseV1Report(reportBytes) {
  if (reportBytes.length !== 104) {
    throw new Error('Invalid v1 report. Bad report length: ' +
                    reportBytes.length);
  }

  var report = {};

  report.version = 1;
  report.currentHour = reportBytes[1];
  report.batteryVoltage = getBatteryVoltage(reportBytes.readUInt16LE(2));
  report.hourCount = reportBytes[4];
  report.eventCount = reportBytes[5];
  report.sensorType = reportBytes[6];
  
  report.buckets = [];
  for (var i = 8; i < 104; i += 4) {
    report.buckets.push(reportBytes.readUInt32LE(i));
  }

  return report;
}

function parseV2Report(reportBytes) {
  if (reportBytes.length < 16) {
    throw new Error('Invalid v2 report. Bad report length: ' +
                    reportBytes.length);
  }

  var report = {};

  report.version = 2;
  report.sensor = reportBytes[1];
  report.sequence = reportBytes.readUInt16LE(2);
  report.flags = reportBytes.readUInt16LE(4);
  report.batteryVoltage = getBatteryVoltage(reportBytes.readUInt16LE(6));

  report.diagnostics = [
    reportBytes.readUInt16LE(8),
    reportBytes.readUInt16LE(10)
  ];

  getAggregates(reportBytes, 12, report);

  return report;
}

function parseV3Report(reportBytes) {
  if (reportBytes.length < 16) {
    throw new Error('Invalid v3 report. Bad report length: ' +
                    reportBytes.length);
  }

  var report = {};

  report.version = 3;
  report.sequence = reportBytes[1];
  report.uuid = reportBytes.readUInt32LE(2);
  report.flags = reportBytes.readUInt16LE(6);
  report.timestamp = getTimestamp(reportBytes.readUInt32LE(8));
  report.batteryVoltage = getBatteryVoltage(reportBytes.readUInt16LE(12));

  getAggregates(reportBytes, 14, report);

  return report;
}

function parseV4Report(reportBytes) {
  if (reportBytes.length < 12) {
    throw new Error('Invalid v4 report. Bad report length: ' +
                    reportBytes.length);
  }

  var report = {};

  report.version = 4;
  report.batteryVoltage = getBatteryVoltage(reportBytes.readUInt16LE(2));
  report.uuid = reportBytes.readUInt32LE(4);
  report.timestamp = getTimestamp(reportBytes.readUInt32LE(8));

  report.entries = [];
  for (var index = 12; index + 9 <= reportBytes.length; index += 9) {

    if (reportBytes.readUInt32LE(index) === 0xFFFFFFFF) {
      continue;
    }

    report.entries.push({
      timestamp: getTimestamp(reportBytes.readUInt32LE(index)),
      value: reportBytes.readUInt32LE(index + 4),
      streamID: reportBytes[index + 8]
    });
  }

  return report;
}

function parseReport(reportValue) {
  var reportBytes = new Buffer(reportValue, 'base64');

  if (reportBytes.length === 0) {
    throw new Error('Invalid report. Empty or invalid base64.');
  }

  var version = reportBytes[0];

  if ((version & 0x80) !== 0) {
    return parseRegistrationReport(reportBytes, version & 0x7F);
  }

  if (version === 1) {
    return parseV1Report(reportBytes);
  }

  if (version === 2) {
    return parseV2Report(reportBytes);
  }

  if (version === 3) {
    return parseV3Report(reportBytes);
  }

  if (version === 4) {
    return parseV4Report(reportBytes);
  }

  throw new Error('Invalid report. Bad version: ' + version);
}

module.exports = parseReport;
