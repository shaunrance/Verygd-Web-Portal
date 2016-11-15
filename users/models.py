from users.managers import VeryGDMemberManager
from users.settings import UserSettings
from media_portal.users.member.base import BaseMember
from media_portal.payment.models import Payment
from django.db import models


class Member(BaseMember):
    objects = VeryGDMemberManager()

    total_content_bytes = models.BigIntegerField(default=0, null=False, blank=False)

    @property
    def file_size_quota_bytes(self):
        return UserSettings.objects.get().file_size_quota_bytes
