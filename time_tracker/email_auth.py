from django.contrib.auth.backends import ModelBackend
from django.contrib.admin.models import User

class email_auth(ModelBackend):
    def authenticate(self, email=None, password=None,**kwargs):
        try:
            user = User.objects.get(email=email)  
            if user.check_password(password):
                return user
            return None
        except User.DoesNotExist:
            return None