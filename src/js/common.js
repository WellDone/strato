$(function() {
  $("a.logout")
    .attr('href', '/login.html?redir=' + window.location.pathname)
    .click(function(e) {
      e.preventDefault();
      delete window.sessionStorage.auth_token;
      window.location.href = $(this).attr('href');
    })
});

$.ajaxSetup({
  headers: {
    'Authorization': "Bearer " + window.sessionStorage.auth_token
  }
});

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