from media_portal.album.content.views import ContentViewSet

from panel.models import PanelImage
from panel.permissions import PanelPermissions
from panel.serializers import PanelImageSerializer
from rest_framework.permissions import IsAuthenticated

from very_gd.views import RequestSetup


class PanelImageViewSet(ContentViewSet, RequestSetup):
    model = PanelImage
    permission_classes = (IsAuthenticated, PanelPermissions, )
    serializer_class = PanelImageSerializer

    def get_queryset(self):
        return self.model.objects.filter()

