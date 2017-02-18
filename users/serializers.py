from requests.exceptions import HTTPError
from rest_framework import serializers

from users.models import Member

from social_django.utils import load_backend, load_strategy
from social_core.exceptions import AuthAlreadyAssociated

from media_portal.users.serializers import MemberSerializer as BaseMemberSerializer
from media_portal.users.serializers import MemberCreateSerializer as BaseMemberCreateSerializer


class MemberSerializer(BaseMemberSerializer):
    private_project_count = serializers.IntegerField()
    content_bytes_left = serializers.IntegerField()


class MemberCreateSerializer(BaseMemberCreateSerializer):
    pass


class MemberSocialCreateSerializer(BaseMemberCreateSerializer):
    class Meta(MemberSerializer.Meta):
        model = Member
        exclude = MemberSerializer.Meta.exclude + ('invites', 'name', 'email', 'password', )

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

        try:
            attrs['user'] = backend.do_auth(access_token)
        except AuthAlreadyAssociated:
            raise serializers.ValidationError(
                {'error': 'This social media account is already associated with a user.'}
            )
        except HTTPError:
            raise serializers.ValidationError(
                {'error': 'Something went wrong authenticating your request.'}
            )

        if hasattr(attrs['user'], 'member') and attrs['user'].member:
            raise serializers.ValidationError(
                {'error': 'This social media account is already associated with a user.'}
            )

        return attrs

    def create(self, validated_data):
        member = super(MemberSocialCreateSerializer, self).create(validated_data)

        member.update_social_photo()

        return member
