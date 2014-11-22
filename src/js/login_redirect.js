if ( window.location.pathname !== '/login.html' 
	&& !window.sessionStorage.auth_token )
  window.location.replace("/login.html");