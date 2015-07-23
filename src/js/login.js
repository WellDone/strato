$(function() {
    var href = "/";
    var query = window.location.search.slice(1).toLowerCase();
    if ( query.indexOf( "redir=" ) !== -1 )
    {
        href = query.substr( query.indexOf( "redir=" ) + 6)
        if ( href.indexOf( "&" ) != -1 )
            href = href.substr( 0, href.indexOf("&") );
        $('#login-btn').attr('href', href);
    }

    var type = "login";
    var signup = function() {
        if ( $('input[name=password]').val() != $('input[name=password2]').val() )
        {
            $('input[name=password2]').val("").addClass('has-error');
            return;
        }
        $.ajax({
          url: "/api/v1/_signup",
          method: "POST",
          data: {
            login: $('input[name=email]').val(),
            password: $('input[name=password]').val()
          }
        }).done(function(data) {
            login();
        });
    }
    var login = function() {
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
        }).error(function() {
            $('input[name=password]').val("").addClass('has-error');
        });
    }
    $('#login-form').submit( function(e) {
        e.preventDefault();
        if ( type == "login" )
            login();
        else
            signup();
    })
    $('#signup-link').click( function(e) {
        type = "signup";
        e.preventDefault();
        $('#signup-text').addClass('hidden');
        $('#login-text').removeClass('hidden');
        $('#password-confirmation').removeClass('hidden');
        $('#login-btn').text("Create Account");
    })
    $('#login-link').click( function(e) {
        type = "login";
        e.preventDefault();
        $('#signup-text').removeClass('hidden');
        $('#login-text').addClass('hidden');
        $('#password-confirmation').addClass('hidden');
        $('#login-btn').text("Login");
    })
});
