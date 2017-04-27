from rest_framework import viewsets
from scene.models import Scene
from scene.serializers import SceneSerializer
from very_gd.views import RequestSetup
from rest_framework.permissions import IsAuthenticated
from scene.permissions import ScenePermissions
from rest_framework.authentication import TokenAuthentication


class SceneViewSet(viewsets.ModelViewSet, RequestSetup):
    model = Scene
    serializer_class = SceneSerializer
    permission_classes = (IsAuthenticated, ScenePermissions, )
    authentication_classes = (TokenAuthentication,)

    def get_queryset(self):
        return Scene.objects.all()
