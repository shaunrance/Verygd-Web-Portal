from users.managers import VeryGDMemberManager
from media_portal.users.member.base import BaseMember


class Member(BaseMember):
    objects = VeryGDMemberManager()

    @property
    def private_project_count(self):
        return self.project_set.filter(public=False).count()
