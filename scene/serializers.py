from scene.models import Scene
from rest_framework import serializers


class SceneSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)

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

        return model_dict

