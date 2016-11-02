from media_portal.permissions import BasePermission
from media_portal.users.permissions import is_in_group, is_the_group_owner, is_a_group_owner


class ProjectPermissions(BasePermission):
    post = is_a_group_owner
    put = patch = is_the_group_owner
    get = is_in_group
    delete = is_the_group_owner
