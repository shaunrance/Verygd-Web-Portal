# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import unittest
import os
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
        response, msg = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertTrue(response.status_code == 200, 'expected 200 got {0} ({1})'.format(response.status_code, msg))

        self.assertTrue(msg['payment'] and msg['payment']['plan_name'] == 'basic')

        # test adds payment info
        new_payment_info = self.strategies.get_payment_info_example_params()

        response, msg = self.put_as(self.member, '/users/{0}'.format(self.member['id']), data={
            'payment': new_payment_info,
        }, content_type='application/json')

        self.assertEquals(response.status_code, 200, 'expected 200 got {0} instead ({1})'.format(response.status_code,
                                                                                                 msg))

        response, msg = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertTrue(response.status_code == 200, 'expected 200 got {0} ({1})'.format(response.status_code, msg))

        self.assertTrue('next_billing_date' in msg['payment'] and msg['payment']['next_billing_date'])
        self.assertEquals(msg['payment']['plan_name'], 'premium')

    def test_user_meta_premium_vs_basic(self):
        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))

        self.assertEquals(response.status_code, 200)

        self.assertTrue('payment' in user_meta and 'plan_name' in user_meta['payment'])
        self.assertEquals(user_meta['payment']['plan_name'], 'basic')

        Member.objects.get(pk=self.member['id']).upgrade_to_premium()

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))

        self.assertEquals(response.status_code, 200)

        self.assertTrue('payment' in user_meta and 'plan_name' in user_meta['payment'])
        self.assertEquals(user_meta['payment']['plan_name'], 'premium')

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
    def login_via_social_auth(self, user_id, post_params):
        client = self.get_client()

        response, login_meta = self.post('/auth/social/token', data={
            'provider': post_params['provider'], 'access_token': post_params['access_token'],
        }, client=client)

        self.assertTrue(response.status_code == 200, 'expected {0} got {1} instead ({2})'.format(
            '200', response.status_code, login_meta or ''))

        return login_meta

    def test_bad_access_token_fb(self, post=None):
        # can regenerate a new app token via https://developers.facebook.com/tools/accesstoken/
        post = post or {'params': {}}
        client = self.get_client()

        post['url'] = '/users/social/signup'

        post['params'].update({
            'provider': 'facebook',
            'access_token': 'bad_token'
        })

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 400, 'expected {0} got {1} instead ({2})'.format(
            '400', response.status_code, user_meta or ''))

    @unittest.skipIf(not os.getenv('FACEBOOK_ACCESS_TOKEN', None), 'requires a temp social auth access token')
    def test_login_via_social_auth(self):
        user_id, post_params = self.test_sign_up_with_facebook()

        login_meta = self.login_via_social_auth(user_id, post_params)

        self.assertTrue(login_meta and 'token' in login_meta and login_meta['token'])

    @unittest.skipIf(not os.getenv('FACEBOOK_ACCESS_TOKEN', None), 'requires a temp social auth access token')
    def test_sign_up_with_facebook(self, post=None):
        # can regenerate a new app token via https://developers.facebook.com/tools/accesstoken/
        post = post or {'params': {}}
        client = self.get_client()

        post['url'] = '/users/social/signup'

        post['params'].update({
            'provider': 'facebook',
            'access_token': os.getenv('FACEBOOK_ACCESS_TOKEN', None)
        })

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 201, 'expected {0} got {1} instead ({2})'.format(
            '201', response.status_code, user_meta or ''))

        oauthed_member = Member.objects.get(pk=user_meta['id'])

        # do we have a user created by python-social-auth?
        self.assertEquals(oauthed_member.user.social_auth.count(), 1)

        self.assertEquals(oauthed_member.user.social_auth.get().provider, 'facebook')

        # user has a photo defined by the social auth
        self.assertTrue('photo' in user_meta and user_meta['photo'])

        return user_meta['id'], post['params']

    @unittest.skipIf(not os.getenv('GOOGLE_ACCESS_TOKEN', None), 'requires a temp social auth access token')
    def test_sign_up_with_google(self, post=None):
        # can regenerate a new app token via https://developers.google.com/oauthplayground/
        post = post or {'params': {}}
        client = self.get_client()

        post['url'] = '/users/social/signup'

        post['params'].update({
            'provider': 'google',
            'access_token': os.getenv('GOOGLE_ACCESS_TOKEN', None)
        })

        response, user_meta = self.post(post['url'], data=post['params'], client=client,
                                        content_type='application/json')

        self.assertTrue(response.status_code == 201, 'expected {0} got {1} instead ({2})'.format(
            '201', response.status_code, user_meta or ''))

        oauthed_member = Member.objects.get(pk=user_meta['id'])

        # do we have a user created by python-social-auth?
        self.assertEquals(oauthed_member.user.social_auth.count(), 1)

        self.assertEquals(oauthed_member.user.social_auth.get().provider, 'google-oauth2')

        # user has a photo defined by the social auth
        self.assertTrue('photo' in user_meta and user_meta['photo'])

        return user_meta['id'], post['params']
