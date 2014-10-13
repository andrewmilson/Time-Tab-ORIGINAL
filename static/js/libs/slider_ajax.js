var ajax = (function(){
	var general = (function(){
		slider_snap = $(".slider_time_snap").find(":selected").attr("id") * 2;

		function sending_data(){
			if(load_data.is(":hidden")){//sending_data_toggle){
				load_data.show().stop().animate({"right": 0}, 100, 'linear');
			}else{
				load_data.stop().animate({"right": (load_data.width() * -1) - 9}, 100, 'linear', function(){
					$(this).hide();
				});
			}
		}

		function get_settings(){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				dataType: 'json',				
				data: {send_method: "get_user_settings", csrfmiddlewaretoken: csrf_token},
				success: function(data){
					settings_string = data;
					slider_snap = settings_string.slider_time_snap * 2;

					slider_general.Slider.Create_time_lines(settings_string.slider_time_format);

					// general settings
					$(".wrapper header .tools_nav li.settings select.date_format").val(settings_string.date_format);
					$(".wrapper header .tools_nav li.settings select.date_separator").val(settings_string.date_separator);
					$(".wrapper header .tools_nav li.settings select.slider_time_format").val(settings_string.slider_time_format);
					$(".wrapper header .tools_nav li.settings select.report_time_format").val(settings_string.report_time_format);
					$(".wrapper header .tools_nav li.settings select.default_currency #" + settings_string.default_currency).attr("selected", "selected");

					// slider settings
					$(".wrapper header .tools_nav li.settings select.slider_time_snap").val(settings_string.slider_time_snap);
					$(".wrapper header .tools_nav li.settings select.slider_start_time").find("#" + settings_string.slider_start_time).attr("selected", "selected");
					console.log("wo", $(".wrapper header .tools_nav li.settings select.slider_start_time").find("#" + settings_string.slider_start_time).val());
					
					slider_general.Slider.Goto_current_time(false, (settings_string.slider_start_time != 100 ? settings_string.slider_start_time * 120 + (bar_container.width() + 2) / 2 : undefined));
					console.log(settings_string.slider_start_time * 120 + (bar_container.width() + 2) / 2);
				}
			});
		}
	
		function change_settings(setting_name, setting_value){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				data: {
					send_method: "change_user_settings",
					csrfmiddlewaretoken: csrf_token,
					send_settings_name: setting_name,
					send_settings_value: setting_value
				}
			});
		}

		function dbstorage(args){
			args.returnVal = "";

			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				async: false,
				dataType: 'json',
				data: {
					send_method: "dbstorage", 
					send_method_type: args.type,
					the_key: args.key,
					the_value: args.value,
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					if(args.type == "get"){
						args.returnVal = data; 
					}
				}
			});

			return args.returnVal;
		}

		return {
			Sending_data: sending_data,
			Change_settings: change_settings,
			Dbstorage: dbstorage,
			Get_settings: get_settings
		}
	})();

	var slider = (function(){
		// function for creating new time records
		function slider_record(args){
			var days_in_chosen_month = slider_general.Time_date.Days_in_custom_month(args.year, args.month);

			if(args.date - args.day + args.cus_day > days_in_chosen_month){
				if(args.month + 1 > 12){
					args.year += 1;
					args.month = 1;
				}else{
					args.month += 1;
				}

				args.date = args.date - args.day + args.cus_day - days_in_chosen_month;
				console.log(args.date)
			}else if(args.date - args.day + args.cus_day < 1){
				if(args.month - 1 < 1){
					args.year -= 1;
					args.month = 12;
				}else{
					args.month -= 1;
				}

				args.date = slider_general.Time_date.Days_in_custom_month(args.year, args.month) - (args.day - args.date + args.cus_day);
			}else{
				args.date = args.date - args.day + args.cus_day;
			}

			var record_cus_date = args.year + "-" + args.month + "-" + args.date;

			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				async: false,
				type: "POST",
				data: {
					send_method: "slider_record", 
					send_method_type: args.recordEventType,
					record_name_send: args.recordName, 
					record_description_send: args.recordDescription,
					record_start_time_send: args.recordStartTime,
					record_length_time_send: args.recordLength,
					cus_date: record_cus_date,
					the_id: args.datId,
					record_billable: args.billable,
					hourly_rate: args.hourly_rate,
					csrfmiddlewaretoken: csrf_token
				},
				beforeSend: general.Sending_data(),
				success: function(data){
					if(args.recordEventType == "click"){
					}else if(args.recordEventType == "late_create"){
						args.recordEvent.attr("id", "number_" + data);
					}else if(args.recordEventType == "create"){
						args.recordEvent != undefined ? args.recordEvent.attr("id", "number_" + data) : 0;
					}
					general.Sending_data();
				}
			});
		}

		function change_record_activity(args){
			if(args.new_name != args.old_name){
				activity_select_val = activity_select.find(":selected").val() == args.old_name.replace(/_/g, " ") ? args.new_name.replace(/_/g, " ") : "";

				$.ajax({
					url: "http://" + window.location.host + "/slider/post/",
					type: "POST",
					dataType: 'json',				
					data: {
						send_method: "change_activity_record_name", 
						old_activity_name: args.old_name,
						new_activity_name: args.new_name,
						csrfmiddlewaretoken: csrf_token
					},
					success: function(data){
						for(var j = 0; j < record_time_interval.length; j++){
							if(args.old_name == record_time_interval[j].activity.replace(/ /g, "_")){
								record_time_interval[j].activity = args.new_name;
								break;
							}
						}
					}
				});
			}
		}

		function update_time_record_time(time_start, time_length, record_id){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				data: {
					send_method: "update_time_record_length", 
					the_id: record_id,
					record_time_start: time_start,
					record_length: time_length,
					csrfmiddlewaretoken: csrf_token
				}
			});
		}

		function get_slider_records_by_date(args){
			var args = $.extend({}, args);
			var date_from_args = $.extend({}, args);
			var date_to_args = $.extend({}, args);

			if(date_from_args.customDate - date_from_args.customDay < 1){
				if(date_from_args.customMonth - 1 < 1){
					date_from_args.customYear -= 1;
					date_from_args.customMonth = 12;
				}else{
					date_from_args.customMonth -= 1;
				}

				date_from_args.customDate = slider_general.Time_date.Days_in_custom_month(date_from_args.customYear, date_from_args.customMonth) + args.customDate;
			}else if(date_to_args.customDate + 6 - date_to_args.customDay > slider_general.Time_date.Days_in_custom_month(date_to_args.customYear, date_to_args.customMonth)){
				if(date_to_args.customMonth + 1 > 12){
					date_to_args.customYear += 1;
					date_to_args.customMonth = 1;
				}else{
					date_to_args.customMonth += 1;
				}
				
				date_to_args.customDate = (slider_general.Time_date.Days_in_custom_month(args.customYear, args.customMonth) - args.customDate) * -1;
			}

			var slider_record_date_from = date_from_args.customYear + "-" + date_from_args.customMonth + "-" + (date_from_args.customDate - date_from_args.customDay);
			var slider_record_date_to = date_to_args.customYear + "-" + date_to_args.customMonth + "-" + (date_to_args.customDate + 6 - date_to_args.customDay);


			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				dataType: 'json',
				data: {
					send_method: "get_records_by_date", 
					record_date_from: slider_record_date_from,
					record_date_to: slider_record_date_to,
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					$(".bar .bar_inner").each(function(){
						!$(this).hasClass("record_activity") ? $(this).remove() : 0;
					});

					var date_record_id = 0;
					var date_record_activity_name = "";
					var date_record_activity_time_length = 0;
					var date_record_time_start = 0;
					var date_record_activity_color = "";
					var get_day_by_date = "";

					if(data.length > 0){
						for(var g = 0; g < data.length; g++){
							date_record_id = "number_" + data[g].record_id;
							get_day_by_date = days[new Date(data[g].record_cus_date).getDay()].toLowerCase() + "_container";
							date_record_activity_name = data[g].name;
							date_record_activity_time_length = data[g].time_length;
							date_record_time_start = (data[g].time_start * 2);

							for(var f = 0; f < json_string.activities.length; f++){
								if(date_record_activity_name.replace(/_/g, " ") == json_string.activities[f].name.replace(/_/g, " ")){
									date_record_activity_color = json_string.activities[f].color;
								}
							}

							$("." + get_day_by_date + " .bar").append("<div style='' class='bar_inner " + date_record_activity_name + "' id='" + date_record_id + "'><span class='time'></span><span class='bar_left'></span><span class='bar_right'></span></div>");
							$("." + get_day_by_date + " .bar .bar_inner." + date_record_activity_name + "#" + date_record_id + " .time").html(("0" + Math.floor((date_record_activity_time_length / 2) / 60)).slice(-2) + ":" + ("0" + Math.floor((date_record_activity_time_length / 2) % 60)).slice(-2));
							$("." + get_day_by_date + " .bar .bar_inner." + date_record_activity_name + "#" + date_record_id).css({
								"left": date_record_time_start,
								"width": date_record_activity_time_length,
								"background": slider_general.Helper.Hex2rgb(date_record_activity_color)
							});
						}
					}
				}
			});
		}

		function get_time_record_details(record_id){
			var time_record_description_data = "";
			
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				async: false,
				dataType: 'json',
				data: {
					send_method: "get_time_record_details", 
					time_record_id: record_id,
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					time_record_description_data = data;
				}
			});

			return time_record_description_data;
		}

		function delete_multiple_activity_timerecords(activities_array){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				data: {
					send_method: "delete_multi_activity_timerecords", 
					the_activities_array: activities_array,
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					get_slider_records_by_date({
						customYear: custom_year,
						customMonth: custom_month,
						customDate: custom_date,
						customDay: custom_day
					});
				}
			});
		}

		return {
			Delete_multiple_activity_timerecords: delete_multiple_activity_timerecords,
			Get_time_record_details: get_time_record_details,
			Slider_record: slider_record,
			Update_time_record_time: update_time_record_time,
			Get_slider_records_by_date: get_slider_records_by_date,
			Change_record_activity: change_record_activity
		}
	})();

	var activity = (function(){
		function delete_time_record(delete_time_send_type, record_name_id){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				data: {
					send_method: "delete_time_record", 
					send_method_type: delete_time_send_type, 
					record_delete: record_name_id,
					csrfmiddlewaretoken: csrf_token
				},
				success: function(){
					if(delete_time_send_type == "activity"){
						slider.Get_slider_records_by_date({
							customYear: custom_year,
							customMonth: custom_month,
							customDate: custom_date,
							customDay: custom_day
						});
					}
				}
			});
		}

		// gets the users activities and groups
		function get_activities(delete_time_records){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				dataType: 'json',
				data: {
					send_method: "activities_get", 
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					data != undefined ? json_string = data : 0;

					$(".wrapper .activities_main ul").html("");
					$(".wrapper .activities_main ul").append("<span class='root_activities' style='display: none;'>Drag here for no parent group</span><div></div>");
					

					activity_select_val = activity_select_val || (activity_select.find(":selected").length ? activity_select.find(":selected").val() : "");
					activity_select.html("");
					activity_dial_select.html("");

					for(var k = 0; k < json_string.activities.length; k++){
						activity_select.append("<option class='" + json_string.activities[k].name.replace(/\s/g, "_") + " " + json_string.activities[k].color + "'>" + json_string.activities[k].name + "</option>");
						activity_dial_select.append("<option class='" + json_string.activities[k].name.replace(/\s/g, "_") + " " + json_string.activities[k].color + "'>" + json_string.activities[k].name + "</option>");
					}
			
					activity_select.val() && activity_select_val ? activity_select.val(activity_select_val) : 0;
					activity_select_val = "";
					activity_select.find(":selected").attr("class") ? activity_demo_color.css("background", activity_select.find(":selected").attr("class").split(/ /g)[1]) : 0;

					function group_create(item){						
						$(".wrapper .activities_main ul.activity_stuff ." + item.parent.replace(/\s/g, "_")).append("\
							<ul class='" + item.name.replace(/\s/g, "_") + "'> \
								<span class='name'><span class='hide_show_stuff down'></span><span class='group_name'>" + item.name + "</span><span class='delete_group'></span></span> \
								<div></div> \
							</ul> \
						");
					}

					function group_create_assist(loop_item, parent_name){
						for(var i = 0; i < loop_item.length; i++){
							if(loop_item[i].parent == parent_name){
								group_create(loop_item[i]);
								group_create_assist(loop_item, loop_item[i].name);
							}
						}
					}


					for(var i = 0; i < json_string.groups.length; i++){
						if(json_string.groups[i].parent == undefined){
							$(".wrapper .activities_main ul.activity_stuff").append("\
								<ul class='" + json_string.groups[i].name.replace(/\s/g, "_") + "'> \
									<span class='name'><span class='hide_show_stuff down'></span><span class='group_name'>" + json_string.groups[i].name + "</span><span class='delete_group'></span><span class='edit_group'></span></span> \
									<div></div> \
								</ul> \
							");

							group_create_assist(json_string.groups, json_string.groups[i].name);
						}
					}

				
					for(i = 0; i < json_string.activities.length; i++){
						if(json_string.activities[i].parent != undefined){
							$(".wrapper .activities_main ul." + json_string.activities[i].parent.replace(/\s/g, "_") + " > div").prepend("\
								<li class='activity " + json_string.activities[i].name.replace(/ /g, "_") + "'> \
									<div class='box_color " + json_string.activities[i].color + "' style='background: " + json_string.activities[i].color + "; color: " + json_string.activities[i].color + ";'></div> \
									<span class='activity_name'>" + json_string.activities[i].name + "</span> \
									<ul class='activity_crumbs'> \
										<li class='play_activity'><span class='activity_cap'>Record Activity</span></li> \
										<li class='trash_activity'><span class='activity_cap'>Delete Activity</span></li> \
										<li class='last edit_activity'><span class='activity_cap'>Edit Activity</span></li> \
									</ul> \
								</li> \
							");

							if(json_string.activities[i].currency){
								$(".wrapper .activities_main ul." + json_string.activities[i].parent.replace(/\s/g, "_") + " > div li." + json_string.activities[i].name.replace(/ /g, "_")).append(" \
									<span class='activity_hourly_rate'>" +
										json_string.activities[i].currency + 
										parseFloat(json_string.activities[i].hourly_rate).toFixed(2) +
									"</span> \
								");
							}
						}else{
							$(".wrapper .activities_main ul.activity_stuff > div").append('\
								<li class="activity ' + json_string.activities[i].name.replace(/ /g, "_") + '"> \
									<div class="box_color ' + json_string.activities[i].color + '" style="background: ' + json_string.activities[i].color + ';"></div> \
									<span class="activity_name">' + json_string.activities[i].name + '</span> \
									<ul class="activity_crumbs"> \
										<li class="play_activity"><span class="activity_cap">Record Activity</span></li> \
										<li class="trash_activity"><span class="activity_cap">Delete Activity</span></li> \
										<li class="last edit_activity"><span class="activity_cap">Edit Activity</span></li> \
									</ul> \
								</li> \
							');

							if(json_string.activities[i].currency){
								$(".wrapper .activities_main ul.activity_stuff > div li." + json_string.activities[i].name.replace(/ /g, "_")).append(" \
									<span class='activity_hourly_rate'>" +
										json_string.activities[i].currency + 
										parseFloat(json_string.activities[i].hourly_rate).toFixed(2) +
									"</span> \
								");
							}					
						}
					}
					
					json_string.groups.length == 0 && json_string.activities.length == 0 ? $(".wrapper .activities_main ul div").html("<span class='no_project_group'>You currently have no activities or groups.</span>") : 0;
					json_string.activities.length != 0 ? slider_general.Slider.Allow_slider_access() : 0;
				
					if(record_time_interval.length){
						for(var i = 0; i < record_time_interval.length; i++){
							var activity = $(".activities_main ul > div > li.activity." + record_time_interval[i].activity.replace(/ /g, "_"));

							if(activity.length > 0){
								activity.find(".play_activity").addClass("recording");
							}else{
								activity_main.Record_activity({type: "stop", activity: record_time_interval[i].activity});
								if(i + 1 != record_time_interval.length){
									i--;
								}
							}
						}
					}

					if(get_activities_first){
						slider_general.Init();
						$(".main .secondary_container").css("visibility", "visible");
						$(".loading_defaults").remove();
						setInterval(slider_general.Slider.Update_current_time, 5000);
						slider_general.Slider.Update_current_time();
						general.Get_settings();

						var date_month_over = new Date(custom_year, custom_month, 0).getDate();
						var recording_activities = general.Dbstorage({
							type: "get",
							key: "record_activity"
						});

						if(recording_activities){
							for(var i = 0; i < recording_activities.length; i++){
								if(the_date.getDate() + "-" + the_date.getMonth() + "-" + the_date.getFullYear() == recording_activities[i].date){
									$("." + days[the_date.getDay()].toLowerCase() + "_container .bar").append("<div style='' class='bar_inner " + recording_activities[i].activity + " record_activity'><span class='bar_left'></span><span class='bar_right'></span><span class='time'></span></div>");

									var activity_background = "rgba(33, 33, 33, 0.7)";

									for(var j = 0; j < json_string.activities.length; j++){
										if(json_string.activities[j].name.replace(/ /g, "_") == recording_activities[i].activity){
											activity_background = slider_general.Helper.Hex2rgb(json_string.activities[j].color);
										}
									}

									$(".activities_main ul > div > li.activity." + recording_activities[i].activity + " .play_activity").addClass("recording");

									activity_main.Record_activity({
										type: "start",
										element: $("." + days[the_date.getDay()].toLowerCase() + "_container .bar .bar_inner.record_activity." + recording_activities[i].activity),
										activity: recording_activities[i].activity,
										background: activity_background,
										time_start: recording_activities[i].time_start,
										time_length: recording_activities[i].time_length,
										actual_time: recording_activities[i].actual_time
									});
								}else{
									var date = new Date(recording_activities[i].date.split("-")[2], recording_activities[i].date.split("-")[1], recording_activities[i].date.split("-")[0]);
									var record_billable = 0;
									var record_hourly_rate = "";

									for(var j = 0; j < json_string.activities.length; j++){
										json_string.activities[j].name == recording_activities[i].activity && json_string.activities[j].hourly_rate ? record_billable = 1 : 0;
									}

									slider.Slider_record({
										recordName: recording_activities[i].activity,
										recordDescription: "",
										recordStartTime: recording_activities[i].time_start / 2,
										recordLength: bar.width() - recording_activities[i].time_start,
										recordEventType: "create",
										year: date.getFullYear(),
										month: date.getMonth() + 1,
										date: date.getDate(),
										day: date.getDay(),
										cus_day: date.getDay(),
										billable: record_billable,
										hourly_rate: record_hourly_rate
									});
								}
							}
						}

						ajax.Slider.Get_slider_records_by_date({
							customYear: custom_year,
							customMonth: custom_month,
							customDate: custom_date,
							customDay: custom_day
						});

						get_activities_first = false;
					}
					
					slider_general.Activity.Change_active_activity();
				}
			});
		}

		function add_activity(dat_data, delete_time_records){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				data: {
					send_method: "activities_post", 
					data: dat_data,
					csrfmiddlewaretoken: csrf_token
				},
				beforeSend: general.Sending_data(),
				success: function(data){
					if(delete_time_records){
						delete_time_record("activity", delete_time_records);
					}

					get_activities();
					general.Sending_data();
				}
			});
		}

		return {
			Add_activity: add_activity,
			Delete_time_record: delete_time_record,
			Get_activities: get_activities
		}
	})();

	return {
		General: general,
		Activity: activity,
		Slider: slider
	}
})();