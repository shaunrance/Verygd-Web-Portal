from rest_framework import viewsets, mixins
from media_portal.album.views import AlbumViewSet as BaseViewSet
from project.models import Project
from project.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = BaseViewSet.authentication_classes
    permission_classes = BaseViewSet.permission_classes
    pagination_class = BaseViewSet.pagination_class

    def get_queryset(self):
        params = {
            'owner': self.request.user.member.group_owner
        }

        id = self.request.query_params.get('id', None)

        if id:
            params['pk'] = id

        return self.model.objects.filter(**params).prefetch_related('scenes')


class PublicProjectViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    model = Project

    serializer_class = ProjectSerializer

    authentication_classes = []
    permission_classes = []

    def get_queryset(self):
        return self.model.objects.filter(public=True).prefetch_related('scenes')
