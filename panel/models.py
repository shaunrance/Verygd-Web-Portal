from media_portal.album.content.models import Content as Panel
from taggit.managers import TaggableManager


@property
def tag(self):
    return self.tags.all()[0]


Panel.tags = TaggableManager()
Panel.tag = tag
