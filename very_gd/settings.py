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

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', None)

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

MEDIA_PORTAL_SETTINGS = {
    'REQUEST_SETUP_VIEW': 'very_gd.views.RequestSetup'
}

AWS_ACCESS_KEY_ID = 'AKIAJWMHOK5Q43FJ6E4A'
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', None)
AWS_REGION = 'us-west-1'

AWS_STORAGE_BUCKET_NAME = 'core-api-bucket'
AWS_S3_FILE_OVERWRITE = False
AWS_VIDEO_PIPELINE_ID = '1473882498921-q1vh9h'

ADMINS = [('Andrew', 'andrew@useallfive.com')]
SERVER_EMAIL = 'andrew@useallfive.com'

ALLOWED_HOSTS = ['216.70.115.196', 'very.gd.ua5.land']

EMAIL_BACKEND = 'django_smtp_ssl.SSLEmailBackend'
EMAIL_HOST = 'email-smtp.us-west-2.amazonaws.com'
EMAIL_PORT = 465

EMAIL_HOST_USER = os.getenv('AWS_SES_USER', None)
EMAIL_HOST_PASSWORD = os.getenv('AWS_SES_PASSWORD', None)
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', None)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)

IMGIX_URL = 'https://verygd.imgix.net'

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
    'rest_framework',
    'rest_framework.authtoken',
    'taggit',
    'guardian',
    'media_portal.policy',
    'media_portal.payment',
    'media_portal.invite',
    'media_portal.users',
    'media_portal.album',
    'media_portal.aws_encoding',
)

# Project applications
INSTALLED_APPS += ()

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
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
    os.path.join(BASE_DIR, 'very_gd/static'),
)

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')
