from django.apps import AppConfig

from apps import PrepClassesAppConfigMixin


class UsersAppConfig(PrepClassesAppConfigMixin, AppConfig):
    name = 'users'
