from rest_framework import serializers
from media_portal.album.content.serializers import ContentSerializer


class PanelSerializer(ContentSerializer):
    tag = serializers.CharField()

    def create(self, validated_data):
        tag = validated_data.pop('tag')

        instance = super(PanelSerializer, self).create(validated_data)
        instance.tags.add(tag)

        return instance
