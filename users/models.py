from django.db import models
from users.settings import UserSettings

from users.managers import VeryGDMemberManager
from media_portal.users.member.base import BaseMember


class VeryGDMember(BaseMember):
    class Meta:
        abstract = True

    objects = VeryGDMemberManager()

    @property
    def private_project_count(self):
        return self.projects.filter(public=False).count()

    total_content_bytes = models.BigIntegerField(default=0, null=False, blank=False)

    @property
    def file_size_quota_bytes(self):
        return UserSettings.objects.get().file_size_quota_bytes

    def create_project(self, project_cls, *args, **kwargs):
        project = project_cls.objects.create(**kwargs)
        project.save()

        return project


class Member(VeryGDMember):
    def create_project(self, *args, **kwargs):
        if 'public' not in kwargs:
            kwargs['public'] = True

        if not kwargs['public'] and self.private_project_count == 1:
            raise PrivateProjectLimitReachedException('Basic users are limited to 1 private project.')

        return super(Member, self).create_project(*args, **kwargs)

    def upgrade_to_premium(self):
        try:
            return self.premiummember
        except PremiumMember.DoesNotExist:
            self.premiummember = PremiumMember.objects.create(member_ptr=self, member_ptr_id=self.pk, user=self.user)

            return self.premiummember


class PremiumMember(Member):
    def create_project(self, *args, **kwargs):
        if 'public' not in kwargs:
            kwargs['public'] = False

        return super(Member, self).create_project(*args, **kwargs)


class FileSizeQuotaReachedException(Exception):
    pass


class PrivateProjectLimitReachedException(Exception):
    pass
