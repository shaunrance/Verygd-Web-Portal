from project.models import Project
from rest_framework.authentication import BaseAuthentication
from django.contrib.auth.models import AnonymousUser
from rest_framework import exceptions
from django.utils.translation import ugettext_lazy as _


class PrivateProjectAuthentication(BaseAuthentication):
    def authenticate(self, request):
        if 'password' in request.query_params and request.method == 'GET' and 'Authorization' not in request.META:
            project = project_pk = None
            path_parts = request.path.split('/')[1:]

            if path_parts[0] == 'project':
                if isinstance(path_parts[1], int) and path_parts[1] > 0:
                    project_pk = path_parts[1]

            if project_pk and Project.objects.filter(pk=project_pk, password__isnull=False).count():
                project = Project.objects.get(pk=project_pk)

            if project:
                anonymous_user = AnonymousUser()
                return anonymous_user, None

            raise exceptions.AuthenticationFailed(_('not a valid project id.'))
        else:
            return None
