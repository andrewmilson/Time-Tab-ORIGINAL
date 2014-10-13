import csv
import math
import re

from django.shortcuts import render
from django.template.loader import render_to_string
from weasyprint import HTML, CSS
from django.http import HttpResponse
from cStringIO import StringIO
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.context_processors import csrf
from slider.models import timerecords, activities

def rounding_minutes(minutes, hours, round_type, round_amount):
	m = minutes * 1.0
	h = hours * 1.0

	if round_type == "down":
		m = math.floor(minutes / round_amount) * round_amount
	elif round_type == "up":
		m = math.ceil(minutes / round_amount) * round_amount
	elif round_type == "nearest":
		m = round(minutes / round_amount) * round_amount
	elif round_type == "none":
		m = minutes

	time_differ = minutes - m;

	if m == 60:
		h += 1
		m = 0

	return {
		"Minutes": int(m),
		"Hours": int(h),
		"Time_differ": int(time_differ)
	}

def time_conversion(time, type, period = ""):
	if type == 24:
		time += 12 if period == "PM" else 0
	elif type == 12:
		period = ["AM", "PM", "PM"][int(math.floor(time / 12))]
		time = (time + 11) % 12 + 1

	return {
		"Time": time,
		"Period": period
	}


def date_format(date, old_format, new_format, new_separator):
	i = 0
	seperator = re.sub("[0-9]", "", date)[0:1]
	new_date = ""
	new_format = new_format.split(seperator)
	old_format = old_format.split(seperator)
	date = date.split(seperator)

	old_date_dict = {
		old_format[0]: ("0" + date[0])[-2:],
		old_format[1]: ("0" + date[1])[-2:],
		old_format[2]: ("0" + date[2])[-2:]
	}

	if "yy" in old_date_dict:
		old_date_dict["yyyy"] = "20" + old_date_dict["yy"][-2:]
	elif "yyyy" in old_date_dict:
		old_date_dict["yyyy"] = "20" + old_date_dict["yyyy"][-2:]
		old_date_dict["yy"] = old_date_dict["yyyy"][-2:]

	while i < 3:
		new_date = new_date + old_date_dict[new_format[i]] + str(new_separator)
		i = i + 1


	return new_date[:-1]


@login_required
def report(request):
	return render(request, 'app/report.html', {
		"email": request.user.email, 
		"csrf_token": csrf(request)["csrf_token"]
	})

