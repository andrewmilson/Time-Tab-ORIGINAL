var invoice_general = (function(){
	var helper = (function(){
		function previouse_month_info(year, month) {
			return new Date(year, month, 0);
		}

		function quote(str) {
			return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
		}

		return {
			PreviouseMonthInfo: previouse_month_info,
			Quote: quote
		}
	})();

	var settings = (function(){
		function hide_settings(){
			settings_container.hide();
			settings_navitem.css("color", "#ccc");
		}
		
		function show_settings(){
			settings_container.show();
			settings_navitem.css("color", "#fff");
		}

		function hide_report_settings(){
			report_settings_content.hide();
		}

		function show_report_settings(){
			report_settings_content.show();
		}

		function events(){
			$(".wrapper header .tools_nav li.settings select").change(function(e){
				ajax.Settings.Change_settings($(e.target).attr("class"), $(this).find(":selected").attr("id"));
				if(settings_warning.is(":hidden")){
					settings_warning.css("opacity", 0).slideDown(200, function(){
						$(this).animate({"opacity": 1}, 300);
					});
				}
			});

			$(document).mousedown(function(){
				hide_settings();
				hide_report_settings();
			});

			$(".settings").mousedown(function(e){
				if($(e.target).hasClass("settings_navitem")){
					if(settings_container.is(":visible")){
						hide_settings();
					}else{
						show_settings();
					}
				}
				e.stopPropagation();
			});	

			report_settings.mousedown(function(e){
				if($(e.target).hasClass("report_settings_button")){
					if(report_settings_content.is(":visible")){
						hide_report_settings();
					}else{
						show_report_settings();
					}
				}
				e.stopPropagation();
			});

			$(".settings .settings_container .settings_nav li").mousedown(function(e){
				var name = $(e.target).attr("class").split(' ')[0].substr(2);
				$(e.target).parent().find(".current_settings").removeClass("current_settings");
				$(e.target).addClass("current_settings");
				$(".settings .settings_container .settings_nav .arrow").stop().animate({"left": $(e.target).position().left + 10 + $(e.target).width() / 2}, 200);
				$(e.target).parent().parent().children(".settings_content").children().hide();
				$(e.target).parent().parent().children(".settings_content").children("." + name + "_settings").show();
			});
		}

		return {
			Hide_settings: hide_settings,
			Show_settings: show_settings,
			Events: events
		}
	})();

	function init(){
		load_data.hide().css("right", (load_data.width() * -1) - 9);
		the_datepicker.hide();

		var previouse_month_info = helper.PreviouseMonthInfo(custom_year, month_number + 1);
		
		custom_month = [previouse_month_info.getMonth() + 1, previouse_month_info.getMonth() + 1];
		custom_date = [1, previouse_month_info.getDate()];
		custom_year = [previouse_month_info.getFullYear(), previouse_month_info.getFullYear()];
		the_day_from.html(custom_date[0] + " " + months[custom_month[0] - 1] + ", " + custom_year[0]);
		the_day_to.html(custom_date[1] + " " + months[custom_month[1] - 1] + ", " + custom_year[1]);

		datepicker_from.datepicker("setDate", new Date(custom_year[0], custom_month[0] - 1, 1))
		datepicker_to.datepicker("setDate", new Date(custom_year[1], custom_month[1] - 1, custom_date[1]))

		datepicker_from.datepicker("option", "maxDate", new Date(custom_year[1], custom_month[1] - 1, custom_date[1]));
		datepicker_to.datepicker("option", "minDate", new Date(custom_year[0], custom_month[0] - 1, 1));

		settings_warning.hide();
	}

	return {
		Init: init,
		Helper: helper,
		Settings: settings
	}
})();