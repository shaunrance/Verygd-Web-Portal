from media_portal.users.views import MembersViewSet
from users.serializers import MemberSerializer

MembersViewSet.serializer_class = MemberSerializer
