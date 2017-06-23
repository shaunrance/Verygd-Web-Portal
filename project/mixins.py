import bcrypt

from django.db import models


class PasswordProtectable(models.Model):
    class Meta:
        abstract = True

    password = models.CharField(max_length=128, null=True, blank=True)

    @classmethod
    def hash_password(cls, password):
        return bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt())

    def check_password(self, password):
        return bcrypt.hashpw(password.encode('utf8'), self.password.encode('utf8')).decode('utf8') == self.password

    def set_password(self, password):
        self.password = self.__class__.hash_password(password)
