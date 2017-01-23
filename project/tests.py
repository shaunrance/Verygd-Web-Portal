# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.base import TestAPIBase
from users.models import Member


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

        self.users.setup_email_settings()

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

    def test_num_of_private_projects(self):
        self.project_id = self.add_new_project(self.member, public=False)

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertEquals(response.status_code, 200)

        self.assertTrue('private_project_count' in user_meta)
        self.assertTrue(user_meta['private_project_count'])

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
