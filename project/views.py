from media_portal.album.views import AlbumViewSet as ProjectViewSet
from project.models import Project

ProjectViewSet.model = Project
