from django.db import models

class timerecords(models.Model):
	user = models.CharField(max_length = 300)
	activity_name = models.CharField(max_length = 100)
	cus_date = models.DateField()
	created = models.DateTimeField(auto_now_add = True)
	time_start = models.IntegerField()
	time_length = models.IntegerField()
	billable = models.CharField(max_length = 3)
	hourly_rate = models.CharField(max_length = 10)
	description = models.TextField()

	def __unicode__(self):
		return self.activity_name

class activities(models.Model):
	user = models.CharField(max_length = 300)
	value = models.TextField()

	def __unicode__(self):
		return self.user