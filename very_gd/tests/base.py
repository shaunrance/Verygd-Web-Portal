from media_portal.tests.base.tests import TestAPIBase as Base
from very_gd.tests.strategies import TestStrategies
from users.tests import TestVeryGDUsers


class TestAPIBase(Base):
    def __init__(self, *args, **kwargs):
        super(TestAPIBase, self).__init__(*args, **kwargs)

        self.strategies = TestStrategies()
        self.users = TestVeryGDUsers()
