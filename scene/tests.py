from very_gd.tests.base import TestAPIBase
from project.tests import TestProject
from django.conf import settings
from users.settings import UserSettings, UserPasswordResetEmail, UserSignUpEmail


class TestScene(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestScene, self).__init__(*args, **kwargs)

        self.project = TestProject()
        self.endpoint = 'scene'

        self.scene_id = None
        self.member = None
        self.project_id = None

    def setup_user_settings(self):
        reset_password = UserPasswordResetEmail()
        reset_password.save()

        signup_email = UserSignUpEmail()
        signup_email.save()

        user_settings = UserSettings.objects.create(
            reset_password_email=reset_password,
            signup_email=signup_email
        )

        user_settings.save()

    def setUp(self):
        super(TestScene, self).setUp()

        self.member = self.users.new_user()
        self.project_id = self.project.add_new_project(self.member)
        self.scene_id = self.add_scene(self.member, project=self.project_id)

        self.setup_user_settings()

    def test_add_scene(self):
        pass

    def test_content_limits(self):
        user_settings = UserSettings.objects.get()

        test_image = self.strategies.get_test_image('test.png')

        user_settings.file_size_quota_bytes = test_image.size * 2 - 1
        user_settings.save()

        response, msg = self.add_panel(self.member, self.scene_id, test_image=test_image)

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

        response, user_meta = self.get_as(self.member, '/{0}/{1}'.format(self.user_endpoint, self.member['id']))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 user_meta))

        self.assertEquals(user_meta['total_content_bytes'], test_image.size)

        test_image = self.strategies.get_test_image('test.png')

        response, msg = self.add_panel(self.member, self.scene_id, test_image=test_image)

        # reached scene size limit
        self.assertEquals(response.status_code, 400, 'expected 400 got {0} instead ({1})'.format(response.status_code,
                                                                                                 msg))

        response, user_meta = self.get_as(self.member, '/{0}/{1}'.format(self.user_endpoint, self.member['id']))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 user_meta))

        self.assertEquals(user_meta['total_content_bytes'], test_image.size)

        # deleting an image should decrement scene size
        response = self.delete_panel(self.member, 1)

        self.assertEquals(response.status_code, 204, 'expected 204 got {0} instead.'.format(response.status_code))

        self.assertEquals(self.get_as(self.member, '/{0}/{1}'.format(
            self.user_endpoint, self.member['id']))[1]['total_content_bytes'], 0)

        # ..and allow a new image in its place
        response, msg = self.add_panel(self.member, self.scene_id)

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(
            response.status_code,
            msg
        ))

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
