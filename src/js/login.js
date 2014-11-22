$(function() {
    var query = window.location.search.slice(1).toLowerCase();
    if ( query.indexOf( "redir=" ) !== -1 )
    {
        var redir = query.substr( query.indexOf( "redir=" ) + 6)
        if ( redir.indexOf( "&" ) != -1 )
            redir = redir.substr( 0, redir.indexOf("&") );
        $('#login-link').attr('href', redir);
    }
    $('#login-link').click( function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        $.ajax({
          url: "/api/v1/_login",
          method: "POST",
          data: {
            login: $('input[name=email]').val(),
            password: $('input[name=password]').val()
          }
        }).done(function(data) {
            window.sessionStorage.auth_token = data;
            window.location.href = href;
        });
    })
});