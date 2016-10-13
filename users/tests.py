# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.strategies import TestStrategies
from media_portal.users.tests import TestUserAPI as TestUserAPIBase

TestUserAPIBase.strategy = TestStrategies


class TestUserAPI(TestUserAPIBase):
    def __init__(self, *args, **kwargs):
        self.member = None
        self.second_member = None

        super(TestUserAPI, self).__init__(*args, **kwargs)

    def test_signed_up_in(self):
        self.assertTrue('logged_in' in self.member and self.member['logged_in'])

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertEquals(response.status_code, 200)

        self.assertTrue('payment' in user_meta and not user_meta['payment'])

    def test_update_member(self):
        super(TestUserAPI, self).test_update_member()
