from rest_framework import serializers
from media_portal.album.content.serializers.base import ContentSerializer


class PanelSerializer(ContentSerializer):
    related_tag = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    order = serializers.IntegerField(required=False)

    def create(self, validated_data):
        instance = super(PanelSerializer, self).create(validated_data)
        return instance


class PanelImageSerializer(PanelSerializer):
    pass
