from django.db import models
from django.contrib.sites.models import Site
from media_portal.users.settings import UserSignUpEmail as BaseSignUpEmail
from media_portal.users.settings import UserPasswordResetEmail as BaseResetPasswordEmail


class UserSignUpEmail(BaseSignUpEmail, models.Model):
    pass


class UserPasswordResetEmail(BaseResetPasswordEmail, models.Model):
    pass


class UserFileSizeQuota(models.Model):
    basic_quota_bytes = models.BigIntegerField(default=int(1e+8), blank=True, null=True)
    premium_quota_bytes = models.BigIntegerField(default=int(1e+9), blank=True, null=True)


class UserSettings(models.Model):
        class Meta:
            verbose_name_plural = 'user settings'

        site = models.OneToOneField(Site, null=True, related_name='user_settings', default=1, on_delete=models.SET_NULL)
        signup_email = models.OneToOneField(UserSignUpEmail, related_name='user_settings', null=False, blank=False)
        reset_password_email = models.OneToOneField(UserPasswordResetEmail, related_name='user_settings', null=False,
                                                    blank=False)

        updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

        quotas = models.OneToOneField(UserFileSizeQuota, related_name='user_settings', null=False, blank=False)

        def __unicode__(self):
            return 'User e-mail settings for {0}'.format(str(self.site))
