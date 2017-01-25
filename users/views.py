from media_portal.users.views import MembersViewSet, MemberCreateView as BaseMemberCreateView
from users.serializers import MemberSerializer, MemberCreateSerializer

MembersViewSet.serializer_class = MemberSerializer


class MemberCreateView(BaseMemberCreateView):
    serializer_class = MemberCreateSerializer
