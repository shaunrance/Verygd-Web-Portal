from rest_framework import serializers

from media_portal.users.serializers import MemberSerializer as BaseMemberSerializer


class MemberSerializer(BaseMemberSerializer):
    private_project_count = serializers.IntegerField()
