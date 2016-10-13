from rest_framework import serializers
from project.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ('owner', )

    def create(self, validated_data):
        # the owner param is implicit
        validated_data['owner'] = self.context['request'].user.member

        project = Project.objects.create(**validated_data)
        project.save()

        return project
