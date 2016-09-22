from __future__ import unicode_literals

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView


class RequestSetup(APIView):
    def initialize_request(self, request, *args, **kwargs):
        request = super(RequestSetup, self).initialize_request(request, *args, **kwargs)

        request.member = None
        is_authed = False

        try:
            is_authed = request.user.is_authenticated()
        except AuthenticationFailed:
            pass

        # convenience attribute for specific user type in the request
        if is_authed and hasattr(request.user, str('member')):
            request.member = request.user.member

        return request
