Morris.Donut({
  element: 'dashboard-functionality-chart',
  data: [{
    label: "Non-functional",
    value: 9
  }, {
    label: "Functioning Normally",
    value: 16
  }, {
    label: "Status Unknown",
    value: 1
  }],
  resize: true,
  colors: ['#d9534f', '#5cb85c', '#f0ad4e']
});

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
	doubleClickZoom: true
}).setView([-8.1, 36.6833], 5);

//  L.tileLayer('http://{s}.tiles.mapbox.com/v3/austinm.k7dlholc/{z}/{x}/{y}.png', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//    maxZoom: 18
// }).addTo(map);

var countryStyle = {
  'color': '#000',
  'weight': 5,
  'opacity': 0.6
};

L.geoJson(geo_countries, {
  style: countryStyle
}).addTo(map);

var monitors = [
	{name: 'Aidan Ulungi', location: [-8.09338,36.51612]},
	{name: 'Musfa Madanga', location: [-8.13364,36.66714]},
	{name: 'Chingilile', location: [-8.09336,36.69564]},
	{name: 'Mwalima Njayaga', location: [-8.1166,36.66723]}
]
$.each( monitors, function( i, v ) {
	var marker = L.marker(v.location).addTo(map);
	marker.bindPopup("<b>" + v.name + "</b>");
})