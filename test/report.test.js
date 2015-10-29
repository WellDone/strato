/* global describe, it */

var parseReport = require('../lib/util/report-parser');
var expect = require('expect.js');

function getBatteryVoltage(rawValue) {
  return rawValue / 1024 * 2.78 * 2;
}

function getReportTimestamp(date) {
  return Math.floor((date - new Date('2000-01-01 UTC')) / 1000);
}

var aggregates = {
  count: 1 << 0,
  sum: 1 << 1,
  mean: 1 << 2,
  min: 1 << 5,
  max: 1 << 6
};

describe('report parser', function() {

  it('throws parsing an empty report', function() {
    function parseEmpty() {
      return parseReport('');
    }

    expect(parseEmpty).to.throwError();
  });

  it('throws parsing a bad version', function() {
    var version = 99;

    var bytes = new Buffer(1);
    bytes[0] = version;

    function parseBadVersion() {
      return parseReport(bytes.toString('base64'));
    }

    expect(parseBadVersion).to.throwError();
  });

  describe('registration report', function() {

    it('parses report', function() {
      var version = 0;
      var errorCount = 123;

      var bytes = new Buffer(2);
      bytes[0] = 0x80 | version;
      bytes[1] = errorCount;

      var report = parseReport(bytes.toString('base64'));

      expect(report.version).to.be(version);
      expect(report.isRegistration).to.be(true);
      expect(report.errorCount).to.be(errorCount);
    });

    it('throws parsing a bad version', function() {
      var version = 1;
      var errorCount = 123;

      var bytes = new Buffer(2);
      bytes[0] = 0x80 | version;
      bytes[1] = errorCount;

      function parseBadVersion() {
        return parseReport(bytes.toString('base64'));
      }

      expect(parseBadVersion).to.throwError();
    });
  });

  describe('v1 report', function() {

    it('can parse a v1 report', function() {
      var version = 1;
      var currentHour = 2;
      var batteryVoltage = 3;
      var hourCount = 4;
      var eventCount = 5;
      var sensorType = 6;

      var buckets = [];
      for (var i = 0; i < 24; i++) {
        buckets.push(i);
      }

      var bytes = new Buffer(104);
      bytes[0] = version;
      bytes[1] = currentHour;
      bytes.writeUInt16LE(batteryVoltage, 2);
      bytes[4] = hourCount;
      bytes[5] = eventCount;
      bytes[6] = sensorType;

      buckets.forEach(function(bucket, i) {
        bytes.writeUInt32LE(bucket, 8 + 4 * i);
      });

      var report = parseReport(bytes.toString('base64'));

      expect(report.version).to.be(1);
      expect(report.currentHour).to.be(currentHour);
      expect(report.batteryVoltage).to.be(getBatteryVoltage(batteryVoltage));
      expect(report.hourCount).to.be(hourCount);
      expect(report.eventCount).to.be(eventCount);
      expect(report.sensorType).to.be(sensorType);
      expect(report.buckets).to.eql(buckets);
    });

    it('throws parsing a bad report length', function() {
      var version = 1;

      var bytes = new Buffer(1);
      bytes[0] = version;

      function parseBadLength() {
        return parseReport(bytes.toString('base64'));
      }

      expect(parseBadLength).to.throwError();
    });
  });

  describe('v2 report', function() {
    it('can parse a v2 report', function() {
      var version = 2;
      var sensor = 3;
      var sequence = 4;
      var flags = 5;
      var batteryVoltage = 6;
      var diagnostics = [7, 8];
      var bulkAggregates = {count: 1, min: 2, max: 3};
      var intervalAggregates = [
        {sum: 1, mean: 2},
        {sum: 3, mean: 4}
      ];
      var interval = {type: 3, step: 2, count: intervalAggregates.length};

      var bytes = new Buffer(30);
      bytes[0] = version;
      bytes[1] = sensor;
      bytes.writeUInt16LE(sequence, 2);
      bytes.writeUInt16LE(flags, 4);
      bytes.writeUInt16LE(batteryVoltage, 6);
      bytes.writeUInt16LE(diagnostics[0], 8);
      bytes.writeUInt16LE(diagnostics[1], 10);
      bytes[12] = aggregates.count | aggregates.min | aggregates.max;
      bytes[13] = aggregates.sum | aggregates.mean;
      bytes[14] = (interval.step << 4) | interval.type;
      bytes[15] = interval.count;

      bytes.writeUInt16LE(bulkAggregates.count, 16);
      bytes.writeUInt16LE(bulkAggregates.min, 18);
      bytes.writeUInt16LE(bulkAggregates.max, 20);

      bytes.writeUInt16LE(intervalAggregates[0].sum, 22);
      bytes.writeUInt16LE(intervalAggregates[0].mean, 24);

      bytes.writeUInt16LE(intervalAggregates[1].sum, 26);
      bytes.writeUInt16LE(intervalAggregates[1].mean, 28);

      var report = parseReport(bytes.toString('base64'));

      expect(report.version).to.be(version);
      expect(report.sensor).to.be(sensor);
      expect(report.sequence).to.be(sequence);
      expect(report.flags).to.be(flags);
      expect(report.batteryVoltage).to.be(getBatteryVoltage(batteryVoltage));
      expect(report.diagnostics).to.eql(diagnostics);
      expect(report.interval).to.eql(interval);
      expect(report.bulkAggregates).to.eql(bulkAggregates);
      expect(report.intervalAggregates).to.eql(intervalAggregates);
    });

    it('throws parsing a bad report length', function() {
      var version = 2;

      var bytes = new Buffer(1);
      bytes[0] = version;

      function parseBadLength() {
        return parseReport(bytes.toString('base64'));
      }

      expect(parseBadLength).to.throwError();
    });
  });

  describe('v3 report', function() {

    it('can parse a v3 report', function() {
      var version = 3;
      var sequence = 4;
      var uuid = 5;
      var flags = 6;
      var timestamp = new Date('2015-03-11 15:23:59 UTC');
      var batteryVoltage = 8;
      var bulkAggregates = {count: 1, min: 2, max: 3};
      var intervalAggregates = [
        {sum: 1, mean: 2},
        {sum: 3, mean: 4}
      ];
      var interval = {type: 3, step: 2, count: intervalAggregates.length};

      var bytes = new Buffer(32);
      bytes[0] = version;
      bytes[1] = sequence;
      bytes.writeUInt32LE(uuid, 2);
      bytes.writeUInt16LE(flags, 6);
      bytes.writeUInt32LE(getReportTimestamp(timestamp), 8);
      bytes.writeUInt16LE(batteryVoltage, 12);
      bytes[14] = aggregates.count | aggregates.min | aggregates.max;
      bytes[15] = aggregates.sum | aggregates.mean;
      bytes[16] = (interval.step << 4) | interval.type;
      bytes[17] = interval.count;

      bytes.writeUInt16LE(bulkAggregates.count, 18);
      bytes.writeUInt16LE(bulkAggregates.min, 20);
      bytes.writeUInt16LE(bulkAggregates.max, 22);

      bytes.writeUInt16LE(intervalAggregates[0].sum, 24);
      bytes.writeUInt16LE(intervalAggregates[0].mean, 26);

      bytes.writeUInt16LE(intervalAggregates[1].sum, 28);
      bytes.writeUInt16LE(intervalAggregates[1].mean, 30);

      var report = parseReport(bytes.toString('base64'));

      expect(report.version).to.be(version);
      expect(report.sequence).to.be(sequence);
      expect(report.uuid).to.be(uuid);
      expect(report.flags).to.be(flags);
      expect(report.timestamp).to.eql(timestamp);
      expect(report.batteryVoltage).to.be(getBatteryVoltage(batteryVoltage));
      expect(report.interval).to.eql(interval);
      expect(report.bulkAggregates).to.eql(bulkAggregates);
      expect(report.intervalAggregates).to.eql(intervalAggregates);
    });

    it('throws parsing a bad report length', function() {
      var version = 3;

      var bytes = new Buffer(1);
      bytes[0] = version;

      function parseBadLength() {
        return parseReport(bytes.toString('base64'));
      }

      expect(parseBadLength).to.throwError();
    });

  });

  describe('v4 report', function() {

    it('can parse a v4 report', function() {
      var version = 4;
      var batteryVoltage = 5;
      var uuid = 6;
      var timestamp = new Date('2015-03-11 15:23:59 UTC');

      var bytes = new Buffer(30);
      bytes[0] = version;
      bytes.writeUInt16LE(batteryVoltage, 2);
      bytes.writeUInt32LE(uuid, 4);
      bytes.writeUInt32LE(getReportTimestamp(timestamp), 8);

      // Add one ignored

      bytes.writeUInt32LE(0xFFFFFFFF, 12);

      // Add one normal

      var entries = [{
        timestamp: new Date('2011-03-11 13:14:21 UTC'),
        value: 1234,
        streamID: 7
      }];

      bytes.writeUInt32LE(getReportTimestamp(entries[0].timestamp), 21);
      bytes.writeUInt32LE(entries[0].value, 25);
      bytes[29] = entries[0].streamID;

      var report = parseReport(bytes.toString('base64'));

      expect(report.version).to.be(version);
      expect(report.batteryVoltage).to.be(getBatteryVoltage(batteryVoltage));
      expect(report.uuid).to.be(uuid);
      expect(report.timestamp).to.eql(timestamp);
      expect(report.entries).to.eql(entries);
    });

    it('throws parsing a bad report length', function() {
      var version = 4;

      var bytes = new Buffer(1);
      bytes[0] = version;

      function parseBadLength() {
        return parseReport(bytes.toString('base64'));
      }

      expect(parseBadLength).to.throwError();
    });

  });
});
