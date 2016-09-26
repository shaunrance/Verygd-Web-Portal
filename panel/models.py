from media_portal.album.content.models import Content as Panel
from taggit.managers import TaggableManager
from django.db import models


@property
def tag(self):
    return self.tags.all()[0]


Panel.tags = TaggableManager()
Panel.tag = tag


order = models.IntegerField(max_length=128, blank=True, null=True)
order.contribute_to_class(Panel, 'order')
