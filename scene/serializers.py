from scene.models import Scene
from rest_framework import serializers


class SceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scene

    def to_representation(self, instance):
        model_dict = super(SceneSerializer, self).to_representation(instance)

        model_dict['content'] = []

        for content in instance.content:
            content_serializer = content.serializer(content, context=self.context)

            content_metadatum = content_serializer.data

            content_metadatum['resource'] = content.resource_url
            content_metadatum['type'] = content.type

            model_dict['content'].append(content_metadatum)

        return model_dict

