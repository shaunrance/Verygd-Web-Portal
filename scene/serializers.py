from scene.models import Scene
from rest_framework import serializers

from django.conf import settings


class FileField(serializers.FileField):
    def to_internal_value(self, data):
        if self.allow_null and data == 'null':
            return None
        else:
            return super(FileField, self).to_internal_value(data)


class SceneSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)
    equirectangular_background_image = FileField(allow_null=True, required=False)

    class Meta:
        model = Scene
        fields = '__all__'

    def to_representation(self, instance):
        model_dict = super(SceneSerializer, self).to_representation(instance)

        model_dict['content'] = []

        for content in instance.content:
            content_serializer = content.serializer(content, context=self.context)

            content_metadatum = content_serializer.data

            model_dict['content'].append(content_metadatum)

        if instance.equirectangular_background_image:
            _, background_image_name = instance.equirectangular_background_image.name.split('/')

            model_dict['equirectangular_background_image'] = '/'.join([
                settings.MEDIA_PORTAL_SETTINGS['IMGIX_URL'],
                background_image_name
            ])

        return model_dict
