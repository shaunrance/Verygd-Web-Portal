from rest_framework import viewsets
from scene.models import Scene
from scene.serializers import SceneSerializer
from very_gd.views import RequestSetup


class SceneViewSet(viewsets.ModelViewSet, RequestSetup):
    model = Scene
    serializer_class = SceneSerializer

    def get_queryset(self):
        return Scene.objects.all()
