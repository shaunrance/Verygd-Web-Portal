from rest_framework import serializers
from social_core.exceptions import AuthAlreadyAssociated
from social_django.utils import load_backend, load_strategy


class SocialToSiteTokenSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=('facebook', 'google',), write_only=True, required=True)
    access_token = serializers.CharField(required=True, write_only=True)

    def validate_provider(self, value):
        if value == 'google':
            return 'google-oauth2'

        return value

    def validate(self, attrs):
        request = self.context['request']
        provider = attrs.pop('provider')
        access_token = attrs.pop('access_token')

        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name=provider, redirect_uri=None)

        attrs['user'] = backend.do_auth(access_token)

        return attrs
