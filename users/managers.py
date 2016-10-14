from media_portal.users.managers import MemberManager
from media_portal.users.auth.group import MediaGroup

from media_portal.invite.models import Invite


class VeryGDMemberManager(MemberManager):
    def create_member(self, *args, **kwargs):
        invite_code = kwargs.pop('invite_code', None)

        is_owner = not invite_code

        member = self.model.create(*args, **kwargs)
        member.save()

        if is_owner:
            # create a new group
            new_group = MediaGroup.objects.create_group()
            new_group.save()

            member.groups.add(new_group)

            # assign object-level permission of 'owner' to the new group obj
            member.assign_perm('owner', new_group)

            member.save()
        else:
            # find invite
            invite = Invite.objects.get(code=invite_code)
            invite.accepted = True

            # join inviter's group
            member.groups.add(invite.inviter.group)

            invite.inviter.media_group.save()
            invite.save()

        return member

