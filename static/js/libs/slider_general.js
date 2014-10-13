var slider_general = (function(){

	var helper = (function(){
		function object_sort(a,b) {
			if (a.last_nom < b.last_nom)
				return -1;

			if (a.last_nom > b.last_nom)
				return 1;

			return 0;
		}

		function hex2rgb(hex){
			var rgb = [parseInt(hex.substring(1,3),16), parseInt(hex.substring(3,5),16), parseInt(hex.substring(5,7),16)];
			return "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + "0.7" + ")";
		}

		function time_conversion(args){
			args.period = args.period || "";

			if(args.type == 24){
				args.time += args.period == "PM" ? 12 : 0;
			}else if(args.type == 12){
				args.period = ["AM", "PM", "PM"][Math.floor(args.time / 12)];
				args.time = (args.time + 11) % 12 + 1;
			}

			return {
				Time: args.time,
				Period: args.period
			}
		}

		// backslash out important characters from regex string
		function quote(str) {
			return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
		}

		return {
			Hex2rgb: hex2rgb,
			Time_conversion: time_conversion,
			Object_sort: object_sort,
			Quote: quote
		}
	})();

	var time_date = (function(){
		function days_in_custom_month(the_year, the_month){
			return new Date(the_year, the_month, 0).getDate();
		}

		function date_format(date, old_format, new_format, new_separator){
			var separator = date.replace(/[0-9]/g, '').substring(0, 1);
			var old_date_obj = {};
			var new_date = "";
			new_format = new_format.split(separator);
			old_format = old_format.split(separator);
			date = date.split(separator);
			
			old_date_obj[old_format[0]] = date[0];
			old_date_obj[old_format[1]] = date[1];
			old_date_obj[old_format[2]] = date[2];

			if(old_date_obj["yy"]){
				old_date_obj["yyyy"] = 20 + old_date_obj["yy"];
			}else if(old_date_obj["yyyy"]){
				old_date_obj["yy"] = old_date_obj["yyyy"].slice(-2);
			}

			for(var i = 0; i < date.length; i++){
				new_date = new_date + old_date_obj[new_format[i]] + separator;
			}

			var separator_regex = new RegExp(helper.Quote(separator), "g")
			new_date = new_date.slice(0,-1).replace(separator_regex, new_separator);

			return new_date; 
		}

		function toggle_date_button(){
			if(the_datepicker.is(":hidden")){
				date_pick.removeAttr("style");
			}else{
				date_pick.css({
					"border-color": "#000", 
					"background": "url('/static/images/icons/callendar_black.gif') no-repeat 4px 3px, #292929",
					"color": "#ddd",
					"text-shadow": "0 1px 0 #000"
				});
			}
		}

		function hide_datepicker(){
			if(the_datepicker.is(":hidden")){
				the_datepicker.stop().slideDown(200);
				toggle_date_button();
			}else{
				the_datepicker.stop().slideUp(200, function(){
					toggle_date_button();
				});
			}
		}

		function change_date(args){
			if(args.formated != undefined){
				var format_read = args.formated.split(/[|]/)[0];
				var format_dev = args.formated.split(/[|]/)[1];
				old_date = [custom_year, custom_month, custom_date, custom_day];
				custom_day = parseInt(format_dev.split(/ /)[2]);
				custom_month = parseInt(format_dev.split(/ /)[0]);
				custom_date = parseInt(format_dev.split(/ /)[1]);
				custom_year = parseInt(format_dev.split(/ /)[3]);
			}else{
				old_date = [custom_year, custom_month, custom_date, custom_day];
				custom_month = args.month;
				custom_date = args.date;
				custom_year = args.year;
				custom_day = new Date(custom_year, custom_month - 1, custom_date).getDay();
			}

			if((custom_date - custom_day) != (old_date[2] - old_date[3]) || custom_month != old_date[1] || custom_year != old_date[0]){	
				ajax.Slider.Get_slider_records_by_date({
					customYear: parseInt(custom_year),
					customMonth: parseInt(custom_month),
					customDate: parseInt(custom_date),
					customDay: parseInt(custom_day)
				});
			}

			the_day.html(days[custom_day] + " " + custom_date + " " + months[custom_month - 1] + ", " + custom_year);
			$(".day_bar span").css("color", "#aaa");
			$(".day_bar span." + days[custom_day].toLowerCase() + "_text").css("color", "#fff");

			if((custom_date >= the_date.getDate() - the_date.getDay() && custom_date <= the_date.getDate() + (6 - the_date.getDay())) && custom_month == the_date.getMonth() + 1 && custom_year == the_date.getFullYear()){
				$(".bar_container." + day_name.toLowerCase() + "_container").find(".current_time").css("opacity", 1);
				record_time_interval.length > 0 ? $(".bar_container." + day_name.toLowerCase() + "_container .bar_inner.record_activity").show() : 0;
			}else{
				bar_container.find(".current_time").css("opacity", 0);
				record_time_interval.length > 0 ? $(".bar_container." + day_name.toLowerCase() + "_container .bar_inner.record_activity").hide() : 0;
			}

			if(the_date.getDate() == custom_date && the_date.getMonth() + 1 == custom_month){
				$(".tools_sub_nav .current_day_text").css("display", "block");
			}else{
				$(".tools_sub_nav .current_day_text").hide();
			}
		}

		function events(){
			the_datepicker.datepicker({
				inline: true,  
				showOtherMonths: true,  
				changeMonth: true,
				changeYear: true,
				dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
				onSelect: function(dateText, inst) {
					var changeDate = new Date(Date.parse(dateText));
					hide_datepicker({element: the_datepicker});

					console.log(changeDate.getMonth());

					change_date({
						year: changeDate.getFullYear(),
						month: changeDate.getMonth() + 1,
						date: changeDate.getDate()
					});
				}
			});

			$(".day_bar span").mouseover(function(e){
				date_teller_timeout = setTimeout(function(){
					$(".prime_slider_container .day_date_hover").show().css({"top": parseInt($(e.target).attr("class").split(/ /)[0]) * 41, "left": -80, "opacity": 0.5}).animate({"left": -86, "opacity": 1}, 100);
					if(custom_date - custom_day + parseInt($(e.target).attr("class").split(/ /)[0]) > slider_general.Time_date.Days_in_custom_month(custom_year, custom_month)){
						if(custom_month + 1 > 12){
							$(".prime_slider_container .day_date_hover span.cus_date_text").html(
								date_format(
									("0" + (custom_date - custom_day + parseInt($(e.target).attr("class").split(/ /)[0]) - slider_general.Time_date.Days_in_custom_month(custom_year, custom_month))).slice(-2)
									 + "." + 
									"01"
									 + "." + 
									(custom_year + 1)
								, "dd.mm.yyyy", settings_string.date_format, settings_string.date_separator)
							);
						}else{
							$(".prime_slider_container .day_date_hover span.cus_date_text").html(
								date_format(
									("0" + (custom_date - custom_day + parseInt($(e.target).attr("class").split(/ /)[0]) - slider_general.Time_date.Days_in_custom_month(custom_year, custom_month))).slice(-2)
									 + "." + 
									("0" + (custom_month + 1)).slice(-2)
									 + "." + 
									custom_year
								, "dd.mm.yyyy", settings_string.date_format, settings_string.date_separator)
							);
						}
					}else if(custom_date - custom_day + parseInt($(e.target).attr("class").split(/ /)[0]) < 1){
						if(custom_month - 1 < 1){
							$(".prime_slider_container .day_date_hover span.cus_date_text").html(
								date_format(
									("0" + (slider_general.Time_date.Days_in_custom_month(custom_year - 1, 12) - (custom_day - custom_date) + (parseInt($(e.target).attr("class").split(/ /)[0])))).slice(-2)
									 + "." + 
									"12"
									 + "." + 
									(custom_year - 1)
								, "dd.mm.yyyy", settings_string.date_format, settings_string.date_separator)
							);
						}else{
							$(".prime_slider_container .day_date_hover span.cus_date_text").html(
								date_format(
									("0" + (slider_general.Time_date.Days_in_custom_month(custom_year, custom_month - 1) - (custom_day - custom_date) + (parseInt($(e.target).attr("class").split(/ /)[0])))).slice(-2)
									 + "." + 
									("0" + (custom_month - 1)).slice(-2)
									 + "." + 
									custom_year
								, "dd.mm.yyyy", settings_string.date_format, settings_string.date_separator)
							);
						}
					}else{
						$(".prime_slider_container .day_date_hover span.cus_date_text").html(
							slider_general.Time_date.Date_format(
								("0" + (custom_date - custom_day + parseInt($(e.target).attr("class").split(/ /)[0]))).slice(-2) + "." + 
								("0" + (custom_month)).slice(-2) + "." + custom_year
							, "dd.mm.yyyy", settings_string.date_format, settings_string.date_separator)
						);
					}
				}, 500);
			}).mouseout(function(e){
				clearTimeout(date_teller_timeout);
				$(".prime_slider_container .day_date_hover").animate({"left": -80, "opacity": 0.5}, 100, function(){
					$(this).hide();
				});
			});

			$(".current_time").mouseenter(function(){
				cur_time_hover = true;
			}).mouseleave(function(){
				cur_time_hover = false;
			});
		}

		return {
			Days_in_custom_month: days_in_custom_month,
			Change_date: change_date,
			Date_format: date_format,
			Hide_datepicker: hide_datepicker,
			Toggle_date_button: toggle_date_button,
			Events: events
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

		function events(){
			$(".wrapper header .tools_nav li.settings select").change(function(e){
				ajax.General.Change_settings($(e.target).attr("class"), $(this).find(":selected").attr("id"));
				if(settings_warning.is(":hidden")){
					settings_warning.css("opacity", 0).slideDown(200, function(){
						$(this).animate({"opacity": 1}, 300);
					});
				}
			});

			$(".settings .settings_container .settings_nav li").mousedown(function(e){
				var name = $(e.target).attr("class").split(' ')[0].substr(2);
				$(e.target).parent().find(".current_settings").removeClass("current_settings");
				$(e.target).addClass("current_settings");
				$(".settings .settings_container .settings_nav .arrow").stop().animate({"left": $(e.target).position().left + 10 + $(e.target).width() / 2}, 200);
				$(e.target).parent().parent().children(".settings_content").children().hide();
				$(e.target).parent().parent().children(".settings_content").children("." + name + "_settings").show();
			});

			$(".settings").mousedown(function(e){
				if($(e.target).hasClass("settings_navitem")){
					if(settings_container.is(":visible")){
						slider_general.Settings.Hide_settings();
					}else{
						slider_general.Settings.Show_settings();
					}
				}
				e.stopPropagation();
			});

			$("html").mousedown(function(e){
				clicked = false;
				slider_general.Settings.Hide_settings();

				if(dial_container.is(":visible")){
					chosen_element_info.data("description", dial_description.val());
					dial_container.hide();
				}
			});
		}

		return {
			Hide_settings: hide_settings,
			Show_settings: show_settings,
			Events: events
		}
	})();

	var slider = (function(){
		function create_time_lines(time_format){
			bar.find(".time_lines").remove();
			bar.find(".current_time").after("<div class='time_lines'></div>");

			for(var i = 0; i <= 12; i++){
				var time_line_time = helper.Time_conversion({time: i * 2, type: time_format});
				bar.find(".time_lines").append("<span>" + ("0" + time_line_time.Time).slice(-2) + "00" + "</span><span style='border-left-style: dashed; height: 36px;'></span>");
			}
		}

		function deny_slider_access(){
			if(!ban_slider.is(":visible")){
				ban_slider.show().css({
					"opacity": 0.5, 
					"margin": "-40px 0 0 -185px"
				});
				
				ban_slider.animate({
					"opacity": 1, 
					"margin": "-50px 0 0 -185px"
				}, 100, "linear", function(){
					setTimeout(allow_slider_access, 2500);
				});
			}else{
				ban_slider.show();
			}
		}

		function goto_current_time(animate, move_position){
			var bar_container_width = bar_container.width() + 2;
			var move_position = (move_position == undefined ? bar_container.find(".current_time").position().left : move_position);

			if(move_position > bar_container_width / 2 && move_position < bar.width() - bar_container_width / 2){
				move_position = (move_position - bar_container_width / 2) - (move_position - bar_container_width / 2) % 15;
			}else if(move_position >= bar.width() - bar_container_width / 2){
				move_position = bar.width() - bar_container_width;
			}else if(move_position <= bar_container.width() / 2){
				move_position = 0;
			}

			if(animate){
				bar.animate({
					"left": move_position * -1
				}, 500);
			}else{
				bar.css({
					"left": move_position * -1
				});
			}
		}


		function time_pointer(){
			if(!cur_time_hover){
				var time_text = helper.Time_conversion({
					time: Math.floor(((updated_mouse_position - (updated_mouse_position % slider_snap)) / 2) / 60),
					type: settings_string.slider_time_format
				});

				$(".time_pointer").css({
					"left": (bar_event.pageX - yurk) + (time_text.Period != "" ? -7 : 3), 
					"width": time_text.Period != "" ? 70 : 50,
					"top": (bar_container.offset().top - prime_slider_container.offset().top) - 30, 
					"display": "block"
				});

				$(".time_pointer").html(
					("0" + time_text.Time).slice(-2)
					 + ":" + 
					("0" + Math.floor(((updated_mouse_position - (updated_mouse_position % slider_snap)) / 2) % 60)).slice(-2) + " " + time_text.Period
				);
			}else{
				var time_text = helper.Time_conversion({
					time: Math.floor(((updated_mouse_position - (updated_mouse_position % slider_snap)) / 2) / 60),
					type: settings_string.slider_time_format
				});

				$(".time_pointer").css({
					"left": (bar_event.pageX - yurk) - (time_text.Period != "" ? 45 : 35),
					"width": time_text.Period != "" ? 145 : 125, 
					"top": (bar_container.offset().top - prime_slider_container.offset().top) - 30, 
					"display": "block"
				});

				$(".time_pointer").html("current time " + 
					("0" + time_text.Time).slice(-2)
					 + ":" + 
					("0" + the_date.getMinutes()).slice(-2) + " " + time_text.Period
				);
			}
		}  

		function allow_slider_access(){
			if(ban_slider.is(":visible")){
				ban_slider.show().css({
					"opacity": 1, 
					"margin": "-50px 0 0 -185px"
				}).animate({
					"opacity": 0.5, 
					"margin": "-40px 0 0 -185px"
				}, 100, "linear", function(){
					$(this).hide();
				});
			}else{
				ban_slider.hide();
			}
		}

		// moves .current_time to tell user what the current time is
		function update_current_time(){
			the_date = new Date();
			$(".current_time").css("left", (2 * the_date.getMinutes()) + (120 * the_date.getHours()));
		}

		// moves the slider to the right
		function change_position_right(){
			if(bar.position().left > -1995){
				function goog(){
					bar.css("left", "-=15px"); 
					bar.position().left < -1995 ? clearInterval(interval) : 0; 
				}
				interval = setInterval(goog, 20);
			}
		}
		
		// moves the slider to the left
		function change_position_left(){
			if(bar.position().left < -1){
				function goog(){
					bar.css({"left": "+=15px"});
					bar.position().left > -1 ? clearInterval(interval) : 0;
				}
				interval = setInterval(goog, 20);
			}
		}

		function events(){
			$(".reload_slider").click(function(){
				ajax.Activity.Get_activities();

				ajax.Slider.Get_slider_records_by_date({
					customYear: custom_year,
					customMonth: custom_month,
					customDate: custom_date,
					customDay: custom_day
				});
			});

			$(".left_mover, .right").mouseover(slider_general.Slider.Change_position_left).mouseout(function(){
				clearInterval(interval);
			});
			
			$(".right_mover, .left").mouseover(slider_general.Slider.Change_position_right).mouseout(function(){
				clearInterval(interval);
			});

			bar.mousedown(function(e){
				mouse_position_unupdated = Math.round(e.pageX - bar.offset().left);
				end = end + 1;
			});

			bar.mouseout(function(){
				$(".time_pointer").css("display", "none");
			});

			bar.mousemove(function(e){
				bar_offset = bar.offset().left;
				yurk = Math.round(prime_slider_container.offset().left);
				bar_event = e;
				updated_mouse_position = Math.round(e.pageX - bar_offset);
				slider_container_offset = Math.round(prime_slider_container.offset().left);
				bar.position().left == 0 ? $(".left_mover").css("display", "none") : $(".left_mover").css("display", "block");
				bar.position().left < -1980 ? $(".right_mover").css("display", "none") : $(".right_mover").css("display", "block");

				if(mouse_mover){
					time_pointer()
				}else if(appender_mouse_down){
					slider_main.Appender_mouse_down_new_record_drag();
				}else if(bar_left_down || bar_right_down){
					slider_main.Resize_time_record(record_bar_type);
				}
			});

			bar.on("mousedown", ".bar_left, .bar_right", function(e){				
				record_bar_target = e.target;
				bar_container_day = $(record_bar_target).parent().parent().parent().attr("class").split(/\s+/)[1];
				mouse_down_bar_resizer = true;
				mouse_down_target = $(record_bar_target).parent()
				record_bar_type = $(this).attr("class").split(/_/)[1];
				record_left_offset = Math.floor($(record_bar_target).parent().offset().left - bar.offset().left);
				record_width_and_offset = Math.floor($(record_bar_target).parent().width() + record_left_offset);
				record_left_position = Math.floor($(record_bar_target).parent().offset().left);
				cords_x_test = e.pageX - record_left_position;
				record = $(record_bar_target).parent().width();
				record_width = $(record_bar_target).parent().width();
				e.originalEvent.preventDefault();
				right_time_value = $("." + bar_container_day + " .right_timepoint .righttime_value");
				left_time_value = $("." + bar_container_day + " .left_timepoint .lefttime_value");
				left_time_point = $("." + bar_container_day + " .left_timepoint");
				right_time_point = $("." + bar_container_day + " .right_timepoint");
				left_time_point.show()
				right_time_point.show()

				if(record_bar_type == "right"){
					bar_click_position = cords_x_test - record_width;
					bar_right_down = true;
				}else if(record_bar_type == "left"){
					bar_left_down = true;
				}
			});

			tools_activity_record.click(function(){
				if(!$(this).hasClass("activity_recording")){
					var activity_background = slider_general.Helper.Hex2rgb(activity_select.find(":selected").attr("class").split(/ /)[1]);
					$("." + day_name.toLowerCase() + "_container .bar").append("<div style='' class='bar_inner " + activity_select.val().replace(/ /g, "_") + " record_activity'><span class='bar_left'></span><span class='bar_right'></span><span class='time'></span></div>");

					activity_main.Record_activity({
						type: "start",
						element: $("." + day_name.toLowerCase() + "_container .bar .bar_inner.record_activity." + activity_select.val().replace(/ /g, "_")),
						activity: activity_select.val().replace(/ /g, "_"),
						background: activity_background,
						move_to_current_time: true
					});
				}else{
					activity_main.Record_activity({
						type: "stop",
						activity: activity_select.val().replace(/ /g, "_"),
						move_to_current_record: true
					});
				}

				return false;
			});

			$(window).resize(function(){
				if($(this).width() % 2 == 1){
					$(".wrapper").css("left", -1);
				}else{
					$(".wrapper").css("left", 0);
				}
			});

			$(document).mousedown(function(e){
				$(".time_pointer").css("display", "none");
				mouse_mover = false;
				color_select.hide();

				!$(e.target).is("span.activity_name, input.activity_name, .save_name, .cancel_name") && $("input.activity_name").length ? activity.Cancel_activity_name() : 0;
			}).mouseup(function(e){
				if((bar_left_down || bar_right_down) && mouse_down_target.attr("id") !== undefined){
					var time_record_length = mouse_down_target.width();
					var time_record_resize_id = mouse_down_target.attr("id").slice(7);
					ajax.Slider.Update_time_record_time(Math.floor((mouse_down_target.offset().left - mouse_down_target.parent().offset().left) / 2), time_record_length, time_record_resize_id);
				}

				bar_left_down = false;
				bar_right_down = false;


				if($(e.target).attr("class") == "time"){
					slider_main.Show_dial_info("click", e);
				}				

				teddy = false;
				record_width_and_offset = $(record_bar_target).parent().width() + updated_mouse_position;
				mouse_mover = true;

				if(appender_mouse_down){
					appender_mouse_down = false;
					var appender_click_mouse_position_new = e.pageX;

					if(new_appender_record_element.find(".bar_right").length == 0){
						new_appender_record_element.append("<span class='bar_left'></span><span class='bar_right'></span>");
					}

					if(new_appender_record_element.width() == 0){
						new_appender_record_element.remove();
					}

					if(new_appender_record_element.width() >= slider_snap){
						slider_main.Show_dial_info("create", new_appender_record_element);
					}
				}
				
				$(".left_timepoint").fadeOut();
				$(".right_timepoint").fadeOut();
			});

			$(".appender").mousedown(function(e){
				if($(e.target).attr("class") == "appender"){
					bar_container_day = $(e.target).parent(".bar").parent().attr("class").split(/ /)[1];
					bar_day_number = $(e.target).parent(".bar").parent().attr("class").split(/ /)[2];
					right_time_value = $("." + bar_container_day + " .right_timepoint .righttime_value");
					left_time_value = $("." + bar_container_day + " .left_timepoint .lefttime_value");					
					left_time_point = $("." + bar_container_day + " .left_timepoint");
					right_time_point = $("." + bar_container_day + " .right_timepoint");
					appender_click_mouse_position_old = e.pageX;

					$(".bar .bar_inner").each(function(){
						if($(this).attr("id") == undefined && !$(this).hasClass("record_activity")){
							$(this).remove();
						}
					});
					
					$("." + bar_container_day + " .bar").append("<div style='' class='bar_inner " + active_activity_select_name.replace(/ /g, "_") + "'><span class='time'></span></div>");
					new_appender_record_element = $("." + bar_container_day + " .bar .bar_inner:last");
				
					if(json_string.activities.length > 0){
						appender_mouse_down = true;
						e.originalEvent.preventDefault();
						$("." + bar_container_day + " .left_timepoint").css({
							"display": "block", 
							"left": -100
						});
						
						$("." + bar_container_day + " .right_timepoint").css({
							"display": "block", 
							"left": -100
						});
					}else{
						deny_slider_access();
					}
				}
			});

			$(".date_pick").click(function(){
				slider_general.Time_date.Hide_datepicker();
				return false;
			});

			add_activity_color_span.click(function(){
				add_activity_color_span.removeAttr("id");
				$(this).attr("id", "default").parent().removeClass().addClass($(this).attr("class"));
				color_pannel_add_activity.css("background", "#" + add_activity_color_div.attr("class"));
			});

			$(window).unload(function(){
				if(record_time_interval.length > 0){
					var dbstorage_value = JSON.stringify(record_time_interval);
					
					ajax.General.Dbstorage({
						type: "save",
						value: dbstorage_value,
						key: "record_activity"
					});
				}
			});
				
			$('html').keydown(function(e){
				e.keyCode == 16 || e.keyCode == 18 || e.keyCode == 17 ? delete_record_allow = true : 0;
				e.keyCode == 27 && cus_alert.is(":visible") ? cus_alert.fadeOut(100) : 0;
			});

			$('html').keyup(function(e){
				if(e.keyCode == 8 && delete_record_allow && dial_container.is(":visible") && !dial_container.find("input, textarea").is(":focus")){
					if(chosen_element_info.attr("id") == undefined){
						if(chosen_element_info.hasClass("record_activity")){
							activity_main.Record_activity({
								type: "stop", 
								activity: chosen_element_info.attr("class").split(/ /)[1]
							})
						}

						chosen_element_info.remove();
					}else{
						ajax.Activity.Delete_time_record("single_record_delete", chosen_element_info.attr("id").slice(7));
						chosen_element_info.remove();
					}

					dial_container.css("display", "none");
				}

				e.keyCode == 16 || e.keyCode == 18 || e.keyCode == 17 ? delete_record_allow = false : 0;
				e.keyCode == 27 ? dial_container.css("display", "none") : 0;
			});
		}

		return {
			Deny_slider_access: deny_slider_access,
			Allow_slider_access: allow_slider_access,
			Update_current_time: update_current_time,
			Time_pointer: time_pointer,
			Change_position_left: change_position_left,
			Change_position_right: change_position_right,
			Goto_current_time: goto_current_time,
			Create_time_lines: create_time_lines,
			Events: events
		}
	})();
	
	var activity = (function(){
		function add_activity_defaults(){
			$(".wrapper .cus_alert .alert_controlls .create_right").html("create");

			activity_edit_name = "";
			add_activity_name.val("");
			hourly_rate_currency.find("#" + settings_string.default_currency).attr("selected", "selected");
			add_activity_color_div.removeClass().addClass(add_activity_span_defaults.attr("class"));
			color_pannel_add_activity.css("background", "#" + add_activity_span_defaults.attr("class"));
			add_activity_color_div.find("span").removeAttr("id");
			add_activity_color_div.find("span." + add_activity_span_defaults.attr("class")).attr("id", "default");
			activity_billable.removeAttr("checked");
			activity_hourly_rate.hide();
			add_activity_hourly_rate.val("");

			activity_create_type = "create";
		}
		
		function add_group_defaults(){
			add_group_name.val("");
		}

		function change_active_activity(){
			if(json_string.activities.length){
				active_activity_select = activity_select.find(":selected").attr("class").split(/ /)[1];
				active_activity_select_name = activity_select.find(":selected").html();
				activity_demo_color.css("background", active_activity_select);
				tools_activity_record.removeClass("activity_recording").html("Record");

				for(var i = 0; i < record_time_interval.length; i++){
					if(record_time_interval[i].activity == active_activity_select_name.replace(/ /g, "_")){
						tools_activity_record.addClass("activity_recording").html("Stop Recording");
						break;
					}
				}
			}
		}

		function cancel_activity_name(){
			var activity_name_input = $("input.activity_name");

			if(activity_name_input.length){
				activity_name_input.replaceWith("<span class='activity_name'>" + (activity_name_input.parent().attr("class").split(/ /g)[1] || activity_name_input.parent().parent().attr("class")).replace(/_/g, " ") + "</span>");
				$(".activity_stuff").find("a.save_name, a.cancel_name").remove();
				activity_name_warning({type: "hide"});
			}
		}

		function activity_name_warning(args){
			var activity_name_input = $("input.activity_name");
			var warning_teller = $(".warning_teller");
			var warning_teller_text = $(".text", warning_teller);

			if(args.type == "show"){
				warning_teller_text.html(args.message || "Activities and Groups must contain no more than 50 alphanumeric characters and spaces Although they must not start or end with a space.");
	
				if(warning_teller.is(":hidden")){
					warning_teller.show().css({
						"top": activity_name_input.offset().top - $(".activity_stuff").offset().top - warning_teller.height() / 2 + 10,
						"left": activity_name_input.offset().left - $(".activity_stuff").offset().left + 250,
						"opacity": 0
					}).animate({
						"opacity": 1, 
						"top": "-=10"
					}, 100);
				}else{
					warning_teller.css("top", activity_name_input.offset().top - $(".activity_stuff").offset().top - warning_teller.height() / 2);
				}
			}else if(args.type == "hide"){
				if(warning_teller.is(":visible")){
					warning_teller.animate({
						"opacity": 0, 
						"top": "+=10"
					}, 100, function(){
						$(this).hide();
					});
				}
			}
		}


		function change_activity_name(args){
			var activity_name_input = $("input.activity_name");

			for(var i = 0; i < json_string.activities.length; i++){
				if(json_string.activities[i].name.toLowerCase() == args.new_name.replace(/_/g, " ").toLowerCase() && args.new_name.replace(/_/g, " ").toLowerCase() != args.old_name.replace(/_/g, " ").toLowerCase()){
					activity_name_warning({type: "show", message: "That activity name already exists!"});
					return false;
				}
			}

			for(var i = 0; i < json_string.groups.length; i++){
				if(json_string.groups[i].name.toLowerCase() == args.new_name.replace(/_/g, " ").toLowerCase() && args.new_name.replace(/_/g, " ").toLowerCase() != args.old_name.replace(/_/g, " ").toLowerCase()){
					activity_name_warning({type: "show", message: "That group name already exists!"});
					return false;
				}
			}

			if(!activity_regex.test(args.new_name.replace(/_/g, " "))){
				activity_name_warning({type: "show"});
				return false;
			}

			if(args.old_name != args.new_name){
				if(args.type == "activity"){
					for(var i = 0; i < json_string.activities.length; i++){
						if(json_string.activities[i].name == args.old_name.replace(/_/g, " ")){
							json_string.activities[i].name = args.new_name.replace(/_/g, " ");
							bar.find(".bar_inner." + args.old_name).removeClass(args.old_name).addClass(args.new_name);
							bar.find(".bar_inner.record_activity." + args.new_name).removeClass("record_activity").addClass("record_activity");
							ajax.Slider.Change_record_activity(args);

							break;
						}
					}
				}else if(args.type == "group"){
					for(var i = 0; i < json_string.groups.length; i++){
						if(json_string.groups[i].name == args.old_name.replace(/_/g, " ")){
							json_string.groups[i].name = args.new_name.replace(/_/g, " ");

							for(var j = 0; j < json_string.activities.length; j++){
								if(json_string.activities[j].parent == args.old_name.replace(/_/g, " ")){
									json_string.activities[j].parent = args.new_name.replace(/_/g, " ");
								}
							}

							for(var k = 0; k < json_string.groups.length; k++){
								if(json_string.groups[k].parent == args.old_name.replace(/_/g, " ")){
									json_string.groups[k].parent = args.new_name.replace(/_/g, " ");
								}
							}

							break;
						}
					}
				}

				ajax.Activity.Add_activity(JSON.stringify(json_string));
			}

			cancel_activity_name();
		}

		function delete_groups(dat_name){
			cus_alert.fadeIn(100);
			alert_inner.hide();
			$(".wrapper .cus_alert .alert_inner.delete_group").show();
			$(".wrapper .cus_alert .alert_inner.delete_group .alert_text").html("are you sure you want to delete the group <strong>" + dat_name + "</strong>, and all the activities and groups inside it?");
			$(".wrapper .cus_alert .alert_inner.delete_group").css({"margin-left": (alert_inner.width() / 2 + 10) * -1, "margin-top": ($(".wrapper .cus_alert .alert_inner.delete_group").height() / 2 + 20) * -1});
			$(".wrapper .cus_alert .delete_group .alert_controlls a").click(function(){ cus_alert.fadeOut(100); return false; });
			group_name_delete = dat_name;
		}
		
		function delete_activities(dat_name){
			cus_alert.fadeIn(100);
			alert_inner.hide();
			$(".wrapper .cus_alert .alert_inner.delete_activity").show();
			$(".wrapper .cus_alert .alert_inner.delete_activity .alert_text").html("are you sure you want to delete the group <strong>" + dat_name + "</strong>, and all the activities and groups inside it?");
			$(".wrapper .cus_alert .alert_inner.delete_activity").css({"margin-left": (alert_inner.width() / 2 + 10) * -1, "margin-top": ($(".wrapper .cus_alert .alert_inner.delete_activity").height() / 2 + 20) * -1});
			$(".wrapper .cus_alert .delete_activity .alert_controlls a").click(function(){ cus_alert.fadeOut(100); return false; });
			$(".wrapper .cus_alert .alert_inner.delete_activity .alert_text").html("Are you sure you want to delete the activity <strong>" + dat_name + "</strong>?");
			activity_name_delete = dat_name;
		}

		function edit_activity(activity_name){
			$(".wrapper .cus_alert .alert_controlls .create_right").html("update");
			activity_edit_name = "";
			add_activity_name_error.hide();
			add_activity_hourly_rate_error.hide();
			cus_alert.fadeIn(100);
			alert_inner.hide();
			add_activity_ui.show().css({"margin-left": (alert_inner.width() / 2 + 10) * -1, "margin-top": (add_activity_ui.height() / 2 + 20) * -1});
			activity_name = activity_name.replace(/_/g, " ");

			add_activity_groups.html("<option>No Parent</option>");

			for(var i = 0; i < json_string.groups.length; i++){
				add_activity_groups.append(" \
					<option>" + json_string.groups[i].name + "</option> \
				");
			}

			add_activity_name.val(activity_name);
			activity_hourly_rate.show();
			add_activity_groups.val("");
			add_activity_hourly_rate.val("");
			hourly_rate_currency.find("#" + settings_string.default_currency).attr("selected", "selected");
			add_activity_color_div.removeClass().addClass(add_activity_span_defaults.attr("class"));
			color_pannel_add_activity.css("background", "#" + add_activity_span_defaults.attr("class"));
			activity_billable.removeAttr("checked");

			for(var i = 0; i < json_string.activities.length; i++){
				if(json_string.activities[i].name == activity_name){
					var edit_billable = json_string.activities[i].hourly_rate ? true : false;
					var edit_currency = json_string.activities[i].currency;
					var edit_hourly_rate = json_string.activities[i].hourly_rate || "";
					var edit_activity_parent = json_string.activities[i].parent || "";
					var edit_activity_color = json_string.activities[i].color;
				}
			}

			if(edit_billable){
				activity_billable.attr("checked", "checked");
				hourly_rate_currency.val(edit_currency);
				add_activity_hourly_rate.val(edit_hourly_rate)
			}else{
				activity_hourly_rate.hide();
			}

			edit_activity_parent ? add_activity_groups.val(edit_activity_parent) : 0;

			add_activity_color_div.find("span").removeAttr("id");
			add_activity_color_div.find("span." + edit_activity_color.substring(1)).attr("id", "default");
			add_activity_color_div.removeClass().addClass(edit_activity_color.substring(1));
			color_pannel_add_activity.css("background", "#" + edit_activity_color.substring(1));
			
			activity_create_type = "edit";
			activity_edit_name = activity_name;
		}

		function events(){
			activity_billable.change(function(){
				activity_billable.is(":checked") ? activity_hourly_rate.show() : activity_hourly_rate.hide();
			});

			activity_select.change(function(){
				slider_general.Activity.Change_active_activity();
			});

			add_activity_create_right.click(function(e){
				console.log("hallo")

				if(add_activity_name.val() == ""){
					add_activity_name_error.show().html("*");
					return false;
				}else{
					if(json_string.activities.length != 0){
						for(var e = 0; e < json_string.activities.length; e++){
							if(json_string.activities[e].name.toLowerCase() == add_activity_name.val().toLowerCase()){
								if(activity_edit_name.replace(/_/g, " ").toLowerCase() != json_string.activities[e].name.toLowerCase()){
									add_activity_name_error.show().html("already exists");
									return false;
								}
							}else{
								add_activity_name_error.hide();
								add_activity_hourly_rate_error.hide();
							}
						}
					}

					if(!activity_regex.test(add_activity_name.val())){
						add_activity_name_error.show().html("Activities and Groups must contain no more than 50 alphanumeric characters and spaces Although they must not start or end with a space.");
						return false;
					}
				}
				
				if(add_activity_groups.val() == "No Parent"){
					add_activity_object = {
						"name": add_activity_name.val(),
						"color": "#" + add_activity_color_div.attr("class")
					};
				}else{
					add_activity_object = {
						"name": add_activity_name.val(),
						"parent": add_activity_groups.val(),
						"color": "#" + add_activity_color_div.attr("class")
					};
				}

				if(activity_billable.is(":checked")){
					if(!add_activity_hourly_rate.val() || !hourly_rate_regex.test(add_activity_hourly_rate.val())){
						add_activity_hourly_rate_error.show().html("error");
						return false;
					}

					add_activity_object["hourly_rate"] = add_activity_hourly_rate.val();
					add_activity_object["currency"] = hourly_rate_currency.val();
				}

				if(activity_create_type == "edit"){
					for(var i = 0; i < json_string.activities.length; i++){
						if(activity_edit_name.replace(/_/g, " ") == json_string.activities[i].name){
							json_string.activities.splice(i, 1, add_activity_object);
							bar.find(".bar_inner." + activity_edit_name.replace(/ /g, "_")).removeClass(activity_edit_name.replace(/ /g, "_")).addClass(add_activity_object.name.replace(/ /g, "_"));
							bar.find(".bar_inner.record_activity." + add_activity_object.name).removeClass("record_activity").addClass("record_activity");
							
							ajax.Slider.Change_record_activity({
								new_name: add_activity_object.name,
								old_name: activity_edit_name.replace(/_/g, " ")
							});
							
							for(var j = 0; j < record_time_interval.length; j++){
								if(activity_edit_name.replace(/ /g, "_") == record_time_interval[j].activity.replace(/ /g, "_")){
									record_time_interval[j].activity = add_activity_object.name;
									break;
								}
							}
						}
					}
				}else if(activity_create_type == "create"){
					json_string.activities.push(add_activity_object);					
				}
				
				ajax.Activity.Add_activity(JSON.stringify(json_string));
				cus_alert.fadeOut(100);
				return false;
			});

			$(".wrapper .cus_alert .alert_inner .alert_controlls a.no_left").click(function(){ 
				cus_alert.fadeOut(100); 
				group_name_delete = "";
				activity_name_delete = "";
				return false; 
			});	

			// create group
			$(".wrapper .cus_alert .add_group_ui .alert_controlls .create_group_right").click(function(e){
				if(add_group_name.val() == false){
					add_group_error.show().html("\*");
					return false;
				}else{
					for(var e = 0; e < json_string.groups.length; e++){
						if(json_string.groups[e].name.replace(/ /, "_").toLowerCase() == add_group_name.val().replace(/ /, "_").toLowerCase()){
							add_group_error.show().html("already exists");
							return false;
						}else{
							add_group_error.hide();
						}
					}
				}
				
				if(add_group_select.val() == "No Parent"){
					add_group_object = {
						"name": add_group_name.val()
					};
				}else{
					add_group_object = {
						"name": add_group_name.val(),
						"parent": add_group_select.val()
					};
				}
				
				json_string.groups.push(add_group_object);
				ajax.Activity.Add_activity(JSON.stringify(json_string));
				cus_alert.fadeOut(100);
				return false;
			});

			activity_dial_select.change(function(){
				var new_dial_select_class = activity_dial_select.find(":selected").attr("class").split(/ /);
				dial_title.css("background", new_dial_select_class[1]);
				dial_title_arrow.css("border-bottom-color", new_dial_select_class[1]);

				dial_billable_section.show();
				is_activity_billable = true;

				for(var i = 0; i < json_string.activities.length; i++){
					if(new_dial_select_class[0] == json_string.activities[i].name.replace(/ /g, "_")){
						if(!json_string.activities[i].currency){
							is_activity_billable = false;
						}else{
							dial_currency = json_string.activities[i].currency;
							dial_hourly_rate = json_string.activities[i].hourly_rate
							hour_rate_currency.html(dial_currency)
							hour_pay.val(dial_hourly_rate);
						}

						break;
					}
				}

				!is_activity_billable ? dial_billable_section.hide() : 0;

				chosen_element_info.removeClass(chosen_element_info.attr("class").split(/ /)[1]).addClass(new_dial_select_class[0]);
				chosen_element_info.css("background", slider_general.Helper.Hex2rgb(new_dial_select_class[1]));
			});

			$(".activity_stuff").on("click", ".cancel_name", cancel_activity_name);

			$(".activity_stuff").on("keyup", "input.activity_name", function(e){
				if(e.keyCode == 27){
					cancel_activity_name();
				}

				if(e.keyCode == 13){
					var activity_or_group = $(this).parent().is("span");
					var name_parent_elm = (activity_or_group ? $(this).parent().parent() : $(this).parent());
					var activity_old_name = name_parent_elm.attr("class").split(/ /g)[(activity_or_group ? 0 : 1)];
					var activity_new_name = name_parent_elm.find(".activity_name").val().replace(/ /g, "_");

					var change_activity_name_var = change_activity_name({
						type: (activity_or_group ? "group" : "activity"),
						old_name: activity_old_name,
						new_name: activity_new_name
					});
				}
			});

			$(".activity_stuff").on("click", ".save_name", function(){
				var activity_or_group = $(this).parent().is("span");
				var name_parent_elm = (activity_or_group ? $(this).parent().parent() : $(this).parent());
				var activity_old_name = name_parent_elm.attr("class").split(/ /g)[(activity_or_group ? 0 : 1)];
				var activity_new_name = name_parent_elm.find(".activity_name").val().replace(/ /g, "_");

				var change_activity_name_var = change_activity_name({
					type: (activity_or_group ? "group" : "activity"),
					old_name: activity_old_name,
					new_name: activity_new_name
				});

				if(change_activity_name_var){
					cancel_activity_name(activity_new_name);
				}
			});

			$(".activity_stuff").on("dblclick", ".activity_name", function(){
				if($(this).is("span")){
					cancel_activity_name();
					var name_parent_elm = $(this).parent();

					$("<a href='#' class='save_name' onclick='return false'>save</a><a href='#' class='cancel_name' onclick='return false'>cancel</a>").insertAfter(this);
					$(this).replaceWith("<input type='text' value='" + $(this).html() + "' class='activity_name'/>");
					name_parent_elm.find(".activity_name").focus().select();
				}
			});	

			$(".activity_stuff").on("dblclick", ".group_name", function(){
				if($(this).is("span")){
					cancel_activity_name();
					var name_parent_elm = $(this).parent().parent();

					$("<a href='#' class='save_name' onclick='return false'>save</a><a href='#' class='cancel_name' onclick='return false'>cancel</a>").insertAfter(this);
					$(this).replaceWith("<input type='text' value='" + $(this).html() + "' class='activity_name'/>");
					name_parent_elm.find(".activity_name").focus().select();
				}
			});

			$(".activity_stuff").on("click", ".box_color", function(){
				current_color_change = $(this);

				color_select.show().css({
					"top": $(this).offset().top - activities_main.offset().top + 23,
					"left": $(this).offset().left - activities_main.offset().left
				});

				color_select.find("span").attr("id", "")
				color_select.find("span." + $(this).attr("class").split(/ /g)[1].replace(/#/, "")).attr("id", "default");
			});

			color_select.find("span").mousedown(function(e){
				current_color_change.removeClass(current_color_change.attr("class").split(/ /g)[1]).addClass("#" + $(this).attr("class"))
				current_color_change.css("background", "#" + $(this).attr("class"));
				color_select.find("span").attr("id", "");
				$(this).attr("id", "default");
				bar.find(".bar_inner." + current_color_change.parent().attr("class").split(/ /g)[1]).css("background-color", slider_general.Helper.Hex2rgb("#" + $(this).attr("class")))

				for(var i = 0; i < json_string.activities.length; i++){
					if(json_string.activities[i].name.replace(/ /g, "_") == current_color_change.parent().attr("class").split(" ")[1]){
						json_string.activities[i].color = "#" + $(this).attr("class");
						break;
					}
				}

				ajax.Activity.Add_activity(JSON.stringify(json_string));
			});

			$(".activity_stuff").on("click", ".trash_activity", function(){
				var name_val = $(this).parent().parent().find('.activity_name').html();
				delete_activities(name_val);
			});

			$(".activity_stuff").on("click", ".edit_activity", function(e){
				edit_activity($(this).closest("li.activity").attr("class").split(/ /g)[1]);
			});

			$(".activity_stuff").on("click", ".play_activity", function(e){
				var activity_name = $(this).parent().parent().find('.activity_name').html().replace(/ /g, "_");
				var activity_background = slider_general.Helper.Hex2rgb($(this).parent().parent().find('.box_color').attr("class").split(/ /)[1]);
				$("." + day_name.toLowerCase() + "_container .bar").append("<div style='' class='bar_inner " + activity_name + " record_activity'><span class='bar_left'></span><span class='bar_right'></span><span class='time'></span></div>");
				
				if(!$(this).hasClass("recording")){
					activity_main.Record_activity({
						type: "start",
						element: $("." + day_name.toLowerCase() + "_container .bar .bar_inner.record_activity." + activity_name),
						activity: activity_name,
						background: activity_background,
						move_to_current_time: true
					});
				}else{
					activity_main.Record_activity({
						type: "stop", 
						activity: activity_name,
						move_to_current_record: true
					});
				}
			});

			$(".activity_stuff").on("click", ".delete_group", function(){
				var name_val = $(this).parent().parent().attr("class").replace(/_/g, " ");
				delete_groups(name_val);
			});

			$(".activity_stuff").on("click", ".hide_show_stuff", function(e){
				var class_array = $(e.target).hasClass("down") ? ["down", "up"] : ["up", "down"];
				$(e.target).removeClass(class_array[0]).addClass(class_array[1]).closest("ul").find(" > div, > ul").toggle();
			});
			

			/* DRAGABLE ACTIVITY AND GROUP MOVEMENT */

			$(".activities_main").on("mouseup", ".activity_stuff", function(e){
				if(mouse_activity_group_move){
					var old_json_string = $.extend({}, json_string);

					$(".activity_stuff ul > div").each(function(){
						if($(this).parent().offset().top - $(".activity_stuff").offset().top < $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top && $(this).parent().offset().top + $(this).height() + $(this).parent().find(".name").height() + 13 - $(".activity_stuff").offset().top > $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top){
							if($(this).closest("." + activities_groups_event_class).length != 0){
								$(".activity_stuff .dragging_activity_group").remove();
								dragging_type == "activity" ? $(".activity_stuff li." + activities_groups_event_class).removeAttr("style") : $(".activity_stuff ul." + activities_groups_event_class).removeAttr("style");
								return false;
							}else{
								if(dragging_type == "activity"){
									$(".activity_stuff li." + activities_groups_event_class).remove();
									$(this).append($(".activity_stuff .dragging_activity_group").removeAttr("style").attr("class", "activity " + activities_groups_event_class));	
									
									for(var i = 0; i < json_string.activities.length; i++){
										if(json_string.activities[i].name.replace(/ /g, "_") == activities_groups_event_class){
											json_string.activities[i].parent = $(this).parent().attr("class").replace(/_/g, " ");
											var json_string_item = json_string.activities.splice(i, 1);
											json_string.activities.unshift(json_string_item[0]);
											console.log(json_string.activities);
											break;
										}
									}
								}else{
									$(".activity_stuff ul." + activities_groups_event_class).remove();
									$(this).parent().append($(".activity_stuff .dragging_activity_group").removeAttr("style").attr("class", activities_groups_event_class));

									for(var i = 0; i < json_string.groups.length; i++){
										if(json_string.groups[i].name.replace(/ /g, "_") == activities_groups_event_class){
											json_string.groups[i].parent = $(this).parent().attr("class").replace(/_/g, " ");
											var json_string_item = json_string.groups.splice(i, 1);
											json_string.groups.push(json_string_item[0]);
											break;
										}
									}
								}
								
								ajax.Activity.Add_activity(JSON.stringify(json_string));

								$(this).parent().find(".name, .delete_group").removeAttr("style");
								$(".activity_stuff .dragging_activity_group").remove();
								return false;
							}
						}else if($(".activity_stuff .root_activities").offset().top - $(".activity_stuff").offset().top - 3 < $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top && $(".activity_stuff .root_activities").offset().top + $(".activity_stuff .root_activities").height() - $(".activity_stuff").offset().top + 18 > $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top){
							if(dragging_type == "activity"){
								$(".activity_stuff li." + activities_groups_event_class).remove();
								$(".activity_stuff > div").append($(".activity_stuff .dragging_activity_group").removeAttr("style").attr("class", "activity " + activities_groups_event_class));	
								
								for(var i = 0; i < json_string.activities.length; i++){
									if(json_string.activities[i].name.replace(/ /g, "_") == activities_groups_event_class){
										delete json_string.activities[i].parent;
										var json_string_item = json_string.activities.splice(i, 1);
										json_string.activities.push(json_string_item[0]);
										break;
									}
								}
							}else{
								$(".activity_stuff ul." + activities_groups_event_class).remove();
								$(".activity_stuff").append($(".activity_stuff .dragging_activity_group").removeAttr("style").attr("class", activities_groups_event_class));
								
								for(var i = 0; i < json_string.groups.length; i++){
									if(json_string.groups[i].name.replace(/ /g, "_") == activities_groups_event_class){
										delete json_string.groups[i].parent;
										var json_string_item = json_string.groups.splice(i, 1);
										json_string.groups.push(json_string_item[0]);
										break;
									}
								}
							}
							
							ajax.Activity.Add_activity(JSON.stringify(json_string));

							$(".activity_stuff .dragging_activity_group").remove();
							return false;
						}
					});

					if($(".activity_stuff .dragging_activity_group").is(":visible")){
						$(".activity_stuff .dragging_activity_group").remove();
						dragging_type == "activity" ? $(".activity_stuff li." + activities_groups_event_class).removeAttr("style") : $(".activity_stuff ul." + activities_groups_event_class).removeAttr("style");
					}
				}

				$(move_groups_this).parent().removeAttr("style");
				$(".activity_stuff .root_activities").hide();
				dstance_from_mouse_down = 0;
				mouse_activity_move_first_time = true;
				mouse_activity_group_move = false;
				move_activities_groups = false;
			});		


			$(".activities_main").on("mousedown", "ul > div > li.activity, ul > .name", function(e){
				if(!$("*:focus").is("textarea, input") && !$("*:active").is(".save_name, .cancel_name")){
					move_activities_groups = true;
				}
				move_activities_groups_event = e;
				move_activities_groups_this = this;
				pageY_old = move_activities_groups_event.pageY;
				mouse_click_center_x = e.pageX - $(this).offset().left;
				mouse_click_center_y = e.pageY - $(this).offset().top;
			});			
			
			$(".activity_stuff").on("mousemove", function(e){
				if(move_activities_groups){
					dragging_type = ($(move_activities_groups_this).prop('tagName') == "LI" ? "activity" : "group");

					if(mouse_activity_group_move){
						activities_groups_event_class = (dragging_type == "activity" ? 
							$(move_activities_groups_this).find(".activity_name").html().replace(/ /g, "_") : 
							$(move_activities_groups_this).closest("ul").attr("class"));


						activities_groups_event_data_level = $(move_activities_groups_this).parent("ul").data("level");
						if(mouse_activity_move_first_time){
							dragging_type == "activity" ? 
								$(this).append("<li class='dragging_activity_group " + activities_groups_event_class + "_moving'>" + $(move_activities_groups_this).html() + "</li>") : 
								$(this).append("<ul class='dragging_activity_group " + activities_groups_event_class + "_moving'>" + $(move_activities_groups_this).parent("ul").html() + "</ul>");

							dragging_type == "activity" ?
								$(move_activities_groups_this).animate({"opacity": 0.5}, 300) : 
								$(move_activities_groups_this).parent("ul").animate({"opacity": 0.5}, 300);
							mouse_activity_move_first_time = false;
						}

						$(move_activities_groups_this).parent("ul").css({"opacity": 0.5});

						if(!$(".activity_stuff ul > div").length){
							$(".activity_stuff .dragging_activity_group").css({
								"width": $(".activity_stuff").width(),
								"left": 0
							}, 50);
						}

						$(".activity_stuff ul > div").each(function(){
							if(
								$(this).parent().offset().top - $(".activity_stuff").offset().top < $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top && 
								$(this).parent().offset().top + $(this).height() + $(this).parent().find(".name").height() + 13 - $(".activity_stuff").offset().top > $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top
							){
								if($(this).parent().hasClass(activities_groups_event_class) || $(this).closest("." + activities_groups_event_class).length != 0){
									$(".activity_stuff .dragging_activity_group").stop().animate({
										"width": $(this).closest("." + activities_groups_event_class).find(".name").width() - 8,
										"left": $(this).closest("." + activities_groups_event_class).find(".name").offset().left - $(".activity_stuff").offset().left
									}, 50);
									return false;
								}

								$(".activity_stuff .dragging_activity_group").stop().animate({
									"width": $(this).parent().find(".name").width() + (dragging_type == "activity" ? 5 : -8),
									"left": $(this).parent().find(".name").offset().left - $(".activity_stuff").offset().left
								}, 50);
								
								$(this).parent().children(".name").css({
									"background": "#d64242",
									"border-color": "#b23131"
								}).children(".delete_group").css({
									"background-color": "#ea6060",
									"border-color": "#b23131"
								});
							}else{
								$(this).parent().find(".name, .delete_group").removeAttr("style");
							}
						});

						if(
							$(".activity_stuff .root_activities").offset().top - $(".activity_stuff").offset().top - 3 < $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top && 
							$(".activity_stuff .root_activities").offset().top + $(".activity_stuff .root_activities").height() - $(".activity_stuff").offset().top + 18 > $(".activity_stuff .dragging_activity_group").offset().top - $(".activity_stuff").offset().top
						){
							$(".activity_stuff .root_activities").css("border-color", "#ea9d9d");
						}else{
							$(".activity_stuff .root_activities").css("border-color", "#edb8b8");
						}

						$(".activity_stuff .dragging_activity_group").css({
							"position": "absolute",
							"top": e.pageY - $(".activity_stuff").offset().top - 25,
							"opacity": 0.8,
						});
					}else{
						var mouse_move_from_activity_spot_x = e.pageX - $(move_activities_groups_this).offset().left;
						var mouse_move_from_activity_spot_y = e.pageY - $(move_activities_groups_this).offset().top;
						var xFromCentre = mouse_move_from_activity_spot_x - mouse_click_center_x;
						var yFromCentre = mouse_move_from_activity_spot_y - mouse_click_center_y;
						dstance_from_mouse_down = Math.sqrt(Math.pow(Math.abs(xFromCentre), 2) + Math.pow(Math.abs(yFromCentre), 2));
						if(dstance_from_mouse_down > 20){
							mouse_activity_group_move = true;
							$(".activities .activities_main ul.activity_stuff span.root_activities").show();
						}					
					}
				}
			});

			$(".wrapper .activities_nav li a.new_group").click(function(){
				slider_general.Activity.Add_group_defaults();
				cus_alert.fadeIn(100);
				alert_inner.hide();
				add_group_ui.show().css({"margin-left": (alert_inner.width() / 2 + 10) * -1, "margin-top": (add_group_ui.height() / 2 + 20) * -1});
				add_group_select.html("").append("<option>No Parent</option>");
				add_group_error.hide();
				add_group_name.focus();
				
				$.each(json_string.groups, function(index, value){
					add_group_select.append("\
						<option>" + value.name + "</option> \
					");
				});
				
				return false;
			});


			$(".activity_stuff").mouseout(function(){
				if(move_activities_groups){
					$(move_activities_groups_event.target).css("position", "none");
					$(move_activities_groups_event.target).parent().removeAttr("style");
				}
			});

			$(".wrapper .cus_alert .alert_controlls .no_left").click(function(){ 
				group_name_delete = "";
				activity_name_delete = "";
			});
		
			$(".wrapper .cus_alert .alert_inner.delete_activity .alert_controlls .yes_right").click(function(){ 
				$.each(json_string.activities, function(index, value){
					if(value.name == activity_name_delete.toString()){
						json_string.activities.splice(index, 1);
						ajax.Activity.Add_activity(JSON.stringify(json_string), value.name.replace(/ /g, "_"));
						return false;
					}
				});
			});	

			$(".wrapper .cus_alert .alert_inner.delete_group .alert_controlls .yes_right").click(function(){ 
				activities_delete_array = [];

				function delete_loop(item_name){
					for(var j = 0; j < json_string.activities.length; j++){
						if(item_name == json_string.activities[j].parent){
							activities_delete_array.push(json_string.activities[j].name.replace(/ /g, "_"));
							json_string.activities.splice(j, 1);
							j--;
						}
					}

					for(var i = 0; i < json_string.groups.length; i++){
						if(item_name == json_string.groups[i].parent){
							delete_loop(json_string.groups[i].name);
							json_string.groups.splice(i, 1);
							i--;
						}
					}
				}

				delete_loop(group_name_delete);

				for(var i = 0; i < json_string.groups.length; i++){
					group_name_delete == json_string.groups[i].name ? json_string.groups.splice(i, 1) : 0;
				}

				ajax.Slider.Delete_multiple_activity_timerecords(activities_delete_array);
				ajax.Activity.Add_activity(JSON.stringify(json_string));
				return false;
			});

			$(".wrapper .activities_nav li a.new_activity").click(function(){
				slider_general.Activity.Add_activity_defaults();
				cus_alert.fadeIn(100);
				alert_inner.hide();
				add_activity_ui.show().css({"margin-left": (alert_inner.width() / 2 + 10) * -1, "margin-top": (add_activity_ui.height() / 2 + 20) * -1});
				add_activity_groups.html("<option>No Parent</option>");
				add_activity_name_error.hide();
				add_activity_hourly_rate_error.hide();
				add_activity_name.focus();
				
				for(var i = 0; i < json_string.groups.length; i++){
					add_activity_groups.append(" \
						<option>" + json_string.groups[i].name + "</option> \
					");
				}
				
				return false;
			});
		}

		return {
			Add_group_defaults: add_group_defaults,
			Add_activity_defaults: add_activity_defaults,
			Change_active_activity: change_active_activity,
			Cancel_activity_name: cancel_activity_name,
			Change_activity_name: change_activity_name,
			Events: events
		}
	})();

	function init(){
		the_day.html(day_name + " " + date_number + " " + month_name + "&#44; " + year);
		the_datepicker.hide();
		root_activities.hide();
		load_data.hide().css("right", (load_data.width() * -1) - 9);
		bar_container.find(".current_time").css("opacity", 0);
		$(".left_timepoint, .right_timepoint").hide();
		$(".bar_container." + day_name.toLowerCase() + "_container .current_time").css("opacity", 1);
		$(".day_bar span." + day_name.toLowerCase() + "_text").css("color", "#ffffff");
		$("header .tools_nav .account .account_container").css("width", $("header .tools_nav .account").width() + 18);
		pulse_settings_warning_height = settings_warning.height();
		settings_warning.hide();
		ban_slider.hide();
		activity.Add_activity_defaults();
		activity.Add_group_defaults();
	}

	return {
		Slider: slider,
		Activity: activity,
		Helper: helper,
		Settings: settings,
		Time_date: time_date,
		Init: init
	}
})();