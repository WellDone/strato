$(function() {
  $.fn.dataTable.ext.errMode = 'none';

  $('.org-settings').addClass('hidden');
  $.getJSON( "/api/v1/me", function(me) {
    $("#organization").text(me.organization || "<none>");
    if ( me.organization ) {
      $('.org-settings').removeClass('hidden');
    }
  } );

  var tbl = $('#dataTables-example').DataTable( {
    columns: [
      { data: 'url' },
      { data: 'type' },
      { data: '_control' },
    ],
    ajax: {
      url: '/api/v1/webhooks',
      dataSrc: function( json ) {
        for ( var i in json ) {
          json[i]['url'] = escapeHtml(json[i]['url'])||"";
          json[i]['type'] = escapeHtml(json[i]['type'])||"";
          json[i]['_control'] = "<a href='#' class='delete-webhook' data-id='" + json[i]['_id'] + "'>delete</a>";
        }
        return json;
      }
    }
  } );

  tbl.on( 'draw.dt', function () {
    $('a.delete-webhook').click(function(e) {
      e.preventDefault();
      $.ajax({
        type: 'DELETE',
        url: '/api/v1/webhooks/'+$(this).attr('data-id'),
        complete: function() {
          tbl.ajax.reload();
        }
      })
    })
  } );

  $('#add-hook-button').click(function() {
    $('#add-hook-modal').modal('show');
  });

  $('#add-hook-save').click(function() {
    $.ajax({
      type: 'POST',
      url: '/api/v1/webhooks',
      data: {
        url: $('input[name=webhook-url]').val(),
        type: 'normal'
      },
      complete: function() {
        $('#add-hook-modal').modal('hide');
        tbl.ajax.reload();
      }
    })
  } );
});