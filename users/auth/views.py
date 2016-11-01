import hashlib
import hmac

from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import Response


class VeryGDAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        member = user.member

        token, created = Token.objects.get_or_create(user=user)

        intercom_token = hmac.new(settings.INTERCOM_SECURE_KEY.encode('utf8'),
                                  user.email.encode('utf8'),
                                  digestmod=hashlib.sha256).hexdigest()

        return Response({'token': token.key, 'member_id': member.id, 'intercom_token': intercom_token})

    def delete(self, request, *args, **kwargs):
        auth_user = None

        try:
            auth_user = TokenAuthentication().authenticate(request)
        except AuthenticationFailed:
            pass

        if not auth_user:
            return Response({'status': 'error', 'msg': 'Not logged in.'}, status=401)
        else:
            Token.objects.filter(pk=auth_user[1].pk).delete()

            return Response({'status': 'success', 'msg': 'Logged out.'}, status=204)
