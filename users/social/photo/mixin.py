import shortuuid
import json
from io import BytesIO

from django.db import models
from PIL import Image

from requests import request, HTTPError

from django.core.files.base import ContentFile


class SocialPhotoMixin(models.Model):
    class Meta:
        abstract = True

    def _update_photo_from_content(self, content):
        photo = ContentFile(content)
        img = Image.open(BytesIO(content))

        file_ext = {v: k for k, v in Image.EXTENSION.items()}[img.format]

        photo.name = '{0}_{1}_social_photo{2}'.format(shortuuid.uuid(), self.user.username.lower(), file_ext)

        self.update_photo(photo)

    def update_photo_from_facebook(self, *args, **kwargs):
        url = 'http://graph.facebook.com/{0}/picture'.format(self.user.social_user.uid)

        try:
            response = request('GET', url, params={'type': 'large'})
            response.raise_for_status()
        except HTTPError:
            pass
        else:
            self._update_photo_from_content(response.content)

    def update_photo_from_google(self, *args, **kwargs):
        url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={0}'.format(
            self.user.social_user.access_token)

        try:
            response = request('GET', url)
            response.raise_for_status()
        except HTTPError:
            pass
        else:
            user_meta = json.loads(response.content.decode('unicode-escape'))

            try:
                response = request('GET', user_meta['picture'])
                response.raise_for_status()
            except HTTPError:
                pass
            else:
                self._update_photo_from_content(response.content)

    def update_social_photo(self):
        provider = self.user.social_user.provider

        if provider == 'google-oauth2':
            provider = 'google'

        return getattr(self, 'update_photo_from_{0}'.format(provider))(self)
