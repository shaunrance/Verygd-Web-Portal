from media_portal.tests.base.tests import TestAPIBase as Base
from very_gd.tests.strategies import TestStrategies, alphabet, text, integers
from users.tests import TestUserAPI


class TestAPIBase(Base):
    def __init__(self, *args, **kwargs):
        super(TestAPIBase, self).__init__(*args, **kwargs)

        self.strategies = TestStrategies()
        self.users = TestUserAPI()

        self.scene_endpoint = 'scene'
        self.project_endpoint = 'project'
        self.panel_endpoint = 'panel'
        self.user_endpoint = 'users'

    def add_new_project(self, member, *args, assert_status_code=201, **kwargs):
        data = self.strategies.get_create_new_project_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.project_endpoint), data=data)

        self.assertEquals(response.status_code, assert_status_code)

        if assert_status_code == 201:
            return msg['id']
        else:
            return msg

    def delete_project(self, member, project_id):
        response = self.delete_as(member, '/{0}/{1}'.format(self.project_endpoint, project_id))

        return response

    def add_scene(self, member, *args, **kwargs):
        data = self.strategies.get_create_scene_strategy().example()
        data.update(kwargs)

        response, msg = self.post_as(member, '/{0}'.format(self.scene_endpoint), data=data)

        self.assertEquals(response.status_code, 201, 'expected 201 got {0} instead ({1})'.format(response.status_code,
                                                                                                 msg))

        return msg['id']

    def delete_scene(self, member, scene_id):
        response = self.delete_as(member, '/{0}/{1}'.format(self.scene_endpoint, scene_id))

        return response

    def add_panel(self, member, scene_id, title=text(alphabet=alphabet, min_size=9).example(),
                  desc=text(alphabet=alphabet, min_size=28, max_size=128).example(), name='test.png',
                  related_tag=text(alphabet=alphabet, min_size=5, max_size=10).example(),
                  order=integers(min_value=0, max_value=10).example(), test_image=None,
                  **kwargs):

        test_image = test_image or self.strategies.get_test_image(name)

        data = {
            'scene': scene_id,
            'title': title,
            'description': desc,
            'content': test_image,
            'related_tag': related_tag,
            'order': order
        }

        data.update(kwargs)

        response, msg = self.post_as(member, '/panel', data=data)

        return response, msg

    def delete_panel(self, member, panel_id):
        response = self.delete_as(member, '/panel/{0}'.format(panel_id))

        return response
