from rest_framework import serializers

from users.models import Member

from social_django.utils import load_backend, load_strategy
from social_core.exceptions import AuthAlreadyAssociated

from media_portal.users.serializers import MemberSerializer as BaseMemberSerializer
from media_portal.users.serializers import MemberCreateSerializer as BaseMemberCreateSerializer


class SocialMediaAuthSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=('facebook', 'google-oauth2', ), required=True)
    access_token = serializers.CharField(required=True)

    access_token_secret = serializers.CharField(required=False)

    def validate(self, attrs):
        request = self.context['request']
        provider = attrs.pop('provider')
        access_token = attrs.pop('access_token')

        strategy = load_strategy(request)
        backend = load_backend(strategy=strategy, name=provider, redirect_uri=None)

        try:
            attrs['user'] = backend.do_auth(access_token)
        except AuthAlreadyAssociated:
            raise serializers.ValidationError(
                {'error': 'This social media account is already associated with a user.'}
            )

        return attrs


class MemberSerializer(BaseMemberSerializer):
    private_project_count = serializers.IntegerField()
    content_bytes_left = serializers.IntegerField()


class MemberCreateSerializer(BaseMemberCreateSerializer):
    pass


class MemberSocialCreateSerializer(BaseMemberCreateSerializer):
    class Meta(MemberSerializer.Meta):
        model = Member
        exclude = MemberSerializer.Meta.exclude + ('invites', )

    social_media = SocialMediaAuthSerializer(required=False)

    def create(self, validated_data):
        if 'social_media' in validated_data and 'user' in validated_data['social_media']:
            social_media_auth = validated_data.pop('social_media')

            validated_data['user'] = social_media_auth['user']

            # dont need a name, email or password, since these are taken from the social auth
            validated_data.pop('name')
            validated_data.pop('email')
            validated_data.pop('password')

            member = super(MemberSocialCreateSerializer, self).create(validated_data)

            member.update_social_photo()

            return member
        else:
            return super(MemberSocialCreateSerializer, self).create(validated_data)
