var logout = function() {
  if ( window.location.pathname != '/login.html' )
  {
    delete window.sessionStorage.auth_token;
    window.location.href = '/login.html?redir=' + window.location.pathname;
  }
}

$(function() {
  $("a.logout")
    .click(function(e) {
      e.preventDefault();
      logout();
    })
});

(function() {
  var jwt = null;
  try {
    jwt = jwt_decode(window.sessionStorage.auth_token);
  } catch (e) {}

  var now = new Date().getTime() / 1000
  if ( !jwt || !jwt.exp || jwt.exp < now )
    return logout();
  setTimeout(logout, (jwt.exp-now) * 1000);
  if ( jwt.exp - (60*5) < now )
    console.log("%d minute warning...", (jwt.exp-now)/60)
  setTimeout(function() {
    console.log("%d minute warning...", 5)
  }, (jwt.exp-(60*5)-now)*1000 )
})();

$.ajaxSetup({
  headers: {
    'Authorization': "Bearer " + window.sessionStorage.auth_token
  }
});
$(document).ajaxComplete(function( event,request, settings ) {
  if ( request.status == 401 && request.getResponseHeader('WWW-Authenticate') == "Bearer" )
    logout();
});

$.getJSON( "/api/v1/me", function(me) {
  window.me = me;
} );

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}