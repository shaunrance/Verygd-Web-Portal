import jsonfield

from media_portal.album.content.base.models import AlbumImage, AlbumVideo
from users.models import Member
from django.db import models
from users.models import FileSizeQuotaReachedException


class Panel(models.Model):
    class Meta:
        abstract = True

    related_tag = models.CharField(max_length=16, blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)

    hotspots = jsonfield.JSONField(null=True)
    hotspot_type = models.CharField(max_length=128, blank=True, null=True)

    @property
    def media_group(self):
        return self.scene.media_group

    def reached_scene_size_limit(self):
        if self.owner.total_content_bytes + self.content.size > self.owner.file_size_quota_bytes:
            raise FileSizeQuotaReachedException('file too large.  max scene size reached ({0})'.format(
                self.owner.file_size_quota_bytes))

    def increment_scene_size(self):
        self.owner.total_content_bytes += self.content.size
        self.owner.save()

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        created = not self.pk

        if created:
            self.reached_scene_size_limit()

        super(Panel, self).save(force_insert, force_update, using, update_fields)

        if created:
            self.increment_scene_size()

    def delete(self, using=None, keep_parents=False):
        content_size_bytes = self.content.size
        owner = self.owner

        super(Panel, self).delete(using, keep_parents)

        owner.total_content_bytes -= content_size_bytes
        owner.save()


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
