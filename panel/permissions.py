from media_portal.permissions import BasePermission, is_group_admin
from media_portal.users.permissions import allow_any
from very_gd.permissions import is_content_owner


class PanelPermissions(BasePermission):
    post = allow_any
    put = patch = is_content_owner
    get = is_content_owner
    delete = is_content_owner | is_group_admin
