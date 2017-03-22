from __future__ import unicode_literals

from django.contrib import admin
from project.models import Project
from media_portal.admin import admin_site


@admin.register(Project, site=admin_site)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'short_link', 'public', 'first_image', 'featured', )

    def short_link(self, instance):
        return 'https://{site_url}/public/project/{short_uuid}'.format(
            site_url='api.very.gd',
            short_uuid=instance.short_uuid)

    def first_image(self, instance):
        first_image = next(instance.content)

        return '{first_image}'.format(first_image=first_image)
