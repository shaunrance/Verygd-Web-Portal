import jsonfield

from media_portal.album.content.base.models import AlbumImage, AlbumVideo
from users.models import Member
from django.db import models


class Panel(models.Model):
    class Meta:
        abstract = True

    related_tag = models.CharField(max_length=16, blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)

    hotspots = jsonfield.JSONField(null=True)

    @property
    def media_group(self):
        return self.scene.media_group


class PanelImage(AlbumImage, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='images')
    owner = models.ForeignKey(Member, related_name='images')

    @property
    def serializer(self):
        from panel.serializers import PanelImageSerializer
        return PanelImageSerializer


class PanelVideo(AlbumVideo, Panel):
    scene = models.ForeignKey('scene.Scene', related_name='videos')
    owner = models.ForeignKey(Member, related_name='videos')
