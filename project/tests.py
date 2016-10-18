# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.base import TestAPIBase


class TestProject(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestProject, self).__init__(*args, **kwargs)

        self.endpoint = 'project'
        self.project_id = None
        self.member = None

    def setUp(self):
        super(TestProject, self).setUp()

        self.member = self.users.new_user()
        self.project_id = self.add_new_project(self.member)

    def add_new_project(self, member, *args, **kwargs):
        data = self.strategies.get_create_new_project_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.endpoint), data=data)

        self.assertEquals(response.status_code, 201)

        return msg['id']

    def test_add_project(self):
        pass

