from rest_framework import viewsets, mixins
from media_portal.album.views import AlbumViewSet as BaseViewSet
from project.models import Project
from project.serializers import ProjectSerializer
from project.permissions import ProjectPermissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Q

from very_gd.views import RequestSetup


class ProjectViewSet(viewsets.ModelViewSet, RequestSetup):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = BaseViewSet.authentication_classes
    permission_classes = (IsAuthenticated, ProjectPermissions, )
    pagination_class = BaseViewSet.pagination_class

    def filter_queryset(self, queryset):
        params = {}

        id = self.request.query_params.get('id', None)

        if id:
            params['pk'] = id

        queryset = self.model.objects.filter(**params)

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        password = request.query_params.get('password', None)
        valid_password = False

        if password:
            valid_password = instance.check_password(password)

        if instance.password and (not password or not valid_password):
            return Response('password-protected', status=403)
        else:
            return Response(serializer.data)

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
        return self.model.objects.filter(Q(public=True) | Q(password__isnull=False)).prefetch_related('scenes')


class PublicProjectsViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, RequestSetup):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = []
    permission_classes = []

    lookup_field = 'short_uuid'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        password = request.query_params.get('password', None)
        valid_password = False

        if password:
            valid_password = instance.check_password(password)

        if instance.password and (not password or not valid_password):
            return Response('password-protected', status=403)
        else:
            return Response(serializer.data)

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
        return self.model.objects.filter(Q(public=True)).prefetch_related('scenes')
