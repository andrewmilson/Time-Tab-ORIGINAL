from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.context_processors import csrf


@login_required
def invoice(request):
	return render(request, 'app/invoice.html', {
		"email": request.user.email,
		"csrf_token": csrf(request)["csrf_token"]
	})