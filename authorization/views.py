from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from django.http import HttpResponseRedirect
from django.conf import settings
from django import forms
from captcha.fields import CaptchaField

# password reset imports
from django.views.decorators.csrf import csrf_protect

class signup_form(forms.Form):
	first_name = forms.CharField(max_length = 35)
	last_name = forms.CharField(max_length = 35)
	email = forms.EmailField()
	password = forms.CharField(widget = forms.PasswordInput())
	captcha = CaptchaField()

class login_form(forms.Form):
	email = forms.EmailField()
	password = forms.CharField(widget = forms.PasswordInput())


@csrf_protect
def login_user(request):
	csrf_token = csrf(request)["csrf_token"]

	if request.POST:
		form = login_form(request.POST)
		if form.is_valid():
			email = form.cleaned_data["email"]
			password = form.cleaned_data["password"]
			user = authenticate(username = email, password = password)

			if user is not None and user.is_active:
				login(request, user)
				redirect = HttpResponseRedirect(request.GET["next"]) if request.GET.get("next") != None else HttpResponseRedirect("/slider/")
				return redirect
			else:
				return render(request, "account/login.html", {
					"csrf_token": csrf_token, 
					"state": "Incorrect Username or password",
					"form": form
				})
		else:
			return render(request, "account/login.html", {
				"csrf_token": csrf_token, 
				"form": form
			})
	elif request.GET.get("logout") == "True" and request.user.is_authenticated():
		logout(request)
		return render(request, "account/login.html", {
			"csrf_token": csrf_token, 
			"state": "Successfully logged out.",
			"form": login_form()
		})
	elif request.user.is_authenticated():
		return render(request, "account/login.html", {
			"csrf_token": csrf_token, 
			"state": "You are currently logged in, <a href='/account/login/?logout=True'>Logout</a> before logging in with a different account.",
			"form": login_form()
		})
	elif request.GET.get("next"):
		return render(request, "account/login.html", {
			"csrf_token": csrf_token, 
			"state": "Please login before accessing that page",
			"form": login_form()
		})
	else:
		return render(request, "account/login.html", {
			"csrf_token": csrf_token, 
			"form": login_form()
		})

@csrf_protect
def signup(request):
	csrf_token = csrf(request)["csrf_token"]

	if request.POST:
		form = signup_form(request.POST)

		if form.is_valid():
			first_name = form.cleaned_data["first_name"]
			last_name = form.cleaned_data["last_name"]
			email = form.cleaned_data["email"]
			password = form.cleaned_data["password"]

			create_user = User.objects.create_user(email, email, password)
			create_user.first_name = first_name
			create_user.last_name = last_name
			create_user.save()
			user = authenticate(username = email, password = password)

			if user is not None:
				login(request, user)
				return HttpResponseRedirect("/slider/")
			else:
				return render(request, "account/create.html", {
					"csrf_token": csrf(request)["csrf_token"],
					"form": form
				})	
		else:
			return render(request, "account/create.html", {
				"csrf_token": csrf(request)["csrf_token"],
				"form": form
			})
	else:
		return render(request, "account/create.html", {
			"csrf_token": csrf(request)["csrf_token"],
			"form": signup_form()
		})