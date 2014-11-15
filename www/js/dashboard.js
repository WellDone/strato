Morris.Area({
	element: 'dashboard-history-chart',
	data: [
		{ year: '2008', total: 1000 },
		{ year: '2009', total: 1500 },
		{ year: '2010', total: 2500 },
		{ year: '2011', total: 3000 },
		{ year: '2012', total: 4000 },
		{ year: '2013', total: 5000 },
		{ year: '2014', total: 3500 }
	],
	xkey: 'year',
	ykeys: ['total'],
	labels: ['Volume (L)']
})

var map = L.map('dashboard-monitor-map', {
	scrollWheelZoom: false,
	maxZoom: 13
}).setView([-8.1, 36.6833], 2);

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

$.getJSON( "/api/monitors", function(monitors) {
	$.getJSON( "/api/reports", function(reports) {

		$.getJSON( "/api/alerts", function(alerts) {
			var failed_count = _.reduce(monitors, function(r, val) {
				return (val.status == 'failed')? r+1 : r;
			}, 0);
			var ok_count = _.reduce(monitors, function(r, val) {
				return (val.status == 'ok')? r+1 : r;
			}, 0);
			var unknown_count = _.reduce(monitors, function(r, val) {
				return (val.status == 'unknown')? r+1 : r;
			}, 0);

			$('#daily-report-count').text(''+reports.length);
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

			var markers = new L.MarkerClusterGroup();
			$.each( monitors, function( i, v ) {
				var marker = L.marker(v.location);
				marker.bindPopup("<b>" + v.name + "</b>");
				markers.addLayer(marker);
			})
			map.addLayer(markers);
		})
	})
} );