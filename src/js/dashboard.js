// Morris.Area({
// 	element: 'dashboard-history-chart',
// 	data: [
// 		{ year: '2008', total: 1000 },
// 		{ year: '2009', total: 1500 },
// 		{ year: '2010', total: 2500 },
// 		{ year: '2011', total: 3000 },
// 		{ year: '2012', total: 4000 },
// 		{ year: '2013', total: 5000 },
// 		{ year: '2014', total: 3500 }
// 	],
// 	xkey: 'year',
// 	ykeys: ['total'],
// 	labels: ['Volume (L)']
// })

var map = L.map('dashboard-monitor-map', {
	scrollWheelZoom: false,
	maxZoom: 13
}).setView([37.779995, -122.39475], 2);

//  L.tileLayer('http://{s}.tiles.mapbox.com/v3/austinm.k7dlholc/{z}/{x}/{y}.png', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//    maxZoom: 18
// }).addTo(map);

var countryStyle = {
  'color': '#000',
  'weight': 3,
  'opacity': 0.6
};

L.geoJson(geo_countries, {
  style: countryStyle
}).addTo(map);
var markers = new L.MarkerClusterGroup();

var data = {};

var addMarkersToMap = function( filter ) {
	$.each( data.monitors, function( i, v ) {
		if ( filter && v.status != filter )
			return;
		var marker = L.marker(v.location);
		marker.bindPopup("<a href='/monitor.html?id="+v._id+"'><b>" + v.name + "</b></a>");
		markers.addLayer(marker);
	})
	map.addLayer(markers);
}

$.getJSON( "/api/v1/monitors", function(monitors) {
	data.monitors = monitors;
	$.getJSON( "/api/v1/reports", function(reports) {
		data.reports = reports;
		var failed_count = _.reduce(monitors, function(r, val) {
			return (val.status == 'failed')? r+1 : r;
		}, 0);
		var ok_count = _.reduce(monitors, function(r, val) {
			return (val.status == 'ok')? r+1 : r;
		}, 0);
		var unknown_count = _.reduce(monitors, function(r, val) {
			return (val.status == 'unknown')? r+1 : r;
		}, 0);

		var dailyCount = _.reduce(reports, function(count, current) {
			var timestamp = new Date(new Date(current['report']['timestamp']).getTime() + new Date('January 1, 1970 GMT').getTime());
			if ( timestamp > (new Date().setHours(0,0,0,0)) )
				return count+1;
			else
				return count;
		}, 0);
		$('#daily-report-count').text(''+dailyCount);
		$('#status-failed-count').text(''+failed_count);
		$('#status-ok-count').text(''+ok_count);
		$('#status-unknown-count').text(''+unknown_count);

		Morris.Donut({
		  element: 'dashboard-functionality-chart',
		  data: [{
		    label: "Non-functional",
		    value: failed_count
		  }, {
		    label: "Functioning Normally",
		    value: ok_count
		  }, {
		    label: "Status Unknown",
		    value: unknown_count
		  }],
		  resize: true,
		  colors: ['#d9534f', '#5cb85c', '#f0ad4e']
		});

		addMarkersToMap();
	})
} );

$('#map-filter-functional').click(function(e) {
	$('#map-filter-functional').addClass('hidden');
	$('#map-current-filter').text($('#map-filter-functional').text());
	e.preventDefault();
})