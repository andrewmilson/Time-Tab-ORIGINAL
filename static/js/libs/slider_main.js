var slider_main = (function(){
	// function for showing the information about a time record	
	function show_dial_info(event_type, chosen_element){
		get_page_x = chosen_element.pageX;
		record_dont_care = false;
		chosen_element_info = chosen_element;
		element_info_type = event_type;
		dial_delete.show();
		dial_stop.hide();
		dial_save.show();
		dial_cancel.show();
		dial_container.show();
		dial_billable_section.show()
		activity_dial_select.removeAttr("disabled");
		billable.removeAttr("checked");

		dial_description.val("");
		dial_container_to.val("").removeAttr("style");
		dial_container_from.val("").removeAttr("style");


		if(event_type == "click"){
			chosen_element = $(chosen_element.target).parent();
			chosen_element_info = chosen_element;
			dial_position = get_page_x - prime_slider_container.offset().left - 3;

			if(chosen_element_info.attr("id") != undefined){
				var time_record_id = chosen_element_info.attr("id").slice(7);
				var form_items = ajax.Slider.Get_time_record_details(time_record_id);
				dial_description.val(form_items.description);
			}else{
				dial_delete.hide();
				chosen_element.data("description") ? dial_description.val(chosen_element.data("description")) : 0;
			}
		}else if(event_type == "create"){
			dial_delete.hide();
			hour_pay.val(dial_hourly_rate);
			dial_description.focus();
			dial_stop.hide();

			if(time_record_left_right == "left"){
				dial_position = 
					chosen_element.offset().left - prime_slider_container.offset().left + 20;
			}else{
				dial_position = 
					chosen_element.offset().left + chosen_element.width() - 
					prime_slider_container.offset().left - 20;
			}
		}

		activity_dial_select.val(chosen_element.attr("class").split(/ /)[1].replace(/_/g, " "));
		var dial_color = activity_dial_select.find(":selected").attr("class").split(/ /)[1];
		var record_offset = chosen_element.offset().left - chosen_element.parent().offset().left;
		dial_currency = settings_string.default_currency;
		is_activity_billable = true;

		if(chosen_element.hasClass("record_activity")){
			dial_stop.show();
			dial_save.hide();
			dial_cancel.hide();
			activity_dial_select.attr("disabled", "disabled");
		
			for(var i = 0; i < json_string.activities.length; i++){
				if(activity_dial_select.find(":selected").val() == json_string.activities[i].name){
					hour_pay.val(json_string.activities[i].hourly_rate || "");
					json_string.activities[i].hourly_rate ? billable.attr("checked", "checked") : 0;
					break;
				}
			}
		}

		for(var i = 0; i < json_string.activities.length; i++){
			if(activity_dial_select.find(":selected").val() == json_string.activities[i].name){

				if(json_string.activities[i].currency != undefined){
					dial_currency = json_string.activities[i].currency;
					dial_hourly_rate = json_string.activities[i].hourly_rate;
				}else{
					is_activity_billable = false;
					dial_hourly_rate = 0;
					dial_billable_section.hide()
				}

				break;
			}
		}

		if(event_type == "click" && is_activity_billable && chosen_element_info.attr("id") != undefined){
			hour_pay.val(form_items.hourly_rate)
			form_items.billable != 0 ? billable.attr("checked", "checked") : billable.removeAttr("checked");
		}else if(event_type == "create" && is_activity_billable){
			hour_pay.val(dial_hourly_rate);
			billable.attr("checked", "checked");
		}

		record_dont_care = true;
		dial_title.css("background", dial_color);
		dial_title_arrow.css("border-bottom-color", dial_color);
		dial_container.css("top", (chosen_element.offset().top - $(".time_container .controls").offset().top) + 50);			

		if((dial_position - (dial_container.width() / 2)) > 555){
			dial_container.css("left", 555);
			dial_title_arrow.css("left", dial_position - 555);
		}else if((dial_position - (dial_container.width() / 2)) < 10){
			dial_container.css("left", 10);
			dial_title_arrow.css("left", dial_position - 10);
		}else{
			dial_container.css("left", dial_position - (dial_container.width() / 2));
			dial_title_arrow.css("left", dial_container.width() / 2);
		}

		hour_rate_currency.html(dial_currency);

		dial_time_from = slider_general.Helper.Time_conversion({
			time: Math.floor((record_offset / 2) / 60),
			type: settings_string.slider_time_format
		})

		dial_time_to = slider_general.Helper.Time_conversion({
			time: Math.floor(((record_offset + chosen_element.width()) / 2) / 60),
			type: settings_string.slider_time_format
		})
		
		dial_container_from.val(
			("0" + dial_time_from.Time).slice(-2) + ":" + 
			("0" + Math.floor((record_offset / 2) % 60)).slice(-2)
		);

		dial_container_to.val(
			("0" + dial_time_to.Time).slice(-2) + ":" + 
			("0" + Math.floor(((record_offset + chosen_element.width()) / 2) % 60)).slice(-2)
		);

		if(settings_string.slider_time_format == 12){
			dial_container_from.parent().find("select").remove();
			$("<select class='from_period'><option>AM</option><option>PM</option></select>").insertAfter(dial_container_from).val(Math.floor((record_offset / 2) / 60) >= 12 ? "PM" : "AM");
			$("<select class='to_period'><option>AM</option><option>PM</option></select>").insertAfter(dial_container_to).val(Math.floor(((record_offset + chosen_element.width()) / 2) / 60) >= 12 ? "PM" : "AM");

			dial_from_period = dial_container_from.next();
		}
	}

	function resize_time_record(type_of_resize){
		time_record_offset = $(record_bar_target).parent().offset().left - bar.offset().left;
		time_record_hours = $(record_bar_target).parent().width() / zoom_percentage / convert_pixel_to_time;
		time_record_mins = $(record_bar_target).parent().width() / zoom_percentage % convert_pixel_to_time;
		owl = (time_record_offset / zoom_percentage) / convert_pixel_to_time;
		bird = (time_record_offset / zoom_percentage) % convert_pixel_to_time;


		console.log(updated_mouse_position, record_left_offset, bar_click_position);

		if(type_of_resize == "right"){
			if(updated_mouse_position - bar_click_position > record_left_offset){
				record_new_left_pos = record_left_offset;
				record_new_width = 
					(updated_mouse_position - (updated_mouse_position % zoom_percentage)) - 
					(record_left_offset - (record_left_offset % zoom_percentage)) - 
					bar_click_position - bar_click_position % zoom_percentage;
			}else{
				record_new_left_pos = 
					(updated_mouse_position - (updated_mouse_position % zoom_percentage)) - 
					bar_click_position - bar_click_position % zoom_percentage;
				
				record_new_width = 
					(record_left_offset - (record_left_offset % zoom_percentage)) - 
					(updated_mouse_position - (updated_mouse_position % zoom_percentage)) + 
					bar_click_position + bar_click_position % zoom_percentage;
			}
		}else if(type_of_resize == "left"){
			if(record_width + (mouse_position_unupdated - updated_mouse_position) > 0){
				record_new_width = 
					record_width + (mouse_position_unupdated - updated_mouse_position) - 
					(((mouse_position_unupdated % zoom_percentage) - 
					(updated_mouse_position % zoom_percentage)) % zoom_percentage);

				record_new_left_pos = 
					(updated_mouse_position - (updated_mouse_position % zoom_percentage)) - 
					(cords_x_test - (Math.abs(cords_x_test) % zoom_percentage));
			}else{
				record_new_left_pos = record_width_and_offset;
				record_new_width = 
					((updated_mouse_position - record_width_and_offset) - cords_x_test) - 
					(((updated_mouse_position - record_width_and_offset) - Math.abs(cords_x_test)) % zoom_percentage);
			}
		}

		$(record_bar_target).parent().css({
			"left": record_new_left_pos, 
			"width": record_new_width
		});

		time_record_offset = $(record_bar_target).parent().offset().left - bar.offset().left;
		time_record_hours = ($(record_bar_target).parent().width() / zoom_percentage) / convert_pixel_to_time;
		time_record_mins = ($(record_bar_target).parent().width() / zoom_percentage) % convert_pixel_to_time;
		owl = (time_record_offset / zoom_percentage) / convert_pixel_to_time;
		bird = (time_record_offset / zoom_percentage) % convert_pixel_to_time;
		
		left_time = slider_general.Helper.Time_conversion({
			time: Math.floor(owl),
			type: settings_string.slider_time_format
		});

		right_time = slider_general.Helper.Time_conversion({
			time: Math.floor(((time_record_offset + $(record_bar_target).parent().width()) / zoom_percentage) / 60),
			type: settings_string.slider_time_format
		});

		left_time_value.html(
			("0" + left_time.Time).slice(-2) + ":" + 
			("0" + Math.floor(bird)).slice(-2) + " " + left_time.Period
		);

		right_time_value.html(
			("0" + right_time.Time).slice(-2) + ":" + 
			("0" + Math.floor(((time_record_offset + $(record_bar_target).parent().width()) / zoom_percentage) % 60)).slice(-2) + " " + right_time.Period
		);

		$(record_bar_target).parent().find(".time").html(
			("0" + Math.floor(time_record_hours)).slice(-2) + ":" + 
			("0" + Math.floor(time_record_mins)).slice(-2)
		);

		left_time_point.css({
			"left": time_record_offset - (left_time.Period ? 80 : 60),
			"width": left_time.Period ? 70 : 50
		});

		right_time_point.css({
			"left": time_record_offset + $(record_bar_target).parent().width() + 10,
			"width": left_time.Period ? 70 : 50
		});
	}

	function appender_mouse_down_new_record_drag(){
		new_record_record_hours = ((mouse_position_unupdated - (mouse_position_unupdated % slider_snap)) / 2) / 60;
		new_record_record_mins = ((mouse_position_unupdated - (mouse_position_unupdated % slider_snap)) / 2) % 60;

		if((updated_mouse_position - mouse_position_unupdated) < 0){
			time_record_left_right = "left";

			new_record_left_pos = 
				(updated_mouse_position - 
				(updated_mouse_position % slider_snap)) - slider_snap;
			
			new_record_width = 
				((mouse_position_unupdated - updated_mouse_position) - ((mouse_position_unupdated % slider_snap) - 
				(updated_mouse_position % slider_snap))) + slider_snap;
		}else{
			time_record_left_right = "right";
			
			new_record_left_pos = 
				(mouse_position_unupdated - 
				(mouse_position_unupdated % slider_snap));
			
			new_record_width = 
				((updated_mouse_position - mouse_position_unupdated) - 
				((updated_mouse_position - mouse_position_unupdated) % slider_snap)) + slider_snap;
		}
	
		new_appender_record_element.css({
			"left": new_record_left_pos, 
			"width": new_record_width, 
			"background": slider_general.Helper.Hex2rgb(active_activity_select.substring(0,7))
		});

		new_record_offset = new_appender_record_element.offset().left - bar.offset().left;
		new_record_width = new_appender_record_element.width();

		left_time = slider_general.Helper.Time_conversion({
			time: Math.floor(new_record_offset / zoom_percentage / convert_pixel_to_time),
			type: settings_string.slider_time_format
		});

		right_time = slider_general.Helper.Time_conversion({
			time: Math.floor((new_record_offset + new_record_width) / zoom_percentage / convert_pixel_to_time),
			type: settings_string.slider_time_format
		});

		left_time_value.html(
			("0" + left_time.Time).slice(-2) + ":" + 
			("0" + Math.floor(new_record_offset / zoom_percentage % convert_pixel_to_time)).slice(-2) + " " + left_time.Period
		);

		right_time_value.html(
			("0" + right_time.Time).slice(-2) + ":" + 
			("0" + Math.floor((new_record_offset + new_record_width) / zoom_percentage % convert_pixel_to_time)).slice(-2) + " " + right_time.Period
		);

		new_appender_record_element.children(".time").html(
			("0" + Math.floor(new_record_width / zoom_percentage / convert_pixel_to_time)).slice(-2) + ":" + 
			("0" + Math.floor(new_record_width / zoom_percentage % convert_pixel_to_time)).slice(-2)
		);

		left_time_point.css({
			"left": new_record_offset - convert_pixel_to_time - (left_time.Period ? 20 : 0),
			"width": left_time.Period ? 70 : 50
		});

		right_time_point.css({
			"left": new_record_offset + new_record_width + 10,
			"width": right_time.Period ? 70 : 50
		});
	}

	function keypress(from_element, to_element, type){
		var time_regex = /[0-9]{0,2}:[0-9]{0,2}/;
		var from_val = from_element.val().split(":");
		var to_val = to_element.val().split(":");
		
		var military_time_from = slider_general.Helper.Time_conversion({
			time: parseInt(from_val[0]),
			period: (settings_string.slider_time_format == 12 ? from_element.next().val() : undefined),
			type: 24
		});

		var military_time_to = slider_general.Helper.Time_conversion({
			time: parseInt(to_val[0]),
			period: (settings_string.slider_time_format == 12 ? dial_container_to.next().val() : undefined),
			type: 24
		});

		military_time_from.Time = military_time_from.Time % 12 == 0 && military_time_from.Period != "" ? military_time_from.Time - 12 : military_time_from.Time;
		military_time_to.Time = military_time_to.Time % 12 == 0 && military_time_to.Period != "" && to_val[1] != 0 ? military_time_to.Time - 12 : military_time_to.Time;

		if(
			time_regex.test(from_element.val()) && time_regex.test(to_element.val()) && 
			military_time_from.Time >= 0 && military_time_from.Time <= 24 && military_time_to.Time >= 0 && military_time_to.Time <= 24 &&
			from_val[1] < 60 && to_val[1] < 60 &&
			military_time_from.Time * 60 + parseInt(from_val[1]) < military_time_to.Time * 60 + parseInt(to_val[1])
		){		
			if(type == "return"){
				return true;
			}else{
				chosen_element_info.css({
					"left": ((military_time_from.Time * 2) * 60) + (from_val[1] * 2),
					"width": military_time_to.Time * 2 * 60 - military_time_from.Time * 2 * 60 + to_val[1] * 2 - from_val[1] * 2
				});

				chosen_element_info.find(".time").html(
					("0" + Math.floor(chosen_element_info.width() / 2 / 60)).slice(-2) + ":" + 
					("0" + Math.floor((chosen_element_info.width() / 2) % 60)).slice(-2)
				);
			}
		}else{
			return false;
		}
	}

	var events = (function(){
		function dial(){
			dial_container.on("change", ".from_period, .to_period", function(){ keypress(dial_container_from, dial_container_to) });
			dial_container_from.add(dial_container_to).keyup(function(){ keypress(dial_container_from, dial_container_to) });

			dial_container.mousedown(function(e){
				dial_container.css("display", "block");
				e.stopPropagation();
			});

			dial_stop.click(function(){
				activity_dial_select.removeAttr("disabled");

				activity_main.Record_activity({
					type: "stop",
					activity: chosen_element_info.attr("class").split(/ /)[1]
				});

				dial_stop.hide();
				dial_save.show();
				dial_cancel.show();
			});

			dial_save.click(function(){
				if(element_info_type == "click"){
					if(chosen_element_info.attr("id") == undefined){
						element_info_type = "late_create";
					}
				}

				var dial_description_val = dial_description.val();
				var start_time = Math.floor((chosen_element_info.offset().left - bar.offset().left) / 2);
				var dial_start_time = dial_container_from.val();
				var dial_end_time = dial_container_to.val();
				var dial_record_length = chosen_element_info.width();
				var dial_activity_name = chosen_element_info.attr("class").split(/ /)[1];
				var slider_day_colum_number = chosen_element_info.parent().parent().attr("class").split(/ /)[2];
				var time_regex = /[0-9]{0,2}:[0-9]{0,2}/;
				var hourly_rate_regex = /[^0-9\.]/;
				var billable_yes_no = billable.is(":checked") ? 1 : 0;
				var record_hourly_rate = billable_yes_no ? hour_pay.val() : 0;
				var time_valid = keypress(dial_container_from, dial_container_to, "return");

				for(var i = 0; i < json_string.activities.length; i++){
					if(activity_dial_select.find(":selected").val() == json_string.activities[i].name){
						if(json_string.activities[i].currency != undefined){
							record_hourly_rate = hour_pay.val();
						}
					}
				}

				if(!time_valid){
					dial_container_to.add(dial_container_from).css("border-color", "#900");
					return false;
				}

				var slider_record_id = null;
				dial_container.css("display", "none");
				element_info_type == "click" ? slider_record_id = chosen_element_info.attr("id").slice(7) : 0;

				ajax.Slider.Slider_record({
					recordName: dial_activity_name,
					recordDescription: dial_description_val,
					recordStartTime: start_time,
					recordLength: dial_record_length,
					recordEvent: chosen_element_info,
					recordEventType: element_info_type,
					datId: slider_record_id,
					year: custom_year,
					month: custom_month,
					date: custom_date,
					day: custom_day,
					cus_day: parseInt(slider_day_colum_number),
					billable: billable_yes_no,
					hourly_rate: record_hourly_rate
				});
			});
		}

		dial_delete.click(function(){
			ajax.Activity.Delete_time_record("single_record_delete", chosen_element_info.attr("id").slice(7));
			chosen_element_info.remove();
			dial_container.css("display", "none");
		});

		dial_cancel.click(function(){
			chosen_element_info.attr("id") == undefined ? chosen_element_info.remove() : 0;			
			dial_container.css("display", "none");
		});

		return {
			Dial: dial,
		}
	})();

	return {
		Show_dial_info: show_dial_info,
		Resize_time_record: resize_time_record,
		Appender_mouse_down_new_record_drag: appender_mouse_down_new_record_drag,
		Events: events
	}
})();