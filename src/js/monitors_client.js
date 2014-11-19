$(function() {
  var query = window.location.search.slice(1).toLowerCase();
  if ( query.indexOf( "status=" ) == 0 )
  {
    query = query.substr(7)
    if ( query.indexOf( "&" ) != -1 )
      query = query.substr( 0, query.indexOf("&") );
  }
  else
  {
    query = null;
  }
  
  var tbl = $('#dataTables-example').dataTable( {
    columns: [
      { data: 'name' },
      { data: 'location' },
      { data: 'gsmid' },
      { data: 'timeSinceLastReport' },
      { data: 'status' }
    ],
    ajax: {
      url: '/api/v1/monitors',
      dataSrc: function( json ) {
        for ( var i in json ) {
          json[i]['name'] = escapeHtml(json[i]['name'])||"";
          json[i]['location'] = escapeHtml(json[i]['location'])||"";
          json[i]['gsmid'] = escapeHtml(json[i]['gsmid'])||"";
          json[i]['timeSinceLastReport'] = escapeHtml(json[i]['timeSinceLastReport'])||"";

          var statusLabel = "";
          if ( json[i]['status'] == 'ok' )
            statusLabel = "label-success";
          else if ( json[i]['status'] == 'failed' )
            statusLabel = "label-danger";
          else if ( json[i]['status'] == 'unknown' )
            statusLabel = "label-warning";
          json[i]['status'] = "<span class='label " + statusLabel + "'>" + (escapeHtml(json[i]['status'])||"") + "</span>";
        }
        console.log(json);
        return json;
      }
    }
  } );
  if ( query )
  {
    $('#monitors-filter').removeClass('hidden').html("Filters: <span class='filter-toggle label label-info'><a href='/monitors.html'><i class='fa fa-times-circle'></i></a>&nbsp;status: " + escapeHtml(query) + "</span>");
    tbl.on( 'draw.dt', function () {
      tbl.off('draw.dt');
      tbl.api().column(4).search(query).draw();
      query = null;
    } );
  }
});