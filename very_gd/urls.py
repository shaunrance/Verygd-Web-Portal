"""very.gd URL Configuration"""
from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from rest_framework import routers

from media_portal.aws_encoding.views import aws_encoder_job_updates
from media_portal.album.content.views import AlbumImagesViewSet, AlbumVideoViewSet
from media_portal.album.views import AlbumViewSet
from media_portal.payment.views import available_stripe_plans
from media_portal.policy.urls import urlpatterns as policy_urls
# from users.auth.views import VeryGDAuthToken
from media_portal.users.views import MembersViewSet, MemberCreateView

router = routers.DefaultRouter(trailing_slash=False)

router.register(r'users', MembersViewSet, base_name='users')

router.register(r'album', AlbumViewSet, base_name='album')
router.register(r'images', AlbumImagesViewSet, base_name='images')
router.register(r'videos', AlbumVideoViewSet, base_name='videos')


urlpatterns = router.urls

urlpatterns = [
    url(r'^plans/available/?$', available_stripe_plans, name='available_plans'),

    # TODO(andrew.silvernail): password reset link TBD
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/?$', lambda r: r,
        name='password_reset_confirm'),
    # TODO(andrew.silvernail): custom very gd auth token handling
    # url(r'^auth/token/?', VeryGDAuthToken.as_view()),
    url(r'^users/signup/?$', MemberCreateView.as_view({'post': 'create'}), name='member-create'),
    # TODO(andrew.silvernail): needs to reference media_portal admin site
    # url(r'^admin/?', admin_site.urls, name='admin'),
    url(r'^policy/?', include(policy_urls)),
    url(r'^aws_sns/?', aws_encoder_job_updates),

] + urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
