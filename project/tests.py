# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.base import TestAPIBase


class TestProject(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestProject, self).__init__(*args, **kwargs)

        self.endpoint = 'project'
        self.project_id = None
        self.member = None
        self.anonymous_member = None

    def setUp(self):
        super(TestProject, self).setUp()

        self.member = self.users.new_user()
        self.anonymous_member = self.users.new_anonymous_user()
        self.project_id = self.add_new_project(self.member)

    def test_add_project(self):
        detail_url = '/{0}/{1}'.format(self.endpoint, self.project_id)

        response, msg = self.get_as(self.member, detail_url)

        self.assertEquals(response.status_code, 200)
        self.assertTrue('content' in msg and len(msg['content']) == 0)

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

        response, msg = self.get_as(self.anonymous_member, ''.join(['/public', detail_url]))

        self.assertEquals(response.status_code, 200)
