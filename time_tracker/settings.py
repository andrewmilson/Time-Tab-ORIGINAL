# Django settings for time_tracker project.

# general site settings
app_name = "Time Tab"
app_url = "http://mytimetab.com"
app_email = "admin@mytimetab.com"


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
)

MANAGERS = ADMINS

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql", # Add "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "NAME": "xxxxxxxxxxx",                      # Or path to database file if using sqlite3.
        "USER": "xxxxxxxxxxx",                      # Not used with sqlite3.
        "PASSWORD": "xxxxxxxxxxx",                  # Not used with sqlite3.
        "HOST": "",                      # Set to empty string for localhost. Not used with sqlite3.
        "PORT": "",                      # Set to empty string for default. Not used with sqlite3.
    }
}

AUTHENTICATION_BACKENDS = (
    "social_auth.backends.google.GoogleOAuth2Backend",
    "social_auth.backends.google.GoogleBackend",
    "django.contrib.auth.backends.ModelBackend",
)

GOOGLE_OAUTH2_CLIENT_ID = "xxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_OAUTH2_CLIENT_SECRET = "xxxxxxxxxxx"
LOGIN_URL = "/account/login/"
LOGIN_REDIRECT_URL = "/slider/"
SOCIAL_AUTH_ENABLED_BACKENDS = ("google")


# payment section

# PAYPAL_RECEIVER_EMAIL = "merchant-account@mytimetab.com"

# HOSTNAME = 'http://localhost:8080'
# PAYPAL_API_URL = 'https://api-3t.sandbox.paypal.com/nvp'
# SALE_DESCRIPTION = 'Your payment to Foobar Inc.'
# PAYPAL_LOGIN_URL = (
#    'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token='
#)

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = "America/Chicago"

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = "en-us"

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ""

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ""

# Absolute path to the directory static files should be collected to.
# Don"t put anything in this directory yourself; store your static files
# in apps" "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ""

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = "/static/"

# Additional locations of static files
STATICFILES_DIRS = (
    "/Andrew M/python/websites/projects/django/timetracker/static/",
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
#    "django.contrib.staticfiles.finders.DefaultStorageFinder",
)

# Make this unique, and don"t share it with anybody.
SECRET_KEY = "xxxxxxxxxxx"

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    "django.template.loaders.filesystem.Loader",
    "django.template.loaders.app_directories.Loader",
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "social_auth.context_processors.social_auth_login_redirect",
    "django.core.context_processors.request",
)

MIDDLEWARE_CLASSES = (
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    # Uncomment the next line for simple clickjacking protection:
    # "django.middleware.clickjacking.XFrameOptionsMiddleware",
)

ROOT_URLCONF = "time_tracker.urls"

# Python dotted path to the WSGI application used by Django"s runserver.
WSGI_APPLICATION = "time_tracker.wsgi.application"

TEMPLATE_DIRS = (
    "/Andrew M/python/websites/projects/django/timetracker/templates/",
    "/Andrew M/python/websites/projects/django/timetracker/static/",
)

INSTALLED_APPS = (
    "social_auth",
    "captcha",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "slider",
    "time_tracker",
    'django.contrib.sitemaps',
    # "paypal.standard.ipn",
    # "paypal_express_checkout",
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse"
        }
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler"
        }
    },
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
    }
}
