$(function() {
	$("a.logout")
		.attr('href', '/login.html?redir=' + window.location.pathname)
		.click(function(e) {
			e.preventDefault();
			window.sessionStorage.auth_token = null;
			window.location.href = $(this).attr('href');
		})
});