from rest_framework import serializers

from users.models import Member

from social_django.utils import load_backend, load_strategy
from social_core.backends.oauth import BaseOAuth1, BaseOAuth2
from social_core.exceptions import AuthAlreadyAssociated

from media_portal.users.serializers import MemberSerializer as BaseMemberSerializer
from media_portal.users.serializers import MemberCreateSerializer as BaseMemberCreateSerializer


class SocialMediaAuthSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=('twitter', 'facebook', 'google-oauth2', ), required=True)
    access_token = serializers.CharField(required=True)

    access_token_secret = serializers.CharField(required=False)

    def validate(self, attrs):
        request = self.context['request']
        provider = attrs.pop('provider')
        access_token = attrs.pop('access_token')

        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name=provider, redirect_uri=None)

        token = {}

        if isinstance(backend, BaseOAuth1):
            token = {
                'oauth_token': access_token,
                'oauth_token_secret': attrs['access_token_secret'],
            }
        elif isinstance(backend, BaseOAuth2):
            token = access_token

        try:
            attrs['user'] = backend.do_auth(token)
        except AuthAlreadyAssociated:
            raise serializers.ValidationError(
                {'error': 'This social media account is already associated with a user.'}
            )

        return attrs


class MemberSerializer(BaseMemberSerializer):
    private_project_count = serializers.IntegerField()
    content_bytes_left = serializers.IntegerField()


class MemberCreateSerializer(BaseMemberCreateSerializer):
    class Meta(MemberSerializer.Meta):
        model = Member
        exclude = MemberSerializer.Meta.exclude + ('invites', )

    social_media = SocialMediaAuthSerializer(required=False)

    def create(self, validated_data):
        if 'social_media' in validated_data:
            social_media_auth = validated_data.pop('social_media')

            if 'user' in social_media_auth:
                validated_data['user'] = social_media_auth['user']

                # dont need a name, email or password
                validated_data.pop('name')
                validated_data.pop('email')
                validated_data.pop('password')

        return super(MemberCreateSerializer, self).create(validated_data)
