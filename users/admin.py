from __future__ import unicode_literals

from django.contrib import admin

from media_portal.admin import admin_site, AdminHTMLEditor
from users.settings import UserSettings, UserSignUpEmail, UserPasswordResetEmail


class BaseUserAdmin(AdminHTMLEditor, admin.ModelAdmin):
    pass


@admin.register(UserSettings, site=admin_site)
class UserSettingsAdmin(BaseUserAdmin, admin.ModelAdmin):
    readonly_fields = ('updated_at', )


@admin.register(UserSignUpEmail, site=admin_site)
class UserSignUpSettingsAdmin(BaseUserAdmin, admin.ModelAdmin):
    pass


@admin.register(UserPasswordResetEmail, site=admin_site)
class UserResetPasswordSettingsAdmin(BaseUserAdmin, admin.ModelAdmin):
    pass
