from rest_framework import viewsets, mixins
from media_portal.album.views import AlbumViewSet as BaseViewSet
from project.models import Project
from project.serializers import ProjectSerializer
from project.permissions import ProjectPermissions
from project.auth import PrivateProjectAuthentication
from very_gd.views import RequestSetup


class ProjectViewSet(viewsets.ModelViewSet, RequestSetup):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = (PrivateProjectAuthentication, ) + BaseViewSet.authentication_classes
    permission_classes = (ProjectPermissions, )
    pagination_class = BaseViewSet.pagination_class

    def filter_queryset(self, queryset):
        params = {}

        id = self.request.query_params.get('id', None)
        password = self.request.query_params.get('password', None)

        if id:
            params['pk'] = id

        queryset = self.model.objects.filter(**params)

        if password:
            queryset = queryset.filter(password__isnull=False)

        if hasattr(self.request.user, 'member'):
            queryset = queryset.filter(owner=self.request.user.member.group_owner)

        return queryset

    def get_queryset(self):
        return self.model.objects.prefetch_related('scenes')


class PublicProjectViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, RequestSetup):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = []
    permission_classes = []

    lookup_field = 'short_uuid'

    def filter_queryset(self, queryset):
        params = {}
        order_by = ('-created_dt', )
        limit = self.request.query_params.get('limit', None)

        if self.request.query_params.get('featured', False):
            params['featured'] = True
            order_by = ('featured_order', ) + order_by

        queryset = queryset.filter(**params).order_by(*order_by)

        if limit:
            try:
                limit = int(limit)

                if limit > 0:
                    return queryset[0:limit]
            except ValueError:
                pass

        return queryset

    def get_queryset(self):
        return self.model.objects.filter(public=True).prefetch_related('scenes')
