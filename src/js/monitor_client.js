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

function mouseDown(event, g, context) {
  context.initializeMouseDown(event, g, context);
  if (event.altKey || event.shiftKey) {
    Dygraph.startZoom(event, g, context);
  } else {
    Dygraph.startPan(event, g, context);
  }
}

function mouseMove(event, g, context) {
  if (context.isPanning) {
    Dygraph.movePan(event, g, context);
  } else if (context.isZooming) {
    Dygraph.moveZoom(event, g, context);
  }
}

function mouseUp(event, g, context) {
  if (context.isPanning) {
    Dygraph.endPan(event, g, context);
  } else if (context.isZooming) {
    Dygraph.endZoom(event, g, context);
  }
}

// Take the offset of a mouse event on the dygraph canvas and
// convert it to a pair of percentages from the bottom left. 
// (Not top left, bottom is where the lower value is.)
function offsetToPercentage(g, offsetX, offsetY) {
  // This is calculating the pixel offset of the leftmost date.
  var xOffset = g.toDomCoords(g.xAxisRange()[0], null)[0];
  var yar0 = g.yAxisRange(0);

  // This is calculating the pixel of the higest value. (Top pixel)
  var yOffset = g.toDomCoords(null, yar0[1])[1];

  // x y w and h are relative to the corner of the drawing area,
  // so that the upper corner of the drawing area is (0, 0).
  var x = offsetX - xOffset;
  var y = offsetY - yOffset;

  // This is computing the rightmost pixel, effectively defining the
  // width.
  var w = g.toDomCoords(g.xAxisRange()[1], null)[0] - xOffset;

  // This is computing the lowest pixel, effectively defining the height.
  var h = g.toDomCoords(null, yar0[0])[1] - yOffset;

  // Percentage from the left.
  var xPct = w === 0 ? 0 : (x / w);
  // Percentage from the top.
  var yPct = h === 0 ? 0 : (y / h);

  // The (1-) part below changes it from "% distance down from the top"
  // to "% distance up from the bottom".
  return [xPct, (1-yPct)];
}

// Adjusts [x, y] toward each other by zoomInPercentage%
// Split it so the left/bottom axis gets xBias/yBias of that change and
// tight/top gets (1-xBias)/(1-yBias) of that change.
//
// If a bias is missing it splits it down the middle.
function zoom(g, zoomInPercentage, xBias, yBias) {
  xBias = xBias || 0.5;
  yBias = yBias || 0.5;
  function adjustAxis(axis, zoomInPercentage, bias) {
    var delta = axis[1] - axis[0];
    var increment = delta * zoomInPercentage;
    var foo = [increment * bias, increment * (1-bias)];
    return [ axis[0] + foo[0], axis[1] - foo[1] ];
  }
  var yAxes = g.yAxisRanges();
  var newYAxes = [];
  for (var i = 0; i < yAxes.length; i++) {
    newYAxes[i] = adjustAxis(yAxes[i], zoomInPercentage, yBias);
  }

  g.updateOptions({
    dateWindow: adjustAxis(g.xAxisRange(), zoomInPercentage, xBias),
    valueRange: newYAxes[0]
    });
}

function mouseDblClick(event, g, context) {
  // Reducing by 20% makes it 80% the original size, which means
  // to restore to original size it must grow by 25%

  if (!(event.offsetX && event.offsetY)){
    event.offsetX = event.layerX - event.target.offsetLeft;
    event.offsetY = event.layerY - event.target.offsetTop;
  }

  var percentages = offsetToPercentage(g, event.offsetX, event.offsetY);
  var xPct = percentages[0];
  var yPct = percentages[1];

  if (event.ctrlKey) {
    zoom(g, -0.25, xPct, yPct);
  } else {
    zoom(g, +0.2, xPct, yPct);
  }
}

function mouseClick(event, g, context) {
  Dygraph.cancelEvent(event);
}

function mouseScroll(event, g, context) {
  var normal = event.detail ? event.detail * -1 : event.wheelDelta / 40;
  // For me the normalized value shows 0.075 for one click. If I took
  // that verbatim, it would be a 7.5%.
  var percentage = normal / 50;

  if (!(event.offsetX && event.offsetY)){
    event.offsetX = event.layerX - event.target.offsetLeft;
    event.offsetY = event.layerY - event.target.offsetTop;
  }

  var percentages = offsetToPercentage(g, event.offsetX, event.offsetY);
  var xPct = percentages[0];
  var yPct = percentages[1];

  zoom(g, percentage, xPct, yPct);
  Dygraph.cancelEvent(event);
}

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
			labels: _.flatten(['Time', _.keys(keys)]),
			interactionModel: {
				'mousedown' : mouseDown,
        'mousemove' : mouseMove,
        'mouseup' : mouseUp,
        'click' : mouseClick,
        'dblclick' : mouseDblClick,
        'mousewheel' : mouseScroll
			}
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
		$('#last-report-time').text( prettifyTimeDelta(new Date(reports[0].report.timestamp).getTime(), new Date().getTime()) + " ago" );

		_.forEachRight(reports, function(r) {
			var item = [];
			_.fill(item, null,  0, _.keys(keys).length+1);
			item[0] = new Date(r.report.timestamp).getTime() + new Date('January 1, 1970 GMT').getTime();
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
			dataGraph.updateOptions({'file': data, 'labels': _.flatten(['Time', _.keys(keys)]) });

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