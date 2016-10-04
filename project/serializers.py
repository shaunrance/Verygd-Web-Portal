from media_portal.album.serializers.base import AlbumBaseSerializer


class ProjectSerializer(AlbumBaseSerializer):
    def to_representation(self, instance):
        data = super(ProjectSerializer, self).to_representation(instance)

        data['background-color'] = data.pop('background_color')
        return data
