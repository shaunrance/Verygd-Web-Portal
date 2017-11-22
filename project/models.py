import shortuuid

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from users.models import Member
from project.mixins import PasswordProtectable


def get_default_shortuuid():
    return shortuuid.uuid()


@python_2_unicode_compatible
class Project(PasswordProtectable, models.Model):
    short_uuid = models.CharField(max_length=22, unique=True, default=get_default_shortuuid, editable=False, null=False)

    name = models.CharField(max_length=32, blank=False, null=False)
    description = models.CharField(max_length=240, null=True)
    owner = models.ForeignKey(Member, null=False, related_name='projects')

    created_dt = models.DateTimeField(auto_now_add=True, null=False)
    updated_dt = models.DateTimeField(auto_now=True, null=False)

    public = models.BooleanField(default=True, blank=True, null=False)

    featured = models.BooleanField(default=False, blank=True, null=False)
    featured_order = models.IntegerField(blank=True, null=True)

    @property
    def private(self):
        return not self.public

    @property
    def media_group(self):
        return self.owner.media_group

    @property
    def group_owner(self):
        return self.owner.group_owner

    @property
    def content(self):
        for content_type in ['scenes']:
            for content in getattr(self, str(content_type)).all():
                yield content

    def delete(self, using=None, keep_parents=False):
        for content in self.content:
            content.delete()

        return super(Project, self).delete(using=using, keep_parents=keep_parents)

    def __str__(self):
        return '{name} - {owner}'.format(name=self.name, owner=self.owner)
