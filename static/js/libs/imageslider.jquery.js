$.fn.imageslider = function(time){
	var _this = this;
	var isover = false;
	var slider_nav_container = $(_this).find(".slider_nav_container");
	var img_show = $(_this).children("img.show");

	!time ? time = 3000 : 0;
	
	$(_this).append("\
		<div class='content'><h3 class='slider_title'></h3><div class='slider_description'></div></div>\
		<span class='next'>next</span><span class='prev'>prev</span>\
	");

	for(var i = 0; i < $(_this).children("img").length; i++){
		slider_nav_container.append("<span class='slider_nav_item " + i + "'></span>");
	}

	var slider_description = $(_this).find(".slider_description");
	var slider_title = $(_this).find(".slider_title");


	function slideshow(){
		slider_nav_container.css("margin-left", "-" + $(_this).find(".slider_nav_container").width() / 2 + "px")
		$(_this).children("img").css("opacity", 0);
		img_show.css("opacity", 1);
		
		captions(img_show);

		$(_this).children("span").click(function(){
			if($(_this).children("img").is(":animated")){
				return false;
			}

			playimages($(this).attr("class"));
		});
	}
	
	slideshow();

	function playimages(np){
		img_show = $(_this).children("img.show");
		var current = img_show;
		var next = current.next("img").length ? current.next() : $(_this).children("img:first");
		var prev = current.prev("img").length ? current.prev() : $(_this).children("img:last");

		
		if(np == 'prev'){
			prev.addClass("show").animate({"opacity": "1.0"}, 500);
			current.removeClass('show').animate({"opacity": "0"}, 500);
			captions(prev);			
		}
		
		if(np == 'next'){
			next.addClass("show").animate({"opacity": 1}, 500);
			current.removeClass('show').animate({"opacity": 0}, 500);
			captions(next);
		}
	}
	
	function captions(np){
		slider_description = $(_this).find(".slider_description");
		slider_title = $(_this).find(".slider_title");

		if(np.data("description") != null || np.data("title") != null){
			slider_title.html(np.data("title"));
			slider_description.html(np.data("description"));

			$(_this).find(".content").show().css({
				"height": slider_title.height() + slider_description.height()
			});
		}else{
			$(_this).children(".caption").hide();
		}
	}
};