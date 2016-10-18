from media_portal.album.content.views import AlbumImagesViewSet as PanelViewSet
from panel.models import Panel


PanelViewSet.model = Panel
