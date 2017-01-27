from media_portal.album.content.views import ContentViewSet
from rest_framework import serializers

from panel.models import PanelImage
from panel.permissions import PanelPermissions
from panel.serializers import PanelImageSerializer
from rest_framework.permissions import IsAuthenticated

from very_gd.views import RequestSetup
from users.models import FileSizeQuotaReachedException


class PanelImageViewSet(ContentViewSet, RequestSetup):
    model = PanelImage
    permission_classes = (IsAuthenticated, PanelPermissions, )
    serializer_class = PanelImageSerializer

    def perform_create(self, serializer):
        try:
            return super(PanelImageViewSet, self).perform_create(serializer=serializer)
        except FileSizeQuotaReachedException as e:
            raise serializers.ValidationError({'filesize_quota_reached': str(e)})

    def get_queryset(self):
        return self.model.objects.filter()

