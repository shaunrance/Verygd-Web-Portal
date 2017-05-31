import rules

from media_portal.permissions import BasePermission
from media_portal.users.permissions import is_in_group, is_the_group_owner, is_a_group_owner

from rest_framework.compat import is_authenticated as is_authenticated_drf


@rules.predicate
def is_authenticated(request):
    return is_authenticated_drf(request.user)


@rules.predicate
def has_password(request, obj):
    return 'password' in request.query_params


@rules.predicate
def has_valid_password(request, obj):
    return obj.check_password(request.query_params.get('password'))


class ProjectPermissions(BasePermission):
    post = is_authenticated & is_a_group_owner
    put = patch = is_authenticated & is_the_group_owner
    get = (is_authenticated & is_in_group) | (has_password & has_valid_password)
    delete = is_authenticated & is_the_group_owner
