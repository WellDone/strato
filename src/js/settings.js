$(function() {
  $('.org-settings').addClass('hidden');
  $.getJSON( "/api/v1/me", function(me) {
    $("#organization").text(me.organization || "<none>");
    if ( me.organization ) {
      $('.org-settings').removeClass('hidden');
    }
  } );

  $('#password-reset-form').submit( function(e) {
    e.preventDefault();
    if ( $('input[name=password]').val() != $('input[name=password2]').val() )
    {
        $('input[name=password2]').val("").addClass('has-error');
        return;
    }
    $.ajax({
      url: "/api/v1/me/_password",
      type: "POST",
      data: {
        old_password: $('input[name=old-password]').val(),
        new_password: $('input[name=password]').val(),
      },
      complete: function(res) {
        if ( res.status == 200 )
          $('#password-reset-alert')
            .removeClass('hidden')
            .removeClass('alert-danger')
            .addClass('alert-success')
            .text('Password updated successfully!');
        else
          $('#password-reset-alert')
            .removeClass('hidden')
            .removeClass('alert-success')
            .addClass('alert-danger')
            .text('Failed to update password...');
      }
    })  
  })
});