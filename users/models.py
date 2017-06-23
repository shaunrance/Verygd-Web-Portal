from django.db import models
from users.settings import UserSettings

from users.managers import VeryGDMemberManager
from users.social.photo.mixin import SocialPhotoMixin
from media_portal.users.member.base import BaseMember


class VeryGDMember(BaseMember, SocialPhotoMixin):
    class Meta:
        abstract = True

    objects = VeryGDMemberManager()

    @property
    def private_project_count(self):
        return self.projects.filter(public=False).count()

    total_content_bytes = models.BigIntegerField(default=0, null=False, blank=False)

    @property
    def file_size_quota_bytes(self):
        raise NotImplementedError

    @property
    def content_bytes_left(self):
        return self.file_size_quota_bytes - self.total_content_bytes

    def create_project(self, project_cls, *args, **kwargs):
        if kwargs['public'] is False and kwargs.get('password', None):
            kwargs['password'] = project_cls.hash_password(kwargs['password'])

        project = project_cls.objects.create(**kwargs)
        project.save()

        return project

    @property
    def quota_settings(self):
        return UserSettings.objects.get().quotas


class Member(VeryGDMember):
    @property
    def file_size_quota_bytes(self):
        if self.has_premium_account:
            return self.premiummember.file_size_quota_bytes
        else:
            return self.quota_settings.basic_quota_bytes

    def create_project(self, *args, **kwargs):
        if 'public' not in kwargs:
            kwargs['public'] = True

        if not kwargs['public'] and self.private_project_count == 1:
            raise PrivateProjectLimitReachedException('Basic users are limited to 1 private project.')

        return super(Member, self).create_project(*args, **kwargs)

    def update(self, *args, **kwargs):
        super(Member, self).update(*args, **kwargs)

        if self.payment:
            self.upgrade_to_premium()

    @property
    def has_premium_account(self):
        return True if hasattr(self, 'premiummember') else False

    @property
    def member_type(self):
        return 'premium' if self.has_premium_account else 'basic'

    @property
    def subscription_type(self):
        if self.payment and hasattr(self.payment, 'plan_name') and self.payment.plan_name in ('beta_yearly',
                                                                                              'beta_monthly'):
            return 'paid'
        elif self.has_premium_account:
            return 'granted'
        else:
            return None

    def upgrade_to_premium(self):
        try:
            return self.premiummember
        except PremiumMember.DoesNotExist:
            self.premiummember = PremiumMember.objects.create(member_ptr=self, member_ptr_id=self.pk, user=self.user)

            return self.premiummember


class PremiumMember(Member):
    @property
    def file_size_quota_bytes(self):
        return self.quota_settings.premium_quota_bytes

    def create_project(self, *args, **kwargs):
        if 'public' not in kwargs:
            kwargs['public'] = False

        return super(Member, self).create_project(*args, **kwargs)


class FileSizeQuotaReachedException(Exception):
    pass


class PrivateProjectLimitReachedException(Exception):
    pass
