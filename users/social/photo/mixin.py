import shortuuid
from io import BytesIO

from django.db import models
from PIL import Image

from requests import request, HTTPError

from django.core.files.base import ContentFile


class SocialPhotoMixin(models.Model):
    class Meta:
        abstract = True

    def update_photo_from_facebook(self, *args, **kwargs):
        url = 'http://graph.facebook.com/{0}/picture?type=large'.format(self.user.social_user.uid)

        try:
            response = request('GET', url, params={'type': 'large'})
            response.raise_for_status()
        except HTTPError:
            pass
        else:
            photo = ContentFile(response.content)
            img = Image.open(BytesIO(response.content))

            file_ext = {v: k for k, v in Image.EXTENSION.items()}[img.format]

            photo.name = '{0}_{1}_social_photo{2}'.format(shortuuid.uuid(), self.user.username.lower(), file_ext)

            self.update_photo(photo)

    def update_social_photo(self):
        return getattr(self, 'update_photo_from_{0}'.format(self.user.social_user.provider))(self)
