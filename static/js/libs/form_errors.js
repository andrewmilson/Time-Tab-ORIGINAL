$(document).ready(function(){
	$(".errorlist").each(function(index, value){
		$(this).next().find("input").addClass("error");
	});
});