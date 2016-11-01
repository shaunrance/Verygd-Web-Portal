from __future__ import unicode_literals

from actstream import registry as actstream_registry
from django.db import models

from django.utils.encoding import python_2_unicode_compatible
from project.models import Project


@python_2_unicode_compatible
class Scene(models.Model):
    project = models.ForeignKey(Project, blank=False, null=False, related_name='scenes')

    title = models.CharField(max_length=128, blank=False, null=False)
    description = models.CharField(max_length=128, blank=True, null=True)

    is_panorama = models.BooleanField(default=False, null=False, blank=True, verbose_name='is-panorama')
    background = models.CharField(max_length=32, null=True, blank=True, verbose_name='background')

    @property
    def owner(self):
        return self.project.owner

    @property
    def content(self):
        for content_type in 'videos', 'images':
            for content in getattr(self, str(content_type)).all():
                yield content

    def __str__(self):
        return '{0}'.format(self.title)

    @property
    def serializer(self):
        from scene.serializers import SceneSerializer
        return SceneSerializer

    @property
    def media_group(self):
        return self.project.media_group

    @classmethod
    def class_prepared(cls):
        actstream_registry.register(cls)
