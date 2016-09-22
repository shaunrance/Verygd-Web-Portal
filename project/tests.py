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
