from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.utils.http import urlquote
from django.core.mail import send_mail
from django.core.context_processors import csrf

def home(request):
	return render(request, 'home/home.html', {"csrf_token": csrf(request)["csrf_token"]})

def contact(request):
	return render(request, 'home/home.html', {"csrf_token": csrf(request)["csrf_token"]})

def signup(request):
	return render(request, 'home/signup.html', {"csrf_token": csrf(request)["csrf_token"]})

def tour(request):
	return render(request, 'home/tour.html', {"csrf_token": csrf(request)["csrf_token"]})

def about(request):
	return render(request, 'home/about.html', {"csrf_token": csrf(request)["csrf_token"]})

def domain(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect("/slider/")
	else:
		return HttpResponseRedirect("/home/")

def webmastertools(request):
	return render(request, 'home/googlee1c9a5b93427c823.html', {"csrf_token": csrf(request)["csrf_token"]})

def terms(request):
	return render(request, 'home/terms.html', {"csrf_token": csrf(request)["csrf_token"]})

def privacy(request):
	return render(request, 'home/privacy.html', {"csrf_token": csrf(request)["csrf_token"]})

def post(request):
	if request.POST:
		post_data = request.POST
		send_method = post_data["send_method"]

		if send_method == "contact":
			email_fail = True if post_data["subject"] is not "" else False
			send_mail('Contact message from %s' % post_data["name"], post_data["message"], post_data["email"], ['admin@mytimetab.com'], fail_silently = False)
			return HttpResponseRedirect("%s?state=succesfully%%20contacted%%20Time%%20Tab" % post_data["next"])


