/* -- variables -- */

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
	
		var ban_slider = $(".ban_slider");
		var activity_select = $(".wrapper .main .tools_sub_nav .activity_select");
		var activity_dial_select = $(".activity_dial_select");
		var dial_title = $(".dial_container .dial_title");
		var dial_title_arrow = $(".dial_container .dial_title .arrow");
		var dial_container = $(".dial_container");
		var dial_container_from = $(".dial_container #from");
		var dial_container_to = $(".dial_container #to");
		var dial_description = $(".dial_content .dial_description");
		var settings_warning = $(".wrapper header .settings_container span.settings_warning");
		var root_activities = $(".activity_stuff .root_activities");
		var prime_slider_container = $(".prime_slider_container");
		var the_day = $(".date_day");
		var the_datepicker = $(".the_datepicker");
		var bar = $(".bar");
		var date_pick = $(".date_pick");
		var settings_container = $(".settings .settings_container");
		var dial_delete = $(".dial_delete");
		var settings_navitem = $(".settings .settings_navitem");
		var add_activity_color_span = $(".cus_alert .alert_inner .add_activity_color span");
		var add_activity_span_defaults = $(".cus_alert .alert_inner .add_activity_color span#default");
		var add_activity_name = $(".cus_alert .alert_inner.add_activity_ui li input.add_activity_name");
		var add_activity_color_div = $(".cus_alert .alert_inner .add_activity_color div");
		var color_pannel_add_activity = $(".cus_alert .alert_inner ul li .color_pannel_add_activity");
		var add_group_name = $(".cus_alert .alert_inner.add_group_ui li input.add_group_name");
		var hourly_rate_currency = $(".wrapper .cus_alert .alert_inner.add_activity_ui select.hourly_rate_currency");
		var add_activity_hourly_rate = $(".wrapper .cus_alert .alert_inner.add_activity_ui .add_activity_hourly_rate");
		var hour_pay = $(".dial_content #hour_pay");
		var billable = $(".dial_content #billable");
		var activity_billable = $(".add_activity_ui .activity_billable");
		var activity_hourly_rate = $(".add_activity_ui .activity_hourly_rate");
		var dial_billable_section = $(".dial_billable_section");
		var load_data = $(".load_data");
		var add_activity_groups = $(".wrapper .cus_alert .alert_inner.add_activity_ui select.add_activity_groups");
		var add_activity_name_error = $(".add_activity_name_error");
		var add_activity_hourly_rate_error = $(".add_activity_hourly_rate_error");
		var add_activity_ui = $(".wrapper .cus_alert .alert_inner.add_activity_ui");
		var add_group_ui = $(".wrapper .cus_alert .alert_inner.add_group_ui");
		var add_group_error = $(".add_group_error");
		var alert_inner = $(".wrapper .cus_alert .alert_inner");
		var cus_alert = $(".wrapper .cus_alert");
		var dial_stop = $(".dial_stop");
		var dial_save = $(".dial_save");
		var dial_cancel = $(".dial_cancel");
		var tools_activity_record = $(".tools_activity_record");
		var hour_rate_currency = $(".dial_content .hour_rate_currency");
		var add_group_select = $(".wrapper .cus_alert .alert_inner.add_group_ui select.add_group_groups");
		var activity_demo_color = $(".wrapper .main .tools_sub_nav .activity_demo_color");
		var color_select = $(".color_select");
		var activities_main = $(".activities_main");
		var edit_activity_ui = $(".wrapper .cus_alert .alert_inner.edit_activity_ui");
		var add_activity_create_right = $(".wrapper .cus_alert .alert_controlls .create_right");
		var dial_from_period = $("");
		var dial_to_period = $("");

	/* -- slider variables */
	
		var mouse_position_unupdated = 0;
		var updated_mouse_position = 0;
		var slider_container_offset = 0;
		var bar_event = 0;
		var mouse_down_bar_resizer = false;
		var time_record_event = 0;
		var yurk = 0;
		var bar_offset = 0;
		var appender_mouse_down = false;
		var bar_parent_width_update = 0;
		var left_time_value = $("." + bar_container_day + " .left_timepoint .lefttime_value");
		var right_time_value = $("." + bar_container_day + " .left_timepoint .righttime_value");
		var left_time_point = $("." + bar_container_day + " .left_timepoint");
		var right_time_point = $("." + bar_container_day + " .right_timepoint");
		var chosen_element_info = 0;
		var element_info_type = 0;
		var record_dont_care = false;
		var bar_day_number = 0;
		var bar_container_day = 0;
		var appender_click_mouse_position_old = 0;
		var date_teller_timeout = 0;
		var bar_container = $(".bar_container");
		var time_record_offset = 0;
		var zoom_percentage = 2;
		var convert_pixel_to_time = 60;
		var record_new_width = 0;
		var slider_snap = 10;
		var record_new_left_pos = 0;
		var left_timepont_new_pos = 0;
		var right_timepont_new_pos = 0;
		var right_time_value;
		var left_time_value;
		var new_record_left_pos;
		var new_record_width;
		var new_appender_record_element;
		var new_record_offset;
		var new_record_width;
		var time_record_left_right = "";
		var dial_currency = "";
		var dial_hourly_rate = 0;
		var left_time = 0;
		var right_time = 0;
		var dial_time_from = 0;
		var dial_time_to = 0;

	/* -- activity variables */

		var group_name_delete = "";
		var active_activity_select = "";
		var active_activity_select_name = "";
		var activity_name_delete = "";
		var get_activities_first = true;
		var record_data = 0;
		var json_string = {"groups":[],"activities":[]};
		var hide_group_drop_down = true;
		var pageY_old = 0;
		var old_activity_parent = 0;
		var settings_string = {};
		var activities_to_delete = [];
		var activities_delete_array = [];
		var is_activity_billable = true;
		var current_color_change = {};
		var activity_regex = /^[a-zA-Z0-9][a-zA-Z0-9 ]{0,50}[a-zA-Z0-9]$/;	
		var hourly_rate_regex = /^[0-9.]{0,10}$/;	
		var activity_create_type = "create";
		var activity_edit_name = "";
		var activity_select_val = "";

			var mouse_click_center_x = 0;
			var mouse_click_center_y = 0;
			var mouse_activity_move_first_time = true;
			var mouse_activity_group_move = false;
			var move_activities_this = 0;
			var move_groups_this = 0;
			var dstance_from_mouse_down = 0;

			var move_activities_groups = false;
			var move_activities_groups_event = {};
			var move_activities_groups_this = 0;
			var activities_groups_event_class = "";
			var activities_groups_event_data_level = "";
			var dragging_type = "";




	/* -- random variables */
	
		var get_page_x = 0;
		var bar_left_down = false;
		var main_height = 0;
		var bar_right_down = false;
		var leftIsDown = false;
		var end = 0;
		var pos_left_before = 0;
		var record_bar_target = 0;
		var prev_left_pos = 0;
		var record_width = 0;
		var what_you_say = 0;
		var cords_x_test = 0;
		var new_record_record_hours = 0;
		var new_record_record_mins = 0;
		var time_record_width = 0;
		var tigerdatfriend = 0;
		var isvalue = false;
		var record_width_and_offset = 0;
		var record_left_offset = 0;
		var owl = 0;
		var interval = 0;
		var bird = 0;
		var mouse_mover = true;
		var cur_time_hover = false;
		var who_knows = true;
		var bar_click_position = 0;
		var the_date = new Date();
		var dial_position = 0;
		var changed_day = 0;
		var change_slider_posiiton_key_down = false;
		var loop_times = 0;
		var mouse_down_target = 0;
		var looped = 0;
		var show_hide = true;
		var add_activity_object = 0;
		var add_group_object = 0;
		var pulse_settings_warning_height = 0
		var record_time_interval = [];
		var clicked = false;
		var delete_record_allow = false;