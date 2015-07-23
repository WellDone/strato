var myID;
var dataGraph;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function prettifyTimeDelta(start, end) {
	delta = end - start;
	delta /= 1000;
	delta = Math.floor(delta);
	if ( delta < 60 )
		return "less than 1 minute";
	delta /= 60;
	delta = Math.floor(delta);
	if ( delta < 60 )
		return "" + delta + " minutes";
	delta /= 60;
	delta = Math.floor(delta);
	if ( delta < 24 )
		return "" + delta + " hours";
	delta /= 24;
	delta = Math.floor(delta);
	return "" + delta + " days";
}

var offset = 0;
var data = [];
var keys = {}

function addKey(key) {
	keys[key] = true;
	$('#metric-selector').append("<li><a href='#' >"+key+"</a></li>")
	$('#metric-selector li').click(function(e) {
		e.preventDefault();
		selectKey($(this).text());
	})
}
function selectKey(key) {
	selectedKey = key;
	$('#metric-selected').text(key);
	if ( !dataGraph )
		return;
	_.forEach(_.keys(keys), function(k, i) {
		dataGraph.setVisibility(i, k==key);
	});
}
var selectedKey;

function redraw()
{
	$('#monitor-data-chart').html("");
	if ( data.length == 0 )
		return;
	dataGraph = new Dygraph(document.getElementById('monitor-data-chart'),
		data,
		{
			// customBars: true,
      title: 'Data',
      //ylabel: 'Temperature (F)',
      legend: 'always',
      labelsDivStyles: { 'textAlign': 'right' },
      showRangeSelector: true,
      showRoller: true,
			labels: _.flatten(['Time', _.keys(keys)])
		});
	// dataGraph = Morris.Line({
	// 	element: 'monitor-data-chart',
	// 	data: data,
	// 	xkey: 'timestamp',
	// 	ykeys: [selectedKey],
	// 	labels: [selectedKey]
	// })
}
addKey('battery');
selectKey('battery');

function refresh() {
	$.getJSON( "/api/v1/monitors/" + myID + "/reports?sort=-report.timestamp&skip=" + offset, function(reports) {
		offset += reports.length;
		if ( offset + reports.length == 0 )
		{
			$('#last-report-time').text("NONE");
			return;
		}
		if ( reports.length == 0 ) // None to add
			return;
		$('#last-report-time').text( prettifyTimeDelta(new Date(reports[0].report.timestamp).getTime()*1000, new Date().getTime()) + " ago" );

		_.forEach(reports, function(r) {
			var item = [];
			_.fill(item, null,  0, _.keys(keys).length+1);
			item[0] = new Date(r.report.timestamp).getTime()*1000 + new Date('January 1, 1970 GMT').getTime();
			item[0] = new Date(item[0]);
			item[_.indexOf(_.keys(keys), 'battery')+1] = r.report.batteryVoltage;
			_.forEach( r.report.bulkAggregates, function(val, key) {
				if ( !keys[key] )
				{
					addKey(key);
				}
				item[_.indexOf(_.keys(keys),key)+1] = val;
			})
			data.push(item);
		});

		if ( !dataGraph )
			redraw();
		else
			dataGraph.updateOptions({'file': data, 'labels': _.keys(keys)});

		selectKey(selectedKey);
	})
}

$(function() {
	myID = getParameterByName('id');
	$.getJSON( "/api/v1/monitors/" + myID, function(monitor) {
		console.log(monitor);
		$('#monitor-name').text(monitor.name)
			.editable({
		    type: 'text',
		    title: 'Enter name',
		    mode: 'inline'
			})
			.on('save', function(e, params) {
				var opts = {
					type: 'patch',
					url: '/api/v1/monitors/'+myID,
					data: {
						name: params.newValue
					}
				}
				$.ajax( opts, false );
			})
		refresh();
		setInterval(refresh , 2000);
	});
});