# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import string

from hypothesis.extra import fakefactory as ff
from hypothesis.strategies import just, text, fixed_dictionaries
from media_portal.tests.base.strategies import MediaPortalTestStrategies

alphabet = list(string.ascii_lowercase)


class VeryGDTestStrategies(MediaPortalTestStrategies):
    def get_create_user_strategy(self):
        create_user_strategy = fixed_dictionaries({
            'url': just('/users/signup'),
            'method': just('post'),
            'params': fixed_dictionaries({
                'name': self.get_firstlast_name_strategy(),
                'email': ff.fake_factory(u'email', locale='en'),
                'password': text(alphabet=alphabet, min_size=7),
            })
        })

        return create_user_strategy
