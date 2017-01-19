from django.db import models
from users.settings import UserSettings

from users.managers import VeryGDMemberManager
from media_portal.users.member.base import BaseMember


class Member(BaseMember):
    objects = VeryGDMemberManager()

    @property
    def private_project_count(self):
        return self.project_set.filter(public=False).count()

    total_content_bytes = models.BigIntegerField(default=0, null=False, blank=False)

    @property
    def file_size_quota_bytes(self):
        return UserSettings.objects.get().file_size_quota_bytes


class FileSizeQuotaReachedException(Exception):
    pass
