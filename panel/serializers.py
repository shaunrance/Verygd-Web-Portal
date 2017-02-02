from rest_framework import serializers
from media_portal.album.content.serializers.base import ContentSerializer
from panel.models import PanelImage
from PIL import Image


class SequenceSerializer(serializers.Serializer):
    files = serializers.ListSerializer(required=True)
    speed = serializers.IntegerField(required=True)
    loop = serializers.NullBooleanField(required=True)


class PanelSerializer(ContentSerializer):
    related_tag = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    order = serializers.IntegerField(required=False)

    hotspots = serializers.JSONField(required=False)
    sequence = SequenceSerializer(required=False)


class PanelImageSerializer(PanelSerializer):
    class Meta:
        model = PanelImage
        exclude = ('owner', )

    def validate_content(self, value):
        try:
            im = Image.open(value)
            return value
        except IOError:
            raise serializers.ValidationError('{0} is not a valid file ({1}).'.format(value.name, value.content_type))
