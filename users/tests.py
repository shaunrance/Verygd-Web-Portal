# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import hypothesis.extra.fakefactory as ff

from very_gd.tests.strategies import TestStrategies
from users.models import Member
from media_portal.users.tests import TestUserAPI as TestUserAPIBase
from media_portal.users.tests import TestLogInOutAPI, TestSignUp
from users.settings import UserPasswordResetEmail, UserSignUpEmail, UserSettings, UserFileSizeQuota

from django.contrib.auth import get_user_model


TestUserAPIBase.strategy = TestStrategies


class TestUserAPI(TestUserAPIBase):
    def __init__(self, *args, **kwargs):
        self.member = None
        self.second_member = None

        self.settings = None

        super(TestUserAPI, self).__init__(*args, **kwargs)

    def setUp(self):
        super(TestUserAPI, self).setUp()

        self.settings = self.setup_user_settings()

    def setup_user_settings(self):
        reset_email_settings = UserPasswordResetEmail()
        signup_email_settings = UserSignUpEmail()
        filesize_quotas = UserFileSizeQuota()

        reset_email_settings.plaintext_template = reset_email_settings.html_template = """
            Hi {{ username }},

            Forgot your very.gd password? Simply click {{ reset_password_link }} to reset it.

            Best,
            The Very Good Team

            This is a transactional email related to your account at very.gd.
            If you have questions about your account, please send them to support@very.gd.

            Copyright © 2016 very.gd
        """

        reset_email_settings.save()
        signup_email_settings.save()
        filesize_quotas.save()

        user_settings = UserSettings(reset_password_email=reset_email_settings,
                                     signup_email=signup_email_settings, quotas=filesize_quotas)

        user_settings.save()

        self.settings = user_settings

        return user_settings

    def test_signed_up_in(self):
        self.assertTrue('logged_in' in self.member and self.member['logged_in'])

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertEquals(response.status_code, 200)

        self.assertTrue('payment' in user_meta and not user_meta['payment'])

    def test_update_password(self):
        response, msg = self.put_as(self.member, '/users/{0}'.format(self.member['id']), data={
            'password': 'a_new_password'
        }, content_type='application/json')

        self.assertEquals(response.status_code, 200)

        self.logout(self.member)

        self.login(self.member['post_params']['email'], 'a_new_password', self.client_class())

    def test_payment_info(self):
        # test adds payment info
        super(TestUserAPI, self).test_payment_update()

        response, msg = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertTrue(response.status_code == 200, 'expected 200 got {0} ({1})'.format(response.status_code, msg))

        self.assertTrue('next_billing_date' in msg['payment'] and msg['payment']['next_billing_date'])

    def test_update_member(self):
        response, msg = self.get_as(self.member, '/users/{0}'.format(self.member['id']))

        prev_user_info = msg

        self.assertTrue(response.status_code == 200, 'expected 200 got {0} ({1})'.format(response.status_code, msg))

        # trying an existing email should fail
        response, msg = self.put_as(self.member, '/users/{0}'.format(self.member['id']),
                                    data=json.dumps({'email': self.second_member['post_params']['email']}),
                                    content_type='application/json')

        self.assertTrue(response.status_code == 400)
        self.assertTrue('email' in msg and msg['email'] == [u'This e-mail already exists.'])

        def unique_email():
            email = ff.fake_factory(u'email', locale='en').example()

            while get_user_model().objects.filter(email=email).count():
                email = ff.fake_factory(u'email', locale='en').example()

            return email

        response, msg = self.put_as(self.member, '/users/{0}'.format(self.member['id']), data={
                                        'email': unique_email(),
                                    }, content_type='application/json')

        self.assertTrue(response.status_code == 200, 'got {} ({}): {}'.format(
            response.status_code,
            response.status_text,
            msg
        ))

        # verify info was updated
        response, new_user_info = self.get_as(self.member, '/users/{0}'.format(self.member['id']))

        # new email
        self.assertTrue(new_user_info['email'] != prev_user_info['email'])

    def test_payment_update(self):
        super(TestUserAPI, self).test_payment_update()


