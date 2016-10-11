# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.strategies import VeryGDTestStrategies
from media_portal.users.tests import TestUser as TestVeryGDUsers

TestVeryGDUsers.strategy = VeryGDTestStrategies


class TestUserAPI(TestVeryGDUsers):
    def __init__(self, *args, **kwargs):
        self.member = None
        self.second_member = None

        super(TestUserAPI, self).__init__(*args, **kwargs)

    def setUp(self):
        self.member = self.new_user()

    def test_signed_in(self):
        self.assertTrue('logged_in' in self.member and self.member['logged_in'])
