import string

from very_gd.tests.base import TestAPIBase
from project.tests import TestProject
alphabet = list(string.ascii_lowercase)


class TestScene(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestScene, self).__init__(*args, **kwargs)

        self.project = TestProject()
        self.endpoint = 'scene'

        self.scene_id = None
        self.member = None
        self.project_id = None

    def add_scene(self, member, *args, **kwargs):
        data = self.strategies.get_create_scene_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.endpoint), data=data)

        self.assertEquals(response.status_code, 201)

        return msg['id']

    def setUp(self):
        super(TestScene, self).setUp()

        self.member = self.users.new_user()
        self.project_id = self.project.add_new_project(self.member)
        self.scene_id = self.add_scene(self.member, project=self.project_id)

    def test_add_scene(self):
        pass

    def test_images(self):
        response, msg = self.add_image(
            self.member,
            self.scene_id,
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

    def test_can_make_related_tag_blank(self):
        response, image_meta = self.add_image(
            self.member,
            self.album_id,
            tag='tag',
            related_tag='related_tag',
            order=5,
            is_panorama=True
        )

        self.assertEquals(response.status_code, 201, 'got {0} expected 201'.format(response.status_code))

        response, msg = self.put_as(self.member,
                                    '/images/{0}'.format(image_meta['id']),
                                    data={'related_tag': None},
                                    content_type='application/json')

        self.assertEquals(response.status_code, 200)

        response, image_meta = self.get_as(self.member, '/images/{0}'.format(msg['id']))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] is None)

    def test_update_project(self):
        response, msg = self.put_as(self.member, '/{0}/{1}'.format(self.endpoint, self.album_id), data={
            'title': 'new title', 'background_color': 'salmon'
        })

        self.assertEquals(response.status_code, 200)

        response, album_meta = self.get_as(self.member, '/{0}/{1}'.format(self.endpoint, self.album_id))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('title' in album_meta and album_meta['title'] == 'new title')
        self.assertTrue('background_color' in album_meta and album_meta['background_color'] == 'salmon')