class TestLoginAPI(TestLogInOutAPI):
    def test_password_reset(self, endpoint='/reset_password'):
        return super(TestLoginAPI, self).test_password_reset()

    def test_logged_in_user_password_reset(self, *args, **kwargs):
        endpoint = '/users/{0}/reset_password'.format(self.member['id'])

        reset_password_details = self.send_reset_password(endpoint)

        self.assertTrue(reset_password_details)

        response, msg = self.respond_to_reset_email(**reset_password_details)

        self.assertEquals(response.status_code, 200)
        self.assertTrue(msg['status'] == 'password_reset_complete', msg['msg'] == 'Password reset successfully.')

    def test_intercom_token(self):
        self.assertTrue('intercom_token' in self.member['auth'] and self.member['auth']['intercom_token'])


class TestSignUpAPI(TestSignUp):
    def test_sign_up_with_facebook(self, post=None):
        # can regenerate a new app token via https://developers.facebook.com/tools/accesstoken/
        post = post or self.strategies.get_create_user_strategy().example()
        client = self.get_client()

        post['params']['social_media'] = {
            'provider': 'facebook',
            'access_token': 'EAAAABg8fswQBAICIbgmzVpQxVOIggZA62zZCOdS49Y22C4'
                            'k9S4hrZArj8ueHmJMvDrARMeZADQcEFOzq74y5zZC98sRVZC'
                            'xHINKiDRvnWHE7ZAsoP2gaYjBDaoBvdJ7tSAac8mnlXZCgJ0BZ'
                            'B550KPRUWs1ytViIILnRmaWGmoShHIqBi4ZBZBke15frhGp8SVXOoIZD'
        }

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 201, 'expected {0} got {1} instead ({2})'.format(
            '201', response.status_code, user_meta or ''))

        oauthed_member = Member.objects.get(pk=user_meta['id'])

        # do we have a user created by python-social-auth?
        self.assertEquals(oauthed_member.user.social_auth.count(), 1)

        self.assertEquals(oauthed_member.user.social_auth.get().provider, 'facebook')

    def test_sign_up_with_google(self, post=None):
        # can regenerate a new app token via https://developers.google.com/oauthplayground/
        post = post or self.strategies.get_create_user_strategy().example()
        client = self.get_client()

        post['params']['social_media'] = {
            'provider': 'google-oauth2',
            'access_token': 'ya29.GlvgA2l1KOewb4N00kPukXVdGr-5AB95BeCUw9cmw3AkeQEmtjWN5NZXLR95UIHsaX_XyZhHLYN'
                            '-vzHAF2GcbjQG1H6_i8gOlG-eMp1xyxzXafq8KyECyGqavqA3'
        }

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 201, 'expected {0} got {1} instead ({2})'.format(
            '201', response.status_code, user_meta or ''))

        oauthed_member = Member.objects.get(pk=user_meta['id'])

        # do we have a user created by python-social-auth?
        self.assertEquals(oauthed_member.user.social_auth.count(), 1)

        self.assertEquals(oauthed_member.user.social_auth.get().provider, 'google-oauth2')

    def test_sign_up_with_twitter(self, post=None):
        post = post or self.strategies.get_create_user_strategy().example()
        client = self.get_client()

        post['params']['social_media'] = {
            'provider': 'twitter',
            'access_token': '16479870-xGkd6j31bjDZN0g2OL2bwEryXe3F6kh5HWqZbyj8q',
            'access_token_secret': '2qOTJEsFH5BYPecAXrKJGPtS4zzRHhD71hsAh9Iw7mgtm'
        }

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 201, 'expected {0} got {1} instead ({2})'.format(
            '201', response.status_code, user_meta or ''))

        oauthed_member = Member.objects.get(pk=user_meta['id'])

        # do we have a user created by python-social-auth?
        self.assertEquals(oauthed_member.user.social_auth.count(), 1)

        self.assertEquals(oauthed_member.user.social_auth.get().provider, 'twitter')
