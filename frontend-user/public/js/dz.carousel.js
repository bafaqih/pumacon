jQuery(window).on('load', function() {
    'use strict';
	
	// service-silder-swiper
	if(jQuery('.main-swiper').length > 0){
		var swiper2 = new Swiper(".main-swiper", {
			loop: true,
			effect: "fade",
			speed: 1000,
			parallax: true,
			//autoplay: {
			//   delay: 1500,
			//},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
		});
	}
	
});