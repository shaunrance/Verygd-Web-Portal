from users.managers import VeryGDMemberManager
from media_portal.users.member.base import BaseMember


class Member(BaseMember):
    objects = VeryGDMemberManager()
