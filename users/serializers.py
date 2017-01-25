from rest_framework import serializers

from media_portal.users.serializers import MemberSerializer as BaseMemberSerializer
from media_portal.users.serializers import MemberCreateSerializer as BaseMemberCreateSerializer


class MemberSerializer(BaseMemberSerializer):
    private_project_count = serializers.IntegerField()
    content_bytes_left = serializers.IntegerField()


class MemberCreateSerializer(BaseMemberCreateSerializer):
    pass
