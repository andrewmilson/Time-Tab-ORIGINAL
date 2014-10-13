var report_general = (function(){
	var helper = (function(){
		function previouse_month_info(year, month) {
			return new Date(year, month, 0);
		}

		function time_conversion(args){
			if(args.type == 24){
				args.time += args.period == "PM" ? 12 : 0;
			}else if(args.type == 12){
				if(!args.period){
					args.period = ["AM", "PM", "PM"][Math.floor(args.time / 12)];
					args.time = (args.time + 11) % 12 + 1;
				}
			}

			args.period = args.period || "";

			return {
				Time: args.time,
				Period: args.period
			}
		}

		function quote(str) {
			return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
		}

		return {
			PreviouseMonthInfo: previouse_month_info,
			Time_conversion: time_conversion,
			Quote: quote
		}
	})();

	var time_date = (function(){
		function days_in_custom_month(the_year, the_month){
			return new Date(the_year, the_month, 0).getDate();
		}

		function date_format(date, old_format, new_format, new_separator){
			var separator = date.replace(/[0-9]/g, '').substring(0, 1);
			var new_date_seperator = new_format.replace(/[a-z]/g, '').substring(0, 1)
			var old_date_seperator = old_format.replace(/[a-z]/g, '').substring(0, 1)

			var old_date_obj = {};
			var new_date = "";

			new_format = new_format.split(new_date_seperator);
			old_format = old_format.split(old_date_seperator);
			date = date.split(separator);
			
			old_date_obj[old_format[0]] = date[0];
			old_date_obj[old_format[1]] = date[1];
			old_date_obj[old_format[2]] = date[2];

			if(old_date_obj["yy"]){
				old_date_obj["yyyy"] = 20 + old_date_obj["yy"];
			}else if(old_date_obj["yyyy"]){
				old_date_obj["yy"] = old_date_obj["yyyy"].slice(2);
			}

			for(var i = 0; i < date.length; i++){
				new_date = new_date + old_date_obj[new_format[i]] + separator;
			}

			var separator_regex = new RegExp(helper.Quote(separator), "g")
			new_date = new_date.slice(0,-1).replace(separator_regex, new_separator);

			return(new_date); 
		}

		function toggle_date_button(args){
			if(args.element.is(":hidden")){
				date_pick.removeAttr("style");
			}else{
				date_pick.removeAttr("style");
				args.dateButton.css({
					"border-color": "#000", 
					"background": "url('/static/images/icons/callendar_black.gif') no-repeat 4px 3px, #292929",
					"color": "#ddd",
					"text-shadow": "0 1px 0 #000"
				});
			}
		}

		function hide_datepicker(args){
			var date_button = (args.element.attr("class").split(/ /g)[1] == "from" ? date_pick_from : date_pick_to);

			if(args.element.is(":hidden")){
				the_datepicker.hide();
				args.element.stop().slideDown(200);
				toggle_date_button({
					dateButton: date_button,
					element: args.element
				});
			}else{
				the_datepicker.hide();
				args.element.show()
				args.element.stop().slideUp(200, function(){
					toggle_date_button({
						dateButton: date_button,
						element: args.element
					});
				});
			}
		}

		function events(){
			datepicker_from.datepicker({
				showOtherMonths: true,  
				changeMonth: true,
				changeYear: true,
				dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], 
				onSelect: function(dateText, inst) {
					var minDate = new Date(Date.parse(dateText));
					hide_datepicker({element: datepicker_from});

					custom_day[0] = minDate.getDay();
					custom_month[0] = minDate.getMonth() + 1;
					custom_date[0] = minDate.getDate();
					custom_year[0] = minDate.getFullYear();

					the_day_from.html(custom_date[0] + " " + months[custom_month[0] - 1] + ", " + custom_year[0]);
					datepicker_to.datepicker("option", "minDate", minDate);
				}
			});

			datepicker_to.datepicker({
				showOtherMonths: true,  
				changeMonth: true,
				changeYear: true,
				dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], 
				onSelect: function(dateText, inst) {
					var maxDate = new Date(Date.parse(dateText));
					hide_datepicker({element: datepicker_to});

					custom_day[1] = maxDate.getDay();
					custom_month[1] = maxDate.getMonth() + 1;
					custom_date[1] = maxDate.getDate();
					custom_year[1] = maxDate.getFullYear();

					the_day_to.html(custom_date[1] + " " + months[custom_month[1] - 1] + ", " + custom_year[1]);
					datepicker_from.datepicker("option", "maxDate", maxDate);
				}
			});

			date_pick.click(function(){
				hide_datepicker({
					element: $(this).parent().find(".the_datepicker")
				});

				return false;
			});
		}

		return {
			Days_in_custom_month: days_in_custom_month,
			Date_format: date_format,
			Toggle_date_button: toggle_date_button,
			Hide_datepicker: hide_datepicker,
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

	var report = (function(){
		function resize_report(e){
			$(".prime_report_container .report_preview_scroll").css("height", (e.pageY - report_resize_offset_top - 78 - report_resize_unupdated_y));	
		}

		function events(){
			resize_report_view.mousedown(function(e){
				report_resize_offset_top = $(".prime_report_container .report_preview_container").offset().top;
				report_resize_unupdated_y = e.pageY - resize_report_view.offset().top;
			
				$(document).bind("mousemove.resize_report", function(e){ resize_report(e); });
			})

			$(document).mouseup(function(e){
				$(document).unbind("mousemove.resize_report");
			});

			generate_report.click(function(){
				chosen_activities_array = [];
				generate_report.html("update report");
				report_type = "";
				
				if(!the_datepicker.is(":hidden")){
					time_date.Toggle_date_button();
					the_datepicker.stop().slideToggle(200);
				}

				function get_parent_groups(item_name){
					for(var i = 0; i < json_string.activities.length; i++){
						if(json_string.activities[i].parent == item_name.replace(/_/g, " ")){
							chosen_activities_array.push(json_string.activities[i].name.replace(/ /g, "_"));
						}
					}

					for(var i = 0; i < json_string.groups.length; i++){
						if(json_string.groups[i].parent == item_name.replace(/_/g, " ")){
							get_parent_groups(json_string.groups[i].name.replace(/ /g, "_"));
						}
					}
				}

				function get_everything(){
					for(var i = 0; i < json_string.activities.length; i++){
						chosen_activities_array.push(json_string.activities[i].name.replace(/ /g, "_"));
					}
				}

				if(activity_select.val() == "everything"){
					get_everything();
					report_type = "group";
				}else if(activity_select.find(":selected").hasClass("activity")){
					chosen_activities_array.push(activity_select.val().replace(/ /g, "_"));
					report_type = "activity";					
				}else if(activity_select.find(":selected").hasClass("group")){
					get_parent_groups(activity_select.val().replace(/ /g, "_"));
					report_type = "group";					
				}

				ajax.Report.Get_report_info({
					recordFrom: custom_year[0] + "-" + custom_month[0] + "-" + custom_date[0],
					recordTo: custom_year[1] + "-" + custom_month[1] + "-" + custom_date[1],
					chosenActivities: chosen_activities_array,
					groupName: activity_select.val().replace(/ /g, "_"),
					reportType: report_type
				});

				$(".arrow_container").fadeOut(200);
				please_generate_report.animate({"line-height": 400 + "px"}, 500);
				$(".please_generate_report .generate_text").html("generating...");

				return false;
			});

			$("a.download_btn").click(function(){
				$(".wrapper .cus_alert").fadeOut(100);

				report_meta = [];
				var download_type = $(this).data("download-type");
				var activities_list = chosen_activities_array;
				var download_date_from = custom_year[0] + "-" + custom_month[0] + "-" + custom_date[0];
				var download_date_to = custom_year[1] + "-" + custom_month[1] + "-" + custom_date[1];

				for(var i = 0; i < activities_list.length; i++){
					activities_list[i] = activities_list[i].replace(/ /g, "_");
				}

				$("#report_canvas_preview ul.root_activities > li.meta div").each(function(){
					report_meta.push($(this).find(".line").val());
				});

				console.log(settings_string.report_time_format);

				var window_loacation = {
					send_method: "download_report",
					type: download_type,
					activities: activities_list,
					round_type: rounding_type,
					rounding_amount: rounding_amount,
					date_format: settings_string.date_format.replace(/[\.\/]/g, "-"),
					time_format: settings_string.report_time_format,
					date_separator: settings_string.date_separator,
					date_from: download_date_from,
					date_to: download_date_to,
					meta: report_meta
				};

				if(download_type == "pdf"){
					var report_html = "";
					
					report_canvas_invisible.append(report_canvas_preview.html()).find(":hidden, .record_empty, .root_activities > .meta").remove();
					hide_empty.is(":checked") ? $(":hidden, .record_empty", report_canvas_invisible).remove() : 0;
					report_html = report_canvas_invisible.html();
					report_canvas_invisible.html("");

					window_loacation.content = report_html;
				}

				window.location = "/report/post/?" + $.param(window_loacation);
				return false;
			});


			$(".report_controlls a.print").click(function(){
				$("*").addClass("no_print");
				report_canvas_preview.find("*").removeClass("no_print");
				report_canvas_preview.parents().removeClass("no_print");
				report_canvas_preview.removeClass("no_print");
				$('input:text').filter(function() { return $(this).val() == ""; }).addClass("no_print");
				window.print();
				$("*").removeClass("no_print");
			});

			$(".no_left").click(function(){
				$(".cus_alert").fadeOut(100);
			});

			$("html").keydown(function(e){
				e.keyCode == 27 && $(".cus_alert").is(":visible") ? $(".cus_alert").fadeOut(100) : 0;
			});
		}
		
		return {
			ResizeReport: resize_report,
			Events: events
		}
	})();

	function init(){
		load_data.hide().css("right", (load_data.width() * -1) - 9);
		$("header .tools_nav .account .account_container").css("width", $("header .tools_nav .account").width() + 18);
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
		Report: report,
		Helper: helper,
		Time_date: time_date,
		Init: init,
		Settings: settings
	}
})();