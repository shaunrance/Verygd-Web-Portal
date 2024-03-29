from very_gd.tests.strategies import integers

from very_gd.tests.base import TestAPIBase
from project.tests import TestProject


class TestPanel(TestAPIBase):
    def __init__(self, *args, **kwargs):
        super(TestPanel, self).__init__(*args, **kwargs)

        self.project = TestProject()
        self.endpoint = 'panel'

        self.scene_id = None
        self.member = None
        self.project_id = None
        self.panel_id = None

    def setUp(self):
        super(TestPanel, self).setUp()

        self.users.setup_user_settings()

        self.member = self.users.new_user()

        self.project_id = self.project.add_new_project(self.member)
        self.scene_id = self.add_scene(self.member, project=self.project_id)
        self.panel_id = self.add_panel(self.member, self.scene_id)[1]['id']

    def test_scene_order(self):
        scene_two = self.add_scene(self.member, project=self.project_id)
        scene_three = self.add_scene(self.member, project=self.project_id)

        # order should 2, 3
        response, scene_two_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, scene_two))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 scene_two_meta))

        response, scene_three_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, scene_three))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 scene_three_meta))

        self.assertEquals(scene_two_meta['order'], 2)
        self.assertEquals(scene_three_meta['order'], 3)

        # test adding scene with non-contiguous order number
        scene_four = self.add_scene(self.member, project=self.project_id, order=998)

        response, scene_four_meta = self.get_as(self.member, '/{0}/{1}'.format(self.scene_endpoint, scene_four))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 scene_four_meta))

        self.assertEquals(scene_four_meta['order'], 998)

    def test_scene_hotspots(self):
        hotspots = [{
                'x': integers(min_value=0, max_value=10).example(),
                'y': integers(min_value=0, max_value=10).example(),
                'width': integers(min_value=0, max_value=100).example(),
                'height': integers(min_value=0, max_value=100).example(),
                'linked_scene_id': self.scene_id,
                'linked_url': 'http://testserver.com'
            },
            {
                'x': integers(min_value=0, max_value=10).example(),
                'y': integers(min_value=0, max_value=10).example(),
                'width': integers(min_value=0, max_value=100).example(),
                'height': integers(min_value=0, max_value=100).example(),
                'linked_scene_id': self.scene_id,
                'linked_url': 'http://testserver.com/foo'
            }
        ]

        self.put_as(self.member, '/{0}/{1}'.format(self.panel_endpoint, self.panel_id),
                    {'hotspots': hotspots, 'hotspot_type': 'vanilla'}, format='json')

        response, msg = self.get_as(self.member, '/{0}/{1}'.format(self.panel_endpoint, self.panel_id))

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 msg))

        self.assertTrue('hotspots' in msg)

        self.assertEquals(msg['hotspots'], hotspots)

        self.assertEquals(msg['hotspot_type'], 'vanilla')
