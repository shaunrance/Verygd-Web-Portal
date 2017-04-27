from django.apps import AppConfig
from media_portal.apps import PrepClassesAppConfigMixin


class UsersAppConfig(PrepClassesAppConfigMixin, AppConfig):
    name = 'users'
