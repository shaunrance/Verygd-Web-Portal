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

    def setUp(self):
        super(TestPanel, self).setUp()

        self.member = self.users.new_user()
        self.project_id = self.project.add_new_project(self.member)
        self.scene_id = self.add_scene(self.member, project=self.project_id)

    def test_scene_hotspots(self):
        pass
