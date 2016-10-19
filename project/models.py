from django.db import models
from users.models import Member


class Project(models.Model):
    name = models.CharField(max_length=32, blank=False, null=False)
    owner = models.ForeignKey(Member, null=False)

    created_dt = models.DateTimeField(auto_now_add=True, null=False)
    updated_dt = models.DateTimeField(auto_now=True, null=False)

    public = models.BooleanField(default=False, blank=True, null=False)

    @property
    def media_group(self):
        return self.owner.media_group

    @property
    def content(self):
        for content_type in ['scenes']:
            for content in getattr(self, str(content_type)).all():
                yield content
