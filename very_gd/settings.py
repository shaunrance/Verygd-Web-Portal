"""
Django settings for very_gd project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', None)

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

SITE_ID = 1
SITE_EMAIL_FROM_ADDRESS = 'noreply@very.gd'

if os.getenv('DEV_ENV', None):
    DEBUG = True

REST_FRAMEWORK_DOCS = {
    'HIDE_DOCS': not DEBUG
}

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}

CORS_ORIGIN_ALLOW_ALL = True

SOCIAL_AUTH_FACEBOOK_KEY = os.getenv('SOCIAL_AUTH_FACEBOOK_KEY', None)
SOCIAL_AUTH_FACEBOOK_SECRET = os.getenv('SOCIAL_AUTH_FACEBOOK_SECRET', None)

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', None)
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', None)

MEDIA_PORTAL_SETTINGS = {
    'REQUEST_SETUP_VIEW': 'very_gd.views.RequestSetup',

    'CONTENT_SERIALIZER': 'panel.serializers.PanelSerializer',
    'ALBUM_SERIALIZER': 'project.serializers.ProjectSerializer',

    'IMGIX_URL': 'https://verygd.imgix.net',

    'ALBUM': 'scene.models.Scene',

    'ALBUM_IMAGE': 'panel.models.PanelImage',
    'ALBUM_VIDEO': 'panel.models.PanelVideo',

    'MEDIA_MEMBER': 'users.models.Member',

    'TEST_STRATEGIES': 'very_gd.tests.strategies.TestStrategies'
}

AWS_ACCESS_KEY_ID = 'AKIAJWMHOK5Q43FJ6E4A'
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', None)
AWS_REGION = 'us-west-1'

AWS_STORAGE_BUCKET_NAME = 'core-api-bucket'
AWS_S3_FILE_OVERWRITE = False
AWS_VIDEO_PIPELINE_ID = '1473882498921-q1vh9h'

ADMINS = [('Andrew', 'andrew@useallfive.com')]
SERVER_EMAIL = 'andrew@useallfive.com'

ALLOWED_HOSTS = ['52.53.186.20', 'ec2-52-53-186-20.us-west-1.compute.amazonaws.com', 'api.very.gd']

EMAIL_BACKEND = 'sgbackend.SendGridBackend'

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', None)

STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', None)

INTERCOM_SECURE_KEY = os.getenv('INTERCOM_SECURE_KEY', None)
INTERCOM_APP_NAME = os.getenv('INTERCOM_APP_NAME', None)
INTERCOM_APP_ID = os.getenv('INTERCOM_APP_ID', None)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
    'social_core.backends.google.GoogleOpenId',
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.google.GoogleOAuth',
    'social_core.backends.twitter.TwitterOAuth',
    'social_core.backends.facebook.FacebookOAuth2'
)

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
)


# Third-party applications
INSTALLED_APPS += (
    'actstream',
    'social_django',
    'rest_framework',
    'rest_framework.authtoken',
    'guardian',
    'media_portal.policy',
    'media_portal.payment',
    'media_portal.invite',
    'media_portal.users',
    'media_portal.album',
    'media_portal.aws_encoding',
)

# Project applications
INSTALLED_APPS += (
    'project',
    'panel',
    'scene',
    'rest_framework_docs',
    'storages',
    'users',
    'group',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'very_gd.urls'

WSGI_APPLICATION = 'very_gd.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'debug': DEBUG
        },
    },
]

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/


STATICFILES_DIRS = (
    # os.path.join(BASE_DIR, 'very_gd/static'),
)

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'very_gd/static/')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')
