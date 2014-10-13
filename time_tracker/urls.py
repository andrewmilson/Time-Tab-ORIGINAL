from django.conf.urls import patterns, include, url
from time_tracker import settings
from django.conf.urls.defaults import *
from time_tracker.sitemaps import sitemaps

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
	# acount managing
	url(r"^account/login/$", "authorization.views.login_user"),
	url(r"^account/signup/$", "authorization.views.signup"),
	url(r"^account/password/reset/$", "django.contrib.auth.views.password_reset", {'template_name': 'account/reset_password.html',"email_template_name": "account/reset_password.html"}),
	url(r"^account/password/reset/done/$", "django.contrib.auth.views.password_reset_done", {'template_name': 'account/reset_password.html'}),
	url(r"^account/password/change/$", "django.contrib.auth.views.password_change", {'template_name': 'account/change_password.html'}),
	url(r"^account/password/change/done/$", "django.contrib.auth.views.password_change_done", {'template_name': 'account/change_password_done.html'}),
	# url(r"^account/signup/premium/", include('paypal.standard.ipn.urls')),
	# url(r"^account/signup/subscribe/", "time_tracker.views.subscribe"),
	# url(r'^checkout/', include('paypal_express_checkout.urls')),
	url(r'^account/$', include('social_auth.urls')),
	url(r'^captcha/$', include('captcha.urls')),
	url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
	# ajax pages
	url(r"^slider/post/$", "slider.views.post"),
	url(r"^report/post/$", "report.views.post"),
	url(r"^home/post/$", "time_tracker.views.post"),
	# main pages
	url(r"^slider/$", "slider.views.slider"),
	url(r"^report/$", "report.views.report"),
	# url(r"^invoice/$", "invoice.views.invoice"),
	# home pages
	url(r"^home/$", "time_tracker.views.home"),
	url(r'^$', "time_tracker.views.domain"),
	url(r'^googlee1c9a5b93427c823\.html$', "time_tracker.views.webmastertools"),
	url(r'^terms/$', "time_tracker.views.terms"),
	url(r'^privacy/$', "time_tracker.views.privacy"),
	# url(r"^signup/$", "time_tracker.views.signup"),
	url(r"^about/$", "time_tracker.views.about"),
	# url(r"^tour/", "time_tracker.views.tour")
)
