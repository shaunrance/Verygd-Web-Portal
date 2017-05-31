# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.base import TestAPIBase
from users.models import Member
from project.models import Project


class TestProject(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestProject, self).__init__(*args, **kwargs)

        self.endpoint = 'project'

        self.project_id = None
        self.member = self.second_member = None
        self.anonymous_member = None

    def setUp(self):
        super(TestProject, self).setUp()

        self.member = self.users.new_user()
        self.second_member = self.users.new_user()

        self.users.setup_user_settings()

        self.anonymous_member = self.users.new_anonymous_user()
        self.project_id = self.add_new_project(self.member)

    def test_premium_create_project(self):
        Member.objects.get(pk=self.second_member['id']).upgrade_to_premium()

        project_id = self.add_new_project(self.second_member)

        response, msg = self.get_as(self.second_member, '/{0}/{1}'.format(self.endpoint, project_id))

        # projects created by premium users should default to private
        self.assertEquals(msg['public'], False)

        # ..or can explicitly set to True
        project_id = self.add_new_project(self.second_member, public=True)

        response, msg = self.get_as(self.second_member, '/{0}/{1}'.format(self.endpoint, project_id))

        self.assertEquals(msg['public'], True)

    def test_add_project(self):
        detail_url = '/{0}/{1}'.format(self.endpoint, self.project_id)

        response, msg = self.get_as(self.member, detail_url)

        self.assertEquals(response.status_code, 200)
        self.assertTrue('content' in msg and len(msg['content']) == 0)

        # projects created by basic users should default to public
        self.assertEquals(msg['public'], True)

        # ..or can explicitly set to False
        project_id = self.add_new_project(self.second_member, public=False)

        response, msg = self.get_as(self.second_member, '/{0}/{1}'.format(self.endpoint, project_id))

        self.assertEquals(msg['public'], False)

    def test_password_protect_private_project(self):
        project_id = self.add_new_project(self.member, public=False, password='test')

        detail_url = '/{0}/{1}'.format(self.endpoint, project_id)

        response, msg = self.get_as(self.anonymous_member, detail_url)

        self.assertEquals(response.status_code, 403)

        # project owner can access without a password
        response, msg = self.get_as(self.member, detail_url)
        self.assertEquals(response.status_code, 200)

        # project owner can access with (an ignored) password
        response, msg = self.get_as(self.member, ''.join([detail_url, '?password=test']))
        self.assertEquals(response.status_code, 200)

        response, msg = self.get_as(self.anonymous_member, ''.join([detail_url, '?password=test']))

        self.assertEquals(response.status_code, 200)
        self.assertTrue('password' not in msg)

        response, msg = self.get_as(self.anonymous_member, ''.join([detail_url, '?password=tests']))

        self.assertEquals(response.status_code, 403)

        # update password for existing private project
        response, msg = self.patch_as(self.member, detail_url, data={
            'password': 'tests'
        })

        self.assertEquals(response.status_code, 200)

        # old password no longer works
        response, msg = self.get_as(self.anonymous_member, ''.join([detail_url, '?password=test']))

        self.assertEquals(response.status_code, 403)

        # new password works
        response, msg = self.get_as(self.anonymous_member, ''.join([detail_url, '?password=tests']))

        self.assertEquals(response.status_code, 200)
        self.assertTrue('password' not in msg)

        # clear password
        response, msg = self.patch_as(self.member, detail_url, data={
            'password': None
        }, format='json')

        self.assertEquals(response.status_code, 200)

        # project is now private again
        response, msg = self.get_as(self.anonymous_member, detail_url)

        self.assertEquals(response.status_code, 403)

    def test_num_of_private_projects(self):
        self.project_id = self.add_new_project(self.member, public=False)

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertEquals(response.status_code, 200)

        self.assertTrue('private_project_count' in user_meta)
        self.assertTrue(user_meta['private_project_count'])

        msg = self.add_new_project(self.member, public=False, assert_status_code=400)

        self.assertTrue('error' in msg and 'code' in msg and msg['code'] == 'project_limit_reached')

    def test_public_project_featured_endpoint(self):
        second_project_id = self.add_new_project(self.member)

        first_project = Project.objects.get(pk=self.project_id)
        second_project = Project.objects.get(pk=second_project_id)

        second_project.featured = True
        second_project.featured_order = 1

        first_project.featured = True
        first_project.featured_order = 2

        first_project.save()
        second_project.save()

        response, msg = self.get_as(self.anonymous_member, '/public/project?featured=1')
        self.assertEquals(response.status_code, 200)

        self.assertEquals(msg[0]['id'], second_project.pk)
        self.assertEquals(msg[1]['id'], first_project.pk)

        # swapping order, changes endpoint result order
        first_project.featured_order, second_project.featured_order = second_project.featured_order, \
                                                                      first_project.featured_order
        first_project.save()
        second_project.save()

        response, msg = self.get_as(self.anonymous_member, '/public/project?featured=1')
        self.assertEquals(response.status_code, 200)

        self.assertEquals(msg[0]['id'], first_project.pk)
        self.assertEquals(msg[1]['id'], second_project.pk)

        # test limit
        response, msg = self.get_as(self.anonymous_member, '/public/project?featured=1&limit=1')
        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(msg), 1)

    def test_public_project(self):
        scene_ids = {}

        # add some scenes
        for i in range(0, 2):
            scene_ids[self.add_scene(self.member, project=self.project_id)] = 1

        # add some panels
        for scene_id in scene_ids:
            response, msg = self.add_panel(self.member, scene_id)
            self.assertEquals(response.status_code, 201)

        detail_url = '/{0}/{1}'.format(self.endpoint, self.project_id)

        response, msg = self.patch_as(self.member, detail_url, data={'public': True})

        self.assertEquals(response.status_code, 200)

        response, msg = self.get_as(self.anonymous_member, '/'.join(['/public/project', msg['short_uuid']]))

        self.assertEquals(response.status_code, 200)
