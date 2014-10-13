import json
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.context_processors import csrf
from slider.models import timerecords, activities
from time_tracker.models import settings, dbstorage

@login_required
def slider(request):
	csrf_token = csrf(request)["csrf_token"]
	user = request.user.email
	return render(request, 'app/slider.html', {
		"email": request.user.email, 
		"csrf_token": csrf_token
	})

@login_required
def post(request):
	if request.POST:
		post_data = request.POST
		send_method = post_data["send_method"]
		user = request.user.email

		if send_method == "get_user_settings":
			settings_obj = None

			try:
				settings_value = settings.objects.get(user = user)
				settings_obj = """{
					"date_format": "%s",
					"date_separator": "%s",
					"slider_time_format": %s,
					"report_time_format": %s,
					"slider_time_snap": %s,
					"slider_start_time": %s,
					"default_currency": "%s"
				}""" % (
					settings_value.date_format, 
					settings_value.date_separator, 
					settings_value.slider_time_format, 
					settings_value.report_time_format, 
					settings_value.slider_time_snap, 
					settings_value.slider_start_time,
					settings_value.default_currency
				)
			except settings.DoesNotExist:
				create_settings = settings.objects.create(
					user = user,
					date_format = "mm.dd.yy",
					date_separator = "/",
					slider_time_format = 24,
					report_time_format = 24,
					slider_time_snap = 5,
					slider_start_time = 100,
					default_currency = "D"
				)

				settings_obj = """{
					"date_format": "mm.dd.yy", 
					"date_separator": "/", 
					"slider_time_format": 24, 
					"report_time_format": 24, 
					"slider_time_snap": 5, 
					"slider_start_time": 100,
					"default_currency": "D"
				}"""

			return HttpResponse(settings_obj)

		if send_method == "dbstorage":
			db_storage_key = post_data["the_key"]
			send_method_type = post_data["send_method_type"]
			result = None

			if send_method_type == "save":
				db_storage_value = post_data["the_value"]
				if not dbstorage.objects.filter(user = user, key = db_storage_key):
					dbstorage.objects.create(user = user, key = db_storage_key, value = db_storage_value)
				else:
					dbstorage.objects.filter(user = user, key = db_storage_key).update(value = db_storage_value)
			elif send_method_type == "get":
				if dbstorage.objects.filter(user = user, key = db_storage_key):
					result = dbstorage.objects.values("value").get(user = user, key = db_storage_key)["value"]
					dbstorage.objects.filter(user = user, key = db_storage_key).delete()
				else:
					result = 0
			elif send_method_type == "delete":
				if dbstorage.objects.filter(user = user, key = db_storage_key):
					dbstorage.objects.filter(user = user, key = db_storage_key).delete()
				else:
					result = "aint got anything to delete"

			return HttpResponse(result)

		if send_method == "change_user_settings":
			settings_name = post_data["send_settings_name"]
			settings_value = ["date_format", "date_separator", "slider_time_format", "report_time_format", "slider_time_snap", "slider_start_time", "default_currency"]
			
			for i in settings_value:
				if settings_name == i:
					settings_value = post_data["send_settings_value"]
					change_settings = settings.objects.filter(user = user).update(**{settings_name: settings_value})

			return HttpResponse("soz_bro")
	
		if send_method == "get_activity_time":
			activity_names_object = json.loads(post_data["the_activity_names"])
			result = "["

			for i in activity_names_object:
				result_query = sum([x[1] - x[0] for x in timerecords.objects.values("time_length").get(user = user, activity_name = i)["time_length"]])
				result_query = result_query.replace("None", "0")
				result = result + "{\"name\": \"%s\", \"time\": %s}" % (i, result_query)

			result = result[:-1] + "]"
			return HttpResponse(result)

		if send_method == "activities_get":
			activities_obj = None

			try:
				activities_obj = activities.objects.values("value").get(user = user)["value"]
			except activities.DoesNotExist:
				activity_value = "{\"groups\":[],\"activities\":[]}"
				create_activities = activities.objects.create(user = user, value = activity_value)
				activities_obj = activity_value

			return HttpResponse(activities_obj)

		if send_method == "get_time_record_details":
			time_record_details = timerecords.objects.values("description", "billable", "hourly_rate").get(user = user, id = post_data["time_record_id"])
			
			time_record_details = """{
				"description": "%s",
				"billable": "%s",
				"hourly_rate": "%s"
			}""" % (time_record_details["description"], time_record_details["billable"], time_record_details["hourly_rate"])
	
			return HttpResponse(time_record_details)

		if send_method == "activities_post":
			activities_data = post_data["data"]
			activities_obj = activities.objects.filter(user = user).update(value = activities_data)
			return HttpResponse("edith")

		if send_method == "delete_time_record":
			send_method_type = post_data["send_method_type"]
			record_to_delete = post_data["record_delete"]

			if send_method_type == "activity":
				get_records = timerecords.objects.filter(user = user, activity_name = record_to_delete).delete()
			elif send_method_type == "single_record_delete":
				get_records = timerecords.objects.filter(user = user, id = record_to_delete).delete()
			
			return HttpResponse("")

		if send_method == "update_time_record_length":
			record_update = timerecords.objects.filter(user = user, id = post_data["the_id"]).update(time_start = post_data["record_time_start"], time_length = post_data["record_length"])
			return HttpResponse("")

		if send_method == "change_activity_record_name":
			record_change = timerecords.objects.filter(user = user, activity_name = post_data["old_activity_name"]).update(activity_name = post_data["new_activity_name"])
			return HttpResponse("")

		if send_method == "get_records_by_date":
			result = "["
			result_query = timerecords.objects.filter(cus_date__range = [post_data["record_date_from"], post_data["record_date_to"]], user = user)

			for z in result_query:
				result += """{
					"name": "%s", 
					"record_id": %s, 
					"time_length": %s,
					"time_start": %s,
					"record_cus_date": "%s",
					"billable": "%s"
				},""" % (z.activity_name, z.id, z.time_length, z.time_start, z.cus_date, z.billable)

			result = result[:-1] + "]"
			return HttpResponse(result)

		if send_method == "delete_multi_activity_timerecords":
			the_activities_array = post_data.getlist("the_activities_array[]")
			delete_records = timerecords.objects.filter(user = user, activity_name__in = the_activities_array).delete()
			return HttpResponse("ghghjjhgh")

		if send_method == "slider_record":
			send_method_type = post_data["send_method_type"]
			record_name = post_data["record_name_send"]
			record_description = post_data["record_description_send"]
			record_start = post_data["record_start_time_send"]
			record_length = post_data["record_length_time_send"]
			record_cus_date = post_data["cus_date"]
			billable = post_data["record_billable"]
			hourly_rate = post_data["hourly_rate"]

			if send_method_type == "click":
				record_id = post_data["the_id"]
				record_update = timerecords.objects.filter(user = user, id = record_id).update(
					activity_name = record_name, 
					description = record_description,
					time_start = record_start,
					time_length = record_length,
					billable = billable,
					hourly_rate = hourly_rate
				)
				return HttpResponse("race car")
			elif send_method_type == "create" or send_method_type == "late_create":
				record_insert = timerecords.objects.create(
					user = user,
					activity_name = record_name,
					description = record_description,
					cus_date = record_cus_date,
					time_start = record_start,
					time_length = record_length,
					billable = billable,
					hourly_rate = hourly_rate
				)
				record_insert_id = record_insert.id
				return HttpResponse(record_insert_id)