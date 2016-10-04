from media_portal.album.models.base import Album
from django.db import models


class Project(Album):
    background_color = models.CharField(max_length=32, null=True, blank=True, verbose_name='background-color')
