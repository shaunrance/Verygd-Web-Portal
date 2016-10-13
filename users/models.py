from users.managers import VeryGDMemberManager
from media_portal.users.models.base import Member as Member

very_gd_manager = VeryGDMemberManager()
very_gd_manager.model = Member

Member.objects = very_gd_manager
