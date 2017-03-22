from __future__ import unicode_literals

from django.contrib import admin

from project.models import Project
from media_portal.admin import admin_site


@admin.register(Project, site=admin_site)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'featured', 'featured_order', 'owner', 'public_url', 'creation_date', 'first_image', )
    list_filter = ('featured', )
    list_editable = ('featured', 'featured_order', )

    ordering = ('featured_order', '-created_dt', )

    def get_queryset(self, request):
        queryset = super(ProjectAdmin, self).get_queryset(request)

        queryset = queryset.exclude(public=False)

        return queryset

    def creation_date(self, instance):
        return instance.created_dt

    creation_date.short_description = 'Created'

    def order(self, instance):
        return instance.featured_order

    order.short_descripton = 'Order'

    def public_url(self, instance):
        return '<a href="https://{site_url}/p/{short_uuid}">Go</a>'.format(
            site_url='app.very.gd',
            short_uuid=instance.short_uuid)

    public_url.allow_tags = True

    def first_image(self, instance):
        first_scene = next(instance.content)
        first_image = next(first_scene.content)

        return '<img src="{first_image}?w=256&h=128&fit=crop">'.format(first_image=first_image.content_url)

    first_image.allow_tags = True
    first_image.short_description = 'First image of first scene'
