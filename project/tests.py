# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.strategies import VeryGDTestStrategies
from users.tests import TestVeryGDUsers
from media_portal.album.tests.tests import TestImageAPI


class TestProject(TestImageAPI):
    def __init__(self, *args, **kwargs):
        super(TestProject, self).__init__(*args, **kwargs)

        self.strategies = VeryGDTestStrategies()
        self.users = TestVeryGDUsers()

    def test_images(self):
        response, msg = self.add_image(
            self.member,
            self.album_id,
            tag='tag',
            related_tag='related_tag',
            order=5,
            is_panorama=True
        )

        self.assertEquals(response.status_code, 201, 'got {0} expected 201'.format(response.status_code))

        response, image_meta = self.get_as(self.member, '/images/{0}'.format(msg['id']))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('tag' in image_meta and image_meta['tag'] == 'tag')
        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] == 'related_tag')

        self.assertTrue('order' in image_meta and image_meta['order'] == 5)

        self.assertTrue('is_panorama' in image_meta and image_meta['is_panorama'])

        response, msg = self.put_as(self.member, '/images/{0}'.format(image_meta['id']), data={'related_tag': 'cool'})

        self.assertEquals(response.status_code, 200)

        response, image_meta = self.get_as(self.member, '/images/{0}'.format(msg['id']))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] == 'cool')

    def test_update_project(self):
        response, msg = self.put_as(self.member, '/album/{0}'.format(self.album_id), data={
            'title': 'new title', 'background_color': 'salmon'
        })

        self.assertEquals(response.status_code, 200)

        response, album_meta = self.get_as(self.member, '/album/{0}'.format(self.album_id))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('title' in album_meta and album_meta['title'] == 'new title')
        self.assertTrue('background_color' in album_meta and album_meta['background_color'] == 'salmon')
