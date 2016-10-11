from users.managers import VeryGDMemberManager
from media_portal.users.models.base import Member as VeryGDMember

very_gd_manager = VeryGDMemberManager()
very_gd_manager.model = VeryGDMember

VeryGDMember.objects = very_gd_manager
