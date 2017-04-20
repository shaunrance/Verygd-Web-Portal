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

    order = models.IntegerField(null=False)

    created_dt = models.DateTimeField(auto_now_add=True, null=False)
    updated_dt = models.DateTimeField(auto_now=True, null=False)

    is_panorama = models.BooleanField(default=False, null=False, blank=True, verbose_name='is-panorama')
    background = models.CharField(max_length=32, null=True, blank=True, verbose_name='background')
    gap_distance = models.FloatField(blank=True, null=True)
    pan_start_point = models.FloatField(blank=True, null=True)

    scene_type = models.CharField(max_length=32, null=True, blank=True)
    hotspot_type = models.CharField(max_length=128, blank=True, null=True)

    equirectangular_background_image = models.FileField(upload_to='images', null=True, blank=True)

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

    def save(self, *args, **kwargs):
        if not self.order:
            last_scene_in_project = self.project.scenes.order_by('-created_dt').first()

            if last_scene_in_project:
                self.order = last_scene_in_project.order + 1
            else:
                self.order = 1

        super(Scene, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        for content in self.content:
            content.delete()

        return super(Scene, self).delete(using=using, keep_parents=keep_parents)
