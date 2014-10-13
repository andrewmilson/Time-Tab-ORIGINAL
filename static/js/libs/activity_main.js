var activity_main = (function(){
	function record_activity(args){
		the_datepicker.datepicker("setDate", the_date);
		args.move_to_current_time ? slider_general.Slider.Goto_current_time(true) : 0;

		slider_general.Time_date.Change_date({
			year: the_date.getFullYear(),
			month: the_date.getMonth() + 1,
			date: the_date.getDate()
		});

		if(args.type == "start"){
			var start_time = (args.time_start ? args.time_start : the_date.getHours() * 120 + the_date.getMinutes() * 2);
			var time_old = (args.actual_time ? args.actual_time : start_time);
			var time_now = 0;
			var record_activity_name = args.activity;
			var item_number = record_time_interval.length;

			record_time_interval.push({
				"activity": args.activity, 
				"date": the_date.getDate() + "-" + the_date.getMonth() + "-" + the_date.getFullYear(),
				"interval": 0,
				"time_length": args.time_length,
				"time_start": start_time,
				"actual_time": 0,
				"item_number": item_number
			});

			args.element.css({
				"left": start_time, 
				"width": args.time_length,
				"background-color": args.background
			});

			$(".activities_main ul > div > li.activity." + args.activity + " .play_activity").addClass("recording").find("span").html("Stop Recording");

			record_time_interval[item_number].interval = setInterval(function(){
				for(var i = 0; i < record_time_interval.length; i++){
					if(record_time_interval[i].activity == record_activity_name){
						item_number = i;
						record_time_interval[item_number].item_number = i;
						break;
					}
				}

				if((record_time_interval[item_number].time_start + record_time_interval[item_number].time_length) / 2 / 60 >= 24 || record_time_interval[item_number].date != the_date.getDate() + "-" + the_date.getMonth() + "-" + the_date.getFullYear()){
					record_activity({
						type: "stop",
						activity: record_time_interval[item_number].activity
					});

					return false;
				}

				var time_now = the_date.getHours() * 120 + the_date.getMinutes() * 2;
					
				for(var i = 0; i < json_string.activities.length; i++){
					if(json_string.activities[i].name.replace(/ /g, "_") == record_time_interval[item_number].activity){
						args.background = slider_general.Helper.Hex2rgb(json_string.activities[i].color);
						break;
					}
				}

				args.element.css({
					"width": args.element.width() + (time_now - time_old),
					"background-color": args.background
				});

				time_old = time_now;
				var element_hours = ("0" + Math.floor((args.element.width() / 2) / 60)).slice(-2);
				var element_minutes = ("0" + Math.floor(((args.element.width() / 2) % 60))).slice(-2);

				args.element.children(".time").html(
					element_hours + ":" + 
					element_minutes
				);

				record_time_interval[item_number].time_start = args.element.offset().left - bar.offset().left;
				record_time_interval[item_number].time_length = args.element.width();
				record_time_interval[item_number].actual_time = the_date.getHours() * 120 + the_date.getMinutes() * 2;
				record_activity_name = record_time_interval[item_number].activity;
			}, 1000);

			slider_general.Activity.Change_active_activity();
		}else if(args.type == "stop"){
			for(var i = 0; i < record_time_interval.length; i++){
				if(record_time_interval[i].activity == args.activity){
					clearInterval(record_time_interval[i].interval);
					$(".activities_main ul > div > li.activity." + args.activity + " .play_activity").addClass("recording").find("span").html("Stop Recording");

					if($(".activities_main ul > div > li.activity." + record_time_interval[i].activity).length){
						$(".activities_main ul > div > li.activity." + record_time_interval[i].activity + " .play_activity").removeClass("recording").find("span").html("Record Activity");

						if(record_time_interval[i].time_start + record_time_interval[i].time_length >= bar.width()){
							$(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").width(bar.width() - record_time_interval[i].time_start);
							$(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity .time").html(
								("0" + Math.floor($(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").width() / 2 / 60)).slice(-2) + ":" +
								("0" + ($(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").width() / 2) % 60).slice(-2)
							)
						}

						slider_general.Time_date.Change_date({
							year: parseInt(record_time_interval[i].date.split(/-/g)[2]),
							month: parseInt(record_time_interval[i].date.split(/-/g)[1]) + 1,
							date: parseInt(record_time_interval[i].date.split(/-/g)[0])
						});
					}else{
						$(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").remove();
					}

					if($(".activities_main ul > div > li.activity." + record_time_interval[i].activity).length){
						if(args.move_to_current_record){
							slider_general.Slider.Goto_current_time(
								true, 
								$(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").position().left + 
								$(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").width()
							);

							setTimeout(function(){ 
								var record_element_stop = $(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").removeClass("record_activity");
								dial_container.is(":hidden") ? slider_main.Show_dial_info("create", record_element_stop) : 0; 
								record_time_interval.splice(i, 1);
								slider_general.Activity.Change_active_activity();
							}, 500);
						}else{
							var record_element_stop = $(".bar_container .bar .bar_inner." + record_time_interval[i].activity + ".record_activity").removeClass("record_activity");
							dial_container.is(":hidden") ? slider_main.Show_dial_info("create", record_element_stop) : 0;
							record_time_interval.splice(i, 1);
							slider_general.Activity.Change_active_activity();
						}
					}
					
					break;
				}
			}
		}
	}

	return {
		Record_activity: record_activity
	}
})();