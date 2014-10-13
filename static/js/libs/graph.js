var graph = (function(){
	var report = (function(){
		function hide_if_checkbox(){
			if(hide_empty.is(":checked")){
				var items_count = [0, 0, 0];
					
				$(".activity_content").each(function(){
					if($(this).find("table tr td").length == 0){
						$(this).parent().addClass("record_empty");
					}
				});

				$(".group_list").each(function(index, group_list_value){
					items_count[0] = $(group_list_value).find(".activity_list table > tr").length;

					if(!$(group_list_value).not(".record_empty").length){
						$(activity_list_value).hasClass("record_empty") ? items_count[1] += 1 : 0;
					}

					items_count[0] == items_count[1] || items_count[0] == 0 ? $(group_list_value).addClass("record_empty") : 0;
				});
			}else{
				$(".activity_list").removeClass("record_empty");
				$(".group_list").removeClass("record_empty");
			}

			if(!$("#report_canvas_preview .activity_list").not(".record_empty").length){
				$("#report_canvas_preview").append("<span class='no_time_records'><span class='triangle'>There are no Timerecords in the chosen activities and groups</span>");
			}else{
				$("#report_canvas_preview .no_time_records").remove();
			}
		}

		function round_minutes(args){
			var m = args.minutes;
			var h = args.hours;

			if(args.round_type == "down"){
				m = Math.floor(args.minutes / args.round_amount) * args.round_amount;
			}else if(args.round_type == "up"){
				m = Math.ceil(args.minutes / args.round_amount) * args.round_amount;
			}else if(args.round_type == "nearest"){
				m = Math.round(args.minutes / args.round_amount) * args.round_amount;
			}else if(args.round_type == "none"){
				m = args.minutes;
			}

			time_differ = args.minutes - m;

			if(m == 60){
				h += 1;
				m = 0;
			}

			return {
				Minutes: m,
				Hours: h,
				Time_differ: time_differ
			}
		}

		function fullreport(args){
			report_meta = [];

			$("#report_canvas_preview ul.root_activities > li.meta div").each(function(){
				report_meta.push($(this).find(".line").val())
			});

			$("#report_canvas_preview").html("");
			var element_parent_name = "";

			$("#report_canvas_preview").append(" \
				<ul class='root_activities'> \
					<li class='meta'><a href='#' class='add_field'>Add New Field</a></li> \
					<li class='group_content'></li> \
				</ul> \
			");

			for(var i = 0; i < (report_meta.length ? report_meta.length : 1); i++){
				$("<div><input type='text' value='" + (report_meta.length ? report_meta[i] : "") + "' class='line'/><a href='#' class='delete_field'><span>Delete Field</span></a></div>").insertBefore("#report_canvas_preview ul.root_activities li.meta a.add_field");
			}

			function group_create(item){						
				$("#report_canvas_preview ." + item.parent.replace(/ /g, "_")).append(" \
					<ul class='group_list " + item.name.replace(/ /g, "_") + "'> \
						<li class='group_name'>" + item.name + "</li> \
						<li class='group_content'></li> \
					</ul> \
				");

				console.log(item.name);
			}

			function group_create_assist(loop_item, parent_name){
				for(var i = 0; i < loop_item.length; i++){
					if(loop_item[i].parent == parent_name.replace(/_/g, " ")){
						group_create(loop_item[i]);
						group_create_assist(loop_item, loop_item[i].name);
					}
				}
			}

			for(var i = 0; i < args.data.groups.length; i++){
				if(args.data.groups[i].parent == undefined){
					$("#report_canvas_preview").append(" \
						<ul class='group_list " + args.data.groups[i].name.replace(/ /g, "_") + "'> \
							<li class='group_name'>" + args.data.groups[i].name.replace(/_/g, " ") + "</li> \
							<li class='group_content'></li> \
						</ul> \
					");

					group_create_assist(args.data.groups, args.data.groups[i].name);
				}
			}

			for(var i = 0; i < args.data.activities.length; i++){
				element_parent_name = args.data.activities[i].parent;
				!element_parent_name ? element_parent_name = "root_activities" : 0;

				$("#report_canvas_preview ul." + element_parent_name.replace(/ /g, "_") + " > li.group_content").prepend(" \
					<ul class='activity_list " + args.data.activities[i].name.replace(/\s/g, "_") + "'> \
						<li class='activity_name'> \
							<span class='activity_name_sect'>" + args.data.activities[i].name.replace(/_/g, " ") + "</span> \
							<strong class='activity_total'> \
							<span class='activity_total_time'><span class='activity_total_time_amount'>0</span>h</span></strong> \
						</li> \
						<li class='activity_content'><table></table></li> \
					</ul> \
				");

				if(args.data.activities[i].currency){
					$("#report_canvas_preview ul." + element_parent_name.replace(/ /g, "_") + " > li.group_content > .activity_list." + args.data.activities[i].name.replace(/ /g, "_") + " .activity_total").prepend(" \
						<span class='activity_total_income'> \
							<span class='activity_total_income_amount'></span> \
						</span> \
					");
				}
			}

			var time_record_from = 0;
			var time_record_to = 0;
			var time_record_day = "";
			var time_record_name = "";
			var time_record_date = "";
			var activity_total_hours = {};
			var activity_total_income = {};
			var item_name;
			var time_record_income = 0;
			var time_record_currency = "";
			var time_record_billable = 0;
			var time_minutes_obj = {};
			var time_from_obj = {};
			var time_to_obj = {};
			var time_from_conversion = {};
			var time_to_conversion = {};
			var time_decimal = 0.0;

			for(var i = 0; i < args.time_records.timerecords.length; i++){
				time_minutes_obj = round_minutes({
					minutes: Math.floor((args.time_records.timerecords[i].time_length / 2) % 60),
					hours: Math.floor(args.time_records.timerecords[i].time_length / 2 / 60),
					round_amount: rounding_amount,
					round_type: rounding_type
				});

				time_from_obj = round_minutes({
					minutes: Math.floor(args.time_records.timerecords[i].start % 60) + time_minutes_obj.Time_differ,
					hours: Math.floor(args.time_records.timerecords[i].start / 60),
					round_amount: rounding_amount,
					round_type: rounding_type
				});

				time_to_obj = round_minutes({
					minutes: Math.floor((args.time_records.timerecords[i].start + args.time_records.timerecords[i].time_length / 2) % 60),
					hours: Math.floor((args.time_records.timerecords[i].start + args.time_records.timerecords[i].time_length / 2) / 60),
					round_amount: rounding_amount,
					round_type: rounding_type
				});

				time_from_conversion = report_general.Helper.Time_conversion({
					time: time_from_obj.Hours,
					type: settings_string.report_time_format
				});

				time_to_conversion = report_general.Helper.Time_conversion({
					time: time_to_obj.Hours,
					type: settings_string.report_time_format
				});

				time_decimal = time_minutes_obj.Hours + ((100 / 60 * time_minutes_obj.Minutes) / 100);
				time_record_from = ("0" + time_from_conversion.Time).slice(-2) + ":" + ("0" + time_from_obj.Minutes).slice(-2);
				time_record_to = ("0" + time_from_conversion.Time).slice(-2) + ":" + ("0" +  time_to_obj.Minutes).slice(-2);
				time_record_length = ("0" + time_minutes_obj.Hours).slice(-2) + ":" + ("0" + time_minutes_obj.Minutes).slice(-2)
				time_record_day = days[new Date(args.time_records.timerecords[i].date.split("-")[0], args.time_records.timerecords[i].date.split("-")[1] - 1, args.time_records.timerecords[i].date.split("-")[2]).getDay()];
				time_record_name = args.time_records.timerecords[i].activity_name;
				time_record_income = Math.round(args.time_records.timerecords[i].hourly_rate * time_decimal * 100) / 100;
				time_record_currency = args.time_records.timerecords[i].currency;
				time_record_billable = args.time_records.timerecords[i].billable;
				time_record_date = report_general.Time_date.Date_format(args.time_records.timerecords[i].date, "yyyy.mm.dd", settings_string.date_format, settings_string.date_separator);

				for(var j = 0; j < args.data.activities.length; j++){
					if(args.data.activities[j].name.replace(/ /g, "_") == time_record_name){
						time_record_currency = args.data.activities[j].currency;
						break;
					}
				}
				
				$("#report_canvas_preview ." + time_record_name + " .activity_content table").append(" \
					<tr class='time_record " + time_record_name + "'> \
						<td class='bold_record record_date'>" + time_record_date + " <strong>" + time_record_day + "</strong></td> \
						<td class='bold_record record_time'>" + time_record_from + (time_from_conversion.Period ? " " + time_from_conversion.Period : "") + " - " + time_record_to + (time_to_conversion.Period ? " " + time_to_conversion.Period : "") + " <strong>" + time_record_length + "h</strong></td> \
						<td class='record_description'>" + args.time_records.timerecords[i].description + "</td> \
					</tr> \
				");

				console.log(time_from_conversion.Period)

				if(time_record_currency != undefined && time_record_billable == 1){
					$("#report_canvas_preview ." + time_record_name + ":last td.record_time").after("<td class='bold_record record_income'><strong>" + time_record_currency + parseFloat(time_record_income).toFixed(2) + "</strong></td>");
				}else if(time_record_currency != undefined && time_record_billable == 0){
					$("#report_canvas_preview ." + time_record_name + ":last td.record_time").after("<td class='bold_record record_income'></td>");
				}

				activity_total_hours[time_record_name] == undefined ? activity_total_hours[time_record_name] = 0 : 0;
				activity_total_hours[time_record_name] += time_minutes_obj.Hours * 60 + time_minutes_obj.Minutes;
				
				activity_total_income[time_record_name] == undefined && time_record_currency ? activity_total_income[time_record_name] = 0 : 0;
							
				if(time_record_currency && time_record_billable == 1){
					activity_total_income[time_record_name] += time_record_income;
				}
			}
	
			$(".activity_list").each(function(){
				item_name = $(this).attr("class").split(/ /g)[1];
				var round_minitues_obj = {};

				if($(this).find("table td").length != 0){
					$(this).find(".activity_total_time .activity_total_time_amount").html(
						("0" + Math.floor(activity_total_hours[item_name] / 60)).slice(-2) + ":" + 
						("0" + activity_total_hours[item_name] % 60).slice(-2)
					);
					
					for(var i = 0; i < args.data.activities.length; i++){
						if(item_name == args.data.activities[i].name.replace(/ /g, "_") && args.data.activities[i].currency){
							$(this).find(".activity_total_income .activity_total_income_amount").html(args.data.activities[i].currency + parseFloat(activity_total_income[item_name]).toFixed(2));
						}
					}
				}
			});

			hide_if_checkbox();
		}

		function events(){
			hide_empty.click(function(){
				hide_if_checkbox();
			});

			rounding_type_elm.change(function(){
				rounding_type = $(this).find(":selected").attr("id");

				if(rounding_type == "none"){
					rounding_amount_elm.attr("disabled", "disabled");
					mins_text.css("color", "#aaa");
				}else{
					rounding_amount_elm.removeAttr("disabled");
					mins_text.removeAttr("style");
				}

				fullreport(full_report_data);
			});

			rounding_amount_elm.change(function(){
				rounding_amount = $(this).val();
				fullreport(full_report_data);
			});

			report_canvas_preview.on("click", ".delete_field", function(){
				$(this).parent().remove();
			});

			report_canvas_preview.on("click", ".add_field", function(){
				$("<div><input type='text' class='line'/><a href='#' class='delete_field'><span>Delete Field</span></a></div>").insertBefore(this);
				report_canvas_preview.find(".root_activities > .meta div:last").find("input").focus();
				return false;
			});
		}

		return {
			FullReport: fullreport,
			Events: events
		}
	})();

	return {
		Report: report
	}
})();