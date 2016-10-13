from media_portal.album.content.base.models import AlbumImage, AlbumVideo

from django.db import models


class Panel(models.Model):
    class Meta:
        abstract = True

    related_tag = models.CharField(max_length=16, blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)

    is_panorama = models.BooleanField(default=False, null=False, blank=True, verbose_name='is-panorama')


class PanelImage(AlbumImage, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='images')


class PanelVideo(AlbumVideo, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='videos')
