// Time Captule created by Andrew James Milson

require.config({
	baseUrl: "/static/js/libs",
	shim: {
		"slider_ajax": ["slider_general"],
		"slider_main": ["slider_variables"],
		"slider_variables": ["jquery-ui"], // ["http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"],
		"slider_general": ["jquery"], // ["http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"],
		"jquery-ui": ["jquery"] // "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js": ["https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"]
	}
});

require([
	"jquery", // "https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", 
	"jquery-ui", // "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js",
	"slider_variables",
	"slider_general",
	"slider_main",
	"activity_main",
	"slider_ajax"
], function($){
	slider_general.Slider.Events();
	slider_general.Settings.Events();
	slider_general.Activity.Events();
	slider_general.Time_date.Events();
	slider_main.Events.Dial();
	ajax.Activity.Get_activities();
});