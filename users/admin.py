from __future__ import unicode_literals

from decimal import Decimal
from django.contrib import admin
from django.forms import ModelForm

from media_portal.admin import admin_site, AdminHTMLEditor
from users.settings import UserSettings, UserSignUpEmail, UserPasswordResetEmail, UserFileSizeQuota
from users.models import Member
from django.utils.safestring import mark_safe


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


@admin.register(Member, site=admin_site)
class MemberAdmin(admin.ModelAdmin):
    actions = ('delete_members', )
    list_display = ('name', 'signed_up_via_social_auth', )
    readonly_fields = ('payment', 'group', 'user', 'total_content_bytes', 'signed_up_via_social_auth', )

    def get_actions(self, request):
        actions = super(MemberAdmin, self).get_actions(request)

        # remove default delete_selected
        if 'delete_selected' in actions:
            del actions['delete_selected']

        return actions

    def signed_up_via_social_auth(self, instance):
        return 'Yes' if hasattr(instance.user, 'social_user') and instance.user.social_user else ''

    def delete_members(self, request, queryset):
        for member in queryset.all():
            member_user = member.user
            member_group = member.media_group

            member.delete()
            member_user.delete()

            if member_group.user_set.count() <= 1:
                member_group.delete()

    def group(self, instance):
        return mark_safe('<span>{group}</span>'.format(group=instance.media_group))

    delete_members.short_description = 'Delete the selected members.'


class QuotaForm(ModelForm):
    class Meta:
        model = UserFileSizeQuota
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        """Initialize file size quota form with friendlier values"""
        if 'instance' in kwargs:
            initial = {}

            for byte_setting in self.base_fields.keys():
                initial[byte_setting] = '{:.0e}'.format(getattr(kwargs['instance'], byte_setting))

            kwargs['initial'] = initial

        super(QuotaForm, self).__init__(*args, **kwargs)

    def clean(self):
        """Converts file size quota form input values with friendlier values"""

        cleaned_data = self.data

        for byte_setting in self.changed_data:
            cleaned_data[byte_setting] = int(Decimal(cleaned_data[byte_setting]))

        # clear errors
        for byte_setting in ('basic_quota_bytes', 'premium_quota_bytes', ):
            if byte_setting in self.errors:
                del self.errors[byte_setting]

        return cleaned_data


@admin.register(UserFileSizeQuota, site=admin_site)
class UserFilesizeQuotaAdmin(BaseUserAdmin, admin.ModelAdmin):
    form = QuotaForm
