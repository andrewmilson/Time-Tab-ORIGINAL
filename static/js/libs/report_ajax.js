var ajax = (function(){
	
	var general = (function(){
		function sending_data(){
			if(load_data.is(":hidden")){//sending_data_toggle){
				load_data.show().stop().animate({"right": 0}, 100, 'linear');
			}else{
				load_data.stop().animate({"right": (load_data.width() * -1) - 9}, 100, 'linear', function(){
					$(this).hide();
				});
			}
		}

		return {
			Sending_data: sending_data
		}
	})();

	var report = (function(){
		function get_activities(){
			$.ajax({
				url: "http://" + window.location.host + "/report/post/",
				type: "POST",
				dataType: 'json',
				data: {
					send_method: "activities_get",
					csrfmiddlewaretoken: csrf_token
				},
				success: function(data){
					json_string = data;
					activity_select.append("<option class='disabled_groups' disabled>Groups</option><option>everything</option>");
					
					for(var i = 0; i < json_string.groups.length; i++){
						activity_select.append("<option class='group'>" + json_string.groups[i].name + "</option>");
					}

					activity_select.append("<option disabled></option><option class='disabled_activities' disabled>Activities</option><option>everything</option>");
					
					for(var i = 0; i < json_string.activities.length; i++){
						activity_select.append("<option class='activity'>" + json_string.activities[i].name + "</option>");
					}
				}
			});
		}

		function get_report_info(args){
			if(args.chosenActivities[0] == undefined){
				args.chosenActivities = [];

				for(var i = 0; i < json_string.activities.length; i++){
					args.chosenActivities.push(json_string.activities[i].name.replace(/ /g, "_"));
				}
			}

			$.ajax({
				url: "http://" + window.location.host + "/report/post/",
				type: "POST",
				dataType: 'json',
				data: {
					send_method: "get_report_info",
					records_from: args.recordFrom,
					records_to: args.recordTo,
					activities: args.chosenActivities,
					csrfmiddlewaretoken: csrf_token,
				},
				beforeSend: general.Sending_data(),
				success: function(report_data){
					general.Sending_data();

					var full_report_obj = {"activities": [], "groups": []};
					var edited_activity = {};

					the_datepicker.hide();
					report_general.Time_date.Toggle_date_button({element: the_datepicker});

					function grab_activities(item_name){
						if(item_name == "everything"){
							full_report_obj = json_string;
						}else{
							for(var j = 0; j < json_string.activities.length; j++){
								if(json_string.activities[j].parent == item_name.replace(/_/g, " ")){
									full_report_obj.activities.push(json_string.activities[j]);
								}
							}

							for(var i = 0; i < json_string.groups.length; i++){
								if(json_string.groups[i].parent == item_name.replace(/_/g, " ")){
									full_report_obj.groups.push(json_string.groups[i]);
									grab_activities(json_string.groups[i].name);
								}
							}
						}
					}

					if(args.reportType == "group"){
						full_report_obj.groups.push({"name": args.groupName});
						grab_activities(args.groupName);
					}else if(args.reportType == "activity"){
						for(var j = 0; j < json_string.activities.length; j++){
							if(json_string.activities[j].name.replace(/ /g, "_") == args.chosenActivities[0]){
								edited_activity = jQuery.extend({}, json_string.activities[j]);
								delete edited_activity.parent;
								full_report_obj.activities.push(edited_activity);								
							}
						}
					}

					
					full_report_data = {
						data: full_report_obj,
						canvas: report_canvas_preview,
						time_records: report_data
					};

					graph.Report.FullReport(full_report_data);

					please_generate_report.hide();
					$(".report_sect").show();
				}
			});
		}

		return {
			Get_report_info: get_report_info,
			Get_activities: get_activities,

		}
	})();

	var settings = (function(){
		function get_settings(){
			$.ajax({
				url: "http://" + window.location.host + "/slider/post/",
				type: "POST",
				dataType: 'json',				
				data: {send_method: "get_user_settings", csrfmiddlewaretoken: csrf_token},
				success: function(data){
					settings_string = data;
					slider_snap = settings_string.slider_time_snap * 2;

					// general settings
					$(".wrapper header .tools_nav li.settings select.date_format").val(settings_string.date_format);
					$(".wrapper header .tools_nav li.settings select.date_separator").val(settings_string.date_separator);
					$(".wrapper header .tools_nav li.settings select.slider_time_format").val(settings_string.slider_time_format);
					$(".wrapper header .tools_nav li.settings select.report_time_format").val(settings_string.report_time_format);

					// slider settings
					$(".wrapper header .tools_nav li.settings select.slider_time_snap").val(settings_string.slider_time_snap);
					$(".wrapper header .tools_nav li.settings select.slider_start_time").val(settings_string.slider_start_time);
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

		return {
			Get_settings: get_settings,
			Change_settings: change_settings
		}
	})();

	return {
		Report: report,
		Settings: settings
	}
})();