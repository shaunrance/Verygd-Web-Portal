from rest_framework import viewsets
from scene.models import Scene
from scene.serializers import SceneSerializer


class SceneViewSet(viewsets.ModelViewSet):
    model = Scene
    serializer_class = SceneSerializer

    def get_queryset(self):
        return Scene.objects.all()
