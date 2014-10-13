var ajax = (function(){

	var settings = (function(){
		function get_settings(){
			$.ajax({
				url: "http://localhost:8000/slider/post/",
				type: "POST",
				dataType: 'json',				
				data: {send_method: "get_user_settings", csrfmiddlewaretoken: csrf_token},
				success: function(data){
					settings_string = data;
					slider_snap = settings_string.slider_time_snap * 2;

					// general settings
					$(".wrapper header .tools_nav li.settings select.date_format").val(settings_string.date_format);
					$(".wrapper header .tools_nav li.settings select.date_separator").val(settings_string.date_separator);
					$(".wrapper header .tools_nav li.settings select.time_format").val(settings_string.time_format);

					// slider settings
					$(".wrapper header .tools_nav li.settings select.slider_time_snap").val(settings_string.slider_time_snap);
					$(".wrapper header .tools_nav li.settings select.slider_start_time").val(settings_string.slider_start_time);
				}
			});
		}

		function change_settings(setting_name, setting_value){
			$.ajax({
				url: "http://localhost:8000/slider/post/",
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

	var invoice = (function(){
		function get_activities(){
			$.ajax({
				url: "http://localhost:8000/report/post/",
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

		return {
			Get_activities: get_activities
		}
	})();

	return {
		Settings: settings,
		Invoice: invoice
	}
})();