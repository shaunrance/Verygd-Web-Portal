# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from very_gd.tests.strategies import TestStrategies
from media_portal.users.tests import TestUserAPI as TestUserAPIBase
from media_portal.users.tests import TestLogInOutAPI
from users.settings import UserPasswordResetEmail, UserSignUpEmail, UserSettings

TestUserAPIBase.strategy = TestStrategies


class TestUserAPI(TestUserAPIBase):
    def __init__(self, *args, **kwargs):
        self.member = None
        self.second_member = None

        super(TestUserAPI, self).__init__(*args, **kwargs)

    def test_signed_up_in(self):
        self.assertTrue('logged_in' in self.member and self.member['logged_in'])

        response, user_meta = self.get_as(self.member, '/users/{0}'.format(self.member['id']))
        self.assertEquals(response.status_code, 200)

        self.assertTrue('payment' in user_meta and not user_meta['payment'])

    def test_update_member(self):
        super(TestUserAPI, self).test_update_member()

    def test_payment_update(self):
        super(TestUserAPI, self).test_payment_update()


class TestLoginAPI(TestLogInOutAPI):
    def setUp(self):
        self.setup_email_settings()

        super(TestLoginAPI, self).setUp()

    def setup_email_settings(self):
        reset_email_settings = UserPasswordResetEmail()
        signup_email_settings = UserSignUpEmail()

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

        user_settings = UserSettings(reset_password_email=reset_email_settings,
                                     signup_email=signup_email_settings)

        user_settings.save()

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
