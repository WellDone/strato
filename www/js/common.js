$(function() {
	$("a[href='login.html']").attr('href', 'login.html?redir=' + window.location.pathname);
});