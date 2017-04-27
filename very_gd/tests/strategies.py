# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import string

from hypothesis.extra import fakefactory as ff
from hypothesis.strategies import just, text, fixed_dictionaries, one_of, integers
from media_portal.tests.base.strategies import MediaPortalTestStrategies

alphabet = list(string.ascii_lowercase)


class TestStrategies(MediaPortalTestStrategies):
    def get_create_user_strategy(self):
        return fixed_dictionaries({
            'url': just('/users/signup'),
            'method': just('post'),
            'params': fixed_dictionaries({
                'name': self.get_firstlast_name_strategy(),
                'email': ff.fake_factory(u'email', locale='en'),
                'password': text(alphabet=alphabet, min_size=7),
            })
        })

    def get_create_scene_strategy(self):
        return fixed_dictionaries({
            'title': text(alphabet=alphabet, max_size=10, min_size=5),
            'description': text(alphabet=alphabet, max_size=10, min_size=5)
        })

    def get_create_new_project_strategy(self):
        return fixed_dictionaries({
            'name': text(alphabet=alphabet, min_size=7, max_size=32),
            'title': text(alphabet=alphabet, max_size=10, min_size=5),
            'description': text(alphabet=alphabet, max_size=10, min_size=5),
            'background_color': one_of([just('fuchsia'), just('salmon')])
        })
