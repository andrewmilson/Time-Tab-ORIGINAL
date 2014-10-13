	/* -- time and date variables */

		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];	
		var the_date = new Date();
		var seconds = the_date.getSeconds();
		var minutes = the_date.getMinutes();
		var hours = the_date.getHours();
		var date_number = the_date.getDate();
		var day_number = the_date.getDay();
		var day_name = days[day_number];
		var month_number = the_date.getMonth();
		var month_name = months[month_number];
		var year = the_date.getFullYear();	
		var custom_day = day_number;
		var custom_date = date_number;
		var custom_year = year;
		var custom_month = month_number + 1;
		var old_date = "";


	/* -- element variables */

		var resize_report_view = $(".prime_report_container .report_preview_container .resize_report_view");
		var the_datepicker = $(".the_datepicker");
		var datepicker_from = $(".the_datepicker.from");
		var datepicker_to = $(".the_datepicker.to");
		var date_pick = $(".date_container .date_pick");
		var date_pick_from = $(".date_container.from .date_pick");
		var date_pick_to = $(".date_container.to .date_pick");
		var activity_select = $(".secondary_container .tools_sub_nav select.activity_select");
		var generate_report = $(".wrapper .secondary_container .tools_sub_nav .generate_report");
		var current_day_text = $(".secondary_container .tools_sub_nav .date_container .current_day_text");
		var the_day_from = $(".secondary_container .tools_sub_nav .date_container.from .date_day");
		var the_day_to = $(".secondary_container .tools_sub_nav .date_container.to .date_day");
		var the_day = $(".secondary_container .tools_sub_nav .date_container .date_day");
		var please_generate_report = $(".please_generate_report");
		var report_canvas_preview = $("#report_canvas_preview");
		var hide_empty = $(".hide_empty");
		var download_report_ui = $(".wrapper .cus_alert .alert_inner.download_report_ui");
		var settings_container = $(".settings .settings_container");
		var settings_navitem = $(".settings .settings_navitem");
		var settings_warning = $(".wrapper header .settings_container span.settings_warning");
		var rounding_type_elm = $(".report_preview_container .rounding_type");
		var rounding_amount_elm = $(".report_preview_container .rounding_amount");
		var report_canvas_invisible = $("#report_canvas_invisible");
		var report_settings = $(".report_settings_cont");
		var report_settings_content = $(".report_settings_cont .report_settings");
		var load_data = $(".load_data");
		var mins_text = $(".mins_text");
		var report_canvas_preview = $("#report_canvas_preview");


	/* -- report variables */

		var report_resize_unupdated_y = 0;
		var report_resize_offset_top = 0;
		var resize_report = false;
		var is_loading_up = true;
		var chosen_activities_array = [];
		var settings_string = {};
		var rounding_type = "nearest";
		var rounding_amount = 15;
		var full_report_data = {};
		var report_type = "";
		var line_1 = "";
		var line_2 = "";
		var line_3 = "";
		var report_meta = [];