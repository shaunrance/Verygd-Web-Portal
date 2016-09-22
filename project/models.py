from media_portal.album.models import Album as Project
from taggit.managers import TaggableManager


Project.tags = TaggableManager()
