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
      { data: 'timestamp' },
      { data: 'monitor' },
      { data: 'batteryVoltage' },
      { data: 'gateway' },
      { data: 'gsmid' },
      { data: 'status' }
    ],
    ajax: {
      url: '/api/v1/reports',
      dataSrc: function( json ) {
        for ( var i in json ) {
          json[i]['timestamp'] = escapeHtml(json[i]['timestamp'])||"";
          json[i]['monitor'] = escapeHtml(json[i]['monitor'])||"";
          json[i]['batteryVoltage'] = escapeHtml(json[i]['batteryVoltage'])||"";
          json[i]['gsmid'] = escapeHtml(json[i]['gsmid'])||"";
          json[i]['gateway'] = escapeHtml(json[i]['gateway'])||"";

          var statusLabel = "";
          if ( json[i]['status'] == 'ok' )
            statusLabel = "label-success";
          else if ( json[i]['status'] == 'failed' )
            statusLabel = "label-danger";
          else
            statusLabel = "label-warning";
          json[i]['status'] = "<span class='label " + statusLabel + "'>" + (escapeHtml(json[i]['status'])||"") + "</span>";
        }
        return json;
      }
    }
  } );
  if ( query )
  {
    tbl.on( 'draw.dt', function () {
      tbl.off('draw.dt');
      tbl.api().column(4).search(query).draw();
      query = null;
    } );
  }
});