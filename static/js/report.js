// Time Captule created by Andrew James Milson

require.config({
	baseUrl: "/static/js/libs",
	shim: {
		"report_ajax": ["report_general"],
		"report_main": ["report_variables"],
		"report_variables": ["jquery-ui"], // ["http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"],
		"report_general": ["jquery"], // ["http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"],
		"jquery-ui": ["jquery"] // "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js": ["https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"]
	}
});


require([
	"jquery", // "https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", 
	"jquery-ui", // "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js",
	"report_variables",
	"graph",
	"report_general",
	"report_ajax"
], function($){
	ajax.Report.Get_activities();
	ajax.Settings.Get_settings();
	report_general.Settings.Events();
	report_general.Report.Events();
	report_general.Time_date.Events();
	graph.Report.Events();
	report_general.Init();
});