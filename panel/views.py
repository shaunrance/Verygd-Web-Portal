from media_portal.album.content.views import AlbumImagesViewSet as PanelImageViewSet
from panel.models import PanelImage
from panel.permissions import PanelPermissions

PanelImageViewSet.model = PanelImage


def get_queryset(self):
    request_member = self.request.user.member

    return self.model.objects.filter()


PanelImageViewSet.get_queryset = get_queryset
PanelImageViewSet.permission_classes = (PanelPermissions, )
