import rules

from media_portal.permissions import BasePermission, is_group_admin
from media_portal.users.permissions import allow_any


@rules.predicate
def is_content_owner(request, obj):
    return True if obj.owner == request.member else False


class ScenePermissions(BasePermission):
    post = allow_any
    put = patch = is_content_owner
    get = is_content_owner
    delete = is_content_owner | is_group_admin
