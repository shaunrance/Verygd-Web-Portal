import uuid
from django.utils.encoding import python_2_unicode_compatible

from django.contrib.auth.models import Group, GroupManager


class MediaGroupManager(GroupManager):
    def create_group(self, *args, **kwargs):
        # generate name attribute for base class
        kwargs['name'] = uuid.uuid4()

        return self.create(*args, **kwargs)


@python_2_unicode_compatible
class MediaGroup(Group):
    class Meta:
        permissions = (
            ('owner', 'owner of media group'),
        )

    objects = MediaGroupManager()

    def __str__(self):
        return str(self.name)
