from django.contrib.sitemaps import Sitemap

class staticpages(Sitemap):
	priority = 0.8
	lastmod = None

	def items(self):
		return [
			"/",
			"/home",
			"/about",
			"/account/signup/",
			"/account/login/",
		]

	def location(self, obj):
		return obj[0] if isinstance(obj, tuple) else obj

	def changefreq(self, obj):
		return obj[1] if isinstance(obj, tuple) else "weekly"

sitemaps = dict(
	static = staticpages
)