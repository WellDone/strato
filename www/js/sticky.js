
	  //  	var data = {
		// 	  // Our series array that contains series objects or in this case series data arrays
		// 	  labels: [],
		// 	  series: [
		// 	    [5, 2, 4, 2, 0]
		// 	  ]
		// 	};

		// 	// Create a new line chart object where as first parameter we pass in a selector
		// 	// that is resolving to our chart container element. The Second parameter
		// 	// is the actual data object.
		// 	var line1 = new Chartist.Line('#chart1', data);
		// 	var bar1 = new Chartist.Bar('#chart2', data);
		// 	var line2 = new Chartist.Line('#chart3', data);
		// 	var bar2 = new Chartist.Bar('#chart4', data);

		// 	setInterval( function() {
		// 		//data.series[0].push( Math.floor((Math.random() * 10) + 1) );
		// 		line1.update();
		// 		bar1.update();
		// 	}, 1000 );

$(function(){ // document ready
 
 	$('.sticky').each( function() {
 		$(this).attr('sticky-top', $(this).offset().top );
  	$(this).attr('sticky-left', $(this).offset().left ); // returns number 
 	})
 
  $(window).scroll(function(){ // scroll event  
 
    var windowTop = $(window).scrollTop(); // returns number
 
 		$('.sticky').each( function() {
 			var stickyOffset = parseInt( $(this).attr('sticky-offset') ) || 5;
 			var stickyLeft = parseInt( $(this).attr('sticky-left') )
 			if ($(this).attr('sticky-top') < windowTop + stickyOffset) {
	      $(this).css({ position: 'fixed', top: stickyOffset, left: stickyLeft });
	    }
	    else {
	      $('.sticky').css({ position: 'static' });
	    }
 		})
  });
});