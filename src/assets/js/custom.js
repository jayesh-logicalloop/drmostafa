function checkDecimal(el) {
	var ex = /^\d*(\.\d{0,2})?$/;
	if(ex.test(el.value)==false){
		el.value = parseInt(el.value*100)/100;
	}
}

function changeHtmlDir(lang='ar') {
  lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : lang;
  document.getElementsByTagName("BODY")[0].removeAttribute('class');
  console.log('lang', lang);
  if(lang=='ar')
  {
    document.getElementById("htmlRoot").dir = "rtl";
    document.getElementsByTagName("BODY")[0].classList.add('rtlClass');
  }
  else
  {
    document.getElementById("htmlRoot").dir = "ltr";
    document.getElementsByTagName("BODY")[0].classList.add('ltrClass');
  }
}

jQuery(document).ready(function(){
  jQuery('[data-toggle="tooltip"]').tooltip();

  jQuery('[data-fancybox="gallery"]').fancybox();

  //Strict input box to accept only numeric(with or without floting point) values
	jQuery(document).on("keypress keyup blur change", '.strict_numeric', function (event) {
		jQuery(this).val(jQuery(this).val().replace(/[^0-9\.]/g,''));
		if ((event.which != 46 || jQuery(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
			event.preventDefault();
		}
    });

	//Strict input box to accept only integer values
	jQuery(document).on("keypress keyup blur change", '.strict_integer', function (event) {
		jQuery(this).val(jQuery(this).val().replace(/[^\d].+/, ""));
		if ((event.which < 48 || event.which > 57)) {
			event.preventDefault();
		}
	});

	// jQuery(document).on('focus', '.timepicker', function(){
	// 	jQuery(this).mdtimepicker({format: 'h:mm tt', hourPadding: true});
	// });

	jQuery(document).on('change', '.custom-file-input', function() {
		var fileName = $(this).val().split("\\").pop();
		//jQuery(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });

  jQuery("#fullscreen-button").on("click", function toggleFullScreen() {
    //console.log('fullscreen');
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
      if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.cancelFullScreen) {
          document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
      }
    }
  });

  changeHtmlDir();


  jQuery(document).on('click', '[data-toggle="offcanvas"]', function() {
    jQuery('.sidebar-offcanvas').toggleClass('active');
  });
});
