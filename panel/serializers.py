from rest_framework import serializers
from media_portal.album.content.serializers.base import ContentSerializer
from panel.models import PanelImage
from PIL import Image
from django.conf import settings


class PanelSerializer(ContentSerializer):
    related_tag = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    order = serializers.IntegerField(required=False)

    def validate(self, data):
        self.reached_scene_size_limit(data['scene'], data['content'])
        return data

    def create(self, validated_data):
        instance = super(PanelSerializer, self).create(validated_data)

        instance.scene.size += instance.content.size
        instance.scene.save()

        return instance

    def reached_scene_size_limit(self, scene, file):
        if scene.size + file.size > settings.SCENE_SIZE_LIMIT_BYTES:
            raise serializers.ValidationError('file too large.  max scene size reached ({0})'.format(
                settings.SCENE_SIZE_LIMIT_BYTES))


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