@login_required
def post(request):
	user = request.user.email

	if request.POST:
		send_method = request.POST.get("send_method")

		if send_method == "activities_get":
			activities_obj = activities.objects.values("value").get(user = user)["value"]
			return HttpResponse(activities_obj)

		if send_method == "get_report_info":
			result = """{"timerecords": ["""
			record_date_from = request.POST.get("records_from")
			record_date_to = request.POST.get("records_to")
			the_activities_array = request.POST.getlist("activities[]")
			result_query = timerecords.objects.filter(user = user, activity_name__in = the_activities_array, cus_date__range = [record_date_from, record_date_to])

			for i in result_query:
				result += """{
					"activity_name": "%s",
					"time_length": %i,
					"start": %i,
					"date": "%s",
					"description": "%s",
					"billable": "%s",
					"hourly_rate": "%s"
				},""" % (i.activity_name, i.time_length, i.time_start, i.cus_date, i.description, i.billable, i.hourly_rate)

			if result == """{"timerecords": [""":
				result = result + "]}"
			else:
				result = result[:-1] + "]}"

			return HttpResponse(result)

	if request.GET:
		send_method = request.GET.get("send_method")

		if send_method == "download_report":
			download_type = request.GET.get("type")
			the_activities_array = request.GET.getlist("activities[]")
			report_meta = filter(None, request.GET.getlist("meta[]"))
			download_date_from = request.GET.get("date_from")
			download_date_to = request.GET.get("date_to")
			download_date_format = request.GET.get("date_format")
			download_time_format = request.GET.get("time_format")
			download_date_seperator = request.GET.get("date_separator")
			rounding_amount = int(request.GET.get("rounding_amount"))
			rounding_type = str(request.GET.get("round_type"))

			report_date_from = date_format(
				date = download_date_from,
				old_format = "yyyy-mm-dd",
				new_format = download_date_format,
				new_separator = "."
			)

			report_date_to = date_format(
				date = download_date_to,
				old_format = "yyyy-mm-dd",
				new_format = download_date_format,
				new_separator = "."
			)

			if download_type == "pdf":
				response = HttpResponse(content_type="text/csv")
				response['Content-Disposition'] = 'attachment; filename="report ' + report_date_from + ' - ' + report_date_to + '.pdf"'

				report_content = request.GET.get("content")
				main_content = request.GET.get("content")
				pdf_report = StringIO()

				css_report = CSS(string = render_to_string("css/report_pdf.css", {
					"report_date": report_date_from + " - " + report_date_to,
					"time_format": download_time_format,
					"app_url": "http://mytimetab.com"
				}))				

				html_report = render_to_string("app/report_pdf.html", {
					"report_content": report_content,
					"meta": report_meta
				})

				HTML(string = html_report).write_pdf(pdf_report, stylesheets = [css_report])

				response.write(pdf_report.getvalue())
				pdf_report.close()

				return response
			elif download_type == "csv":
				time_records = timerecords.objects.filter(user = user, cus_date__range = [download_date_from, download_date_to], activity_name__in = the_activities_array)
				response = HttpResponse(content_type="text/csv")
				response['Content-Disposition'] = 'attachment; filename="report ' + report_date_from + ' - ' + report_date_to + '.csv"'
				writer = csv.writer(response)

				writer.writerow(["Report taken from " + report_date_from + " to " + report_date_to + ". Created with http://mytimetab.com"])
				
				for i in report_meta:
					writer.writerow([i])

				if report_meta:
					writer.writerow([""])
	
				writer.writerow(["Activity", "Date", "Description", "Start Time", "End Time", "Length", "Billable", "Income", "Hourly Rate"])

				for activity in the_activities_array:
					number_of_records = 0

					for i in time_records:
						if activity == i.activity_name:
							if number_of_records == 0:
								number_of_records = 1

							time_length_obj = rounding_minutes(
								minutes = (i.time_length / 2) % 60,
								hours = i.time_length / 2 / 60,
								round_amount = rounding_amount,
								round_type = rounding_type
							)

							time_start_obj = rounding_minutes(
								minutes = i.time_start % 60 + time_length_obj["Time_differ"],
								hours = i.time_start / 60,
								round_amount = rounding_amount,
								round_type = rounding_type
							)

							time_end_obj = rounding_minutes(
								minutes = (i.time_start + i.time_length / 2) % 60,
								hours = (i.time_start + i.time_length / 2) / 60,
								round_amount = rounding_amount,
								round_type = rounding_type
							)

							time_from_conversion = time_conversion(
								time = time_start_obj["Hours"],
								type = int(download_time_format),
							)

							time_to_conversion = time_conversion(
								time = time_end_obj["Hours"],
								type = int(download_time_format),
							)

							time_decimal = time_length_obj["Hours"] + ((100 / 60 * (time_length_obj["Minutes"] * 1.0)) / 100)
							start_time = ("0" + str(time_from_conversion["Time"]))[-2:] + ":" + ("0" + str(time_start_obj["Minutes"]))[-2:]
							end_time = ("0" + str(time_to_conversion["Time"]))[-2:] + ":" + ("0" + str(time_end_obj["Minutes"]))[-2:]
							time_length = ("0" + str(time_length_obj["Hours"]))[-2:] + ":" + ("0" + str(time_length_obj["Minutes"]))[-2:]
							billable = "yes" if i.billable == "1" else "no"
							i.hourly_rate = 0 if i.hourly_rate == "" else i.hourly_rate
							

							start_time += " " + time_from_conversion["Period"] if time_from_conversion["Period"] else ""
							end_time += " " + time_to_conversion["Period"] if time_to_conversion["Period"] else ""
							income = "{0:.2f}".format(float(i.hourly_rate) * (float(time_length_obj["Hours"]) + time_decimal)) if billable == "yes" else 0

							custom_date = date_format(
								date = str(i.cus_date),
								old_format = "yyyy-mm-dd",
								new_format = download_date_format,
								new_separator = download_date_seperator
							)

							writer.writerow([i.activity_name.replace("_"," "), custom_date, i.description, start_time, end_time, time_length, billable, income, i.hourly_rate])

				return response