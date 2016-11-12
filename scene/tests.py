from very_gd.tests.base import TestAPIBase
from project.tests import TestProject
from django.conf import settings
from django.test import override_settings


class TestScene(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestScene, self).__init__(*args, **kwargs)

        self.project = TestProject()
        self.endpoint = 'scene'

        self.scene_id = None
        self.member = None
        self.project_id = None

    def setUp(self):
        super(TestScene, self).setUp()

        self.member = self.users.new_user()
        self.project_id = self.project.add_new_project(self.member)
        self.scene_id = self.add_scene(self.member, project=self.project_id)

    def test_add_scene(self):
        pass

    @override_settings(SCENE_SIZE_LIMIT_BYTES=None)
    def test_scene_limits(self):
        test_image = self.strategies.get_test_image('test.png')
        settings.SCENE_SIZE_LIMIT_BYTES = test_image.size * 2 - 1

        response, msg = self.add_panel(self.member, self.scene_id, test_image=test_image)

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

        response, scene_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, self.scene_id))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 scene_meta))

        self.assertEquals(scene_meta['size'], test_image.size)

        test_image = self.strategies.get_test_image('test.png')

        response, msg = self.add_panel(self.member, self.scene_id, test_image=test_image)

        # reached scene size limit
        self.assertEquals(response.status_code, 400, 'expected 400 got {0} instead ({1})'.format(response.status_code,
                                                                                                 msg))

        response, scene_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, self.scene_id))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 scene_meta))

        self.assertEquals(scene_meta['size'], test_image.size)

    def test_images(self):
        response, msg = self.add_panel(
            self.member,
            self.scene_id,
            tag='tag',
            related_tag='related_tag',
            order=5,
            is_panorama=True
        )

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

        response, image_meta = self.get_as(self.member, '/{0}/{1}'.format(self.panel_endpoint, msg['id']))

        self.assertEquals(response.status_code, 200, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            image_meta
        ))

        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] == 'related_tag')

        self.assertTrue('order' in image_meta and image_meta['order'] == 5)

        response, msg = self.put_as(self.member, '/{0}/{1}'.format(self.panel_endpoint,
                                                                   image_meta['id']), data={'related_tag': 'cool'})

        self.assertEquals(response.status_code, 200)

        response, image_meta = self.get_as(self.member, '/{0}/{1}'.format(self.panel_endpoint, msg['id']))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] == 'cool')

    def test_can_make_related_tag_blank(self):
        response, image_meta = self.add_panel(
            self.member,
            self.scene_id,
            related_tag='related_tag',
            order=5,
            is_panorama=True
        )

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            image_meta
        ))

        response, msg = self.put_as(self.member,
                                    '/{0}/{1}'.format(self.panel_endpoint, image_meta['id']),
                                    data={'related_tag': None},
                                    content_type='application/json')

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

        response, image_meta = self.get_as(self.member, '/{0}/{1}'.format(self.panel_endpoint, msg['id']))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('related_tag' in image_meta and image_meta['related_tag'] is None)

    def test_update_scene(self):
        response, msg = self.patch_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, self.scene_id), data={
            'title': 'new title', 'background': 'salmon'
        })

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

        response, album_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, self.scene_id))

        self.assertEquals(response.status_code, 200, 'got {0} expected 201'.format(response.status_code))

        self.assertTrue('title' in album_meta and album_meta['title'] == 'new title')
        self.assertTrue('background' in album_meta and album_meta['background'] == 'salmon')
