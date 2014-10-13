// Time Captule created by Andrew James Milson

require.config({
	baseUrl: "/static/js/libs",
	shim: {
		"graph": {
			deps: ["kinetic.min"]
		},
		"invoice_ajax": {
			deps: ["http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"]
		}
	}
});


require([
	"jquery",
	"report_variables",
	"http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js",
	"invoice_general",
	"invoice_ajax"
], function($){
	/*
	ajax.Settings.Get_settings();
s	report_general.Report.Events();
	report_general.Time_date.Events();
	graph.Report.Events();
	*/

	ajax.Invoice.Get_activities();
	invoice_general.Settings.Events();
	invoice_general.Init();
});