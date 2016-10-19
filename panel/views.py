from media_portal.album.content.views import AlbumImagesViewSet as PanelImageViewSet
from panel.models import PanelImage


PanelImageViewSet.model = PanelImage
