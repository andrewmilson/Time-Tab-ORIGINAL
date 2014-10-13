from django.db import models

class dbstorage(models.Model):
	user = models.CharField(max_length = 300)
	key = models.CharField(max_length = 100)
	value = models.TextField()

	def __unicode__(self):
		return self.key

class settings(models.Model):
	user = models.CharField(max_length = 300)
	date_format = models.CharField(max_length = 10)
	date_separator = models.CharField(max_length = 1)
	slider_time_format = models.IntegerField()
	report_time_format = models.IntegerField()
	slider_time_snap = models.IntegerField()
	slider_start_time = models.IntegerField()
	default_currency = models.CharField(max_length = 3)

	def __unicode__(self):
		return self.user
