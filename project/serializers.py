from rest_framework import serializers
from project.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ('owner', )

    def to_representation(self, instance):
        model_dict = super(ProjectSerializer, self).to_representation(instance)
        model_dict['content'] = []

        model_dict['created_by'] = {
            'id': instance.owner.pk,
            'name': str(instance.owner)
        }

        for content in instance.content:
            content_serializer = content.serializer(content, context=self.context)

            content_metadatum = content_serializer.data

            model_dict['content'].append(content_metadatum)

        return model_dict

    def create(self, validated_data):
        # the owner param is implicit
        validated_data['owner'] = self.context['request'].user.member

        project = validated_data['owner'].create_project(Project, **validated_data)

        return project
