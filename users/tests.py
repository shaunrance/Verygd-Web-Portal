# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.strategies import VeryGDTestStrategies
from media_portal.users.tests import TestUser as TestVeryGDUsers

TestVeryGDUsers.strategy = VeryGDTestStrategies
