from rest_framework import serializers
from media_portal.album.content.serializers.base import ContentSerializer


class PanelSerializer(ContentSerializer):
    tag = serializers.CharField()
    related_tag = serializers.CharField(required=False)
    order = serializers.IntegerField(required=False)

    def create(self, validated_data):
        instance = super(PanelSerializer, self).create(validated_data)
        return instance
