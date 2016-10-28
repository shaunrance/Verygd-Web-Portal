from media_portal.tests.base.tests import TestAPIBase as Base
from very_gd.tests.strategies import TestStrategies
from users.tests import TestUserAPI


class TestAPIBase(Base):
    def __init__(self, *args, **kwargs):
        super(TestAPIBase, self).__init__(*args, **kwargs)

        self.strategies = TestStrategies()
        self.users = TestUserAPI()

        self.scene_endpoint = 'scene'
        self.project_endpoint = 'project'

    def add_new_project(self, member, *args, **kwargs):
        data = self.strategies.get_create_new_project_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.project_endpoint), data=data)

        self.assertEquals(response.status_code, 201)

        return msg['id']

    def add_scene(self, member, *args, **kwargs):
        data = self.strategies.get_create_scene_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.scene_endpoint), data=data)

        self.assertEquals(response.status_code, 201)

        return msg['id']
