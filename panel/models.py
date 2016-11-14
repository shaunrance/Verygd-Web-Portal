from media_portal.album.content.base.models import AlbumImage, AlbumVideo

from django.db import models
from django.conf import settings

from scene.models import SceneMaxSizeReachedException


class Panel(models.Model):
    class Meta:
        abstract = True

    related_tag = models.CharField(max_length=16, blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)

    @property
    def media_group(self):
        return self.scene.media_group

    def reached_scene_size_limit(self):
        if self.scene.size + self.content.file.size > settings.SCENE_SIZE_LIMIT_BYTES:
            raise SceneMaxSizeReachedException('file too large.  max scene size reached ({0})'.format(
                settings.SCENE_SIZE_LIMIT_BYTES))

    def increment_scene_size(self):
        self.scene.size += self.content.size
        self.scene.save()

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        self.reached_scene_size_limit()

        super(Panel, self).save(force_insert, force_update, using, update_fields)

        self.increment_scene_size()

    def delete(self, using=None, keep_parents=False):
        content_size_bytes = self.content.size
        scene = self.scene

        super(Panel, self).delete(using, keep_parents)

        scene.size -= content_size_bytes
        scene.save()


class PanelImage(AlbumImage, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='images')

    @property
    def serializer(self):
        from panel.serializers import PanelImageSerializer
        return PanelImageSerializer


class PanelVideo(AlbumVideo, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='videos')
