$(function() {
  $.getJSON( "/api/v1/me", function(me) {
    $("#username").text(me.username);
    $("#organization").text(me.organization || "<none>");
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
      method: "POST",
      data: {
        old_password: $('input[name=old-password]').val(),
        new_password: $('input[name=password]').val(),
      }
    })  
  })
});