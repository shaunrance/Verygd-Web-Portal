import rules


@rules.predicate
def is_content_owner(request, obj):
    return True if obj.owner == request.member else False
