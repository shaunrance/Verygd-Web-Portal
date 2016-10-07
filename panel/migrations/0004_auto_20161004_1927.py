# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-04 19:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('panel', '0003_auto_20160930_0521'),
    ]

    operations = [
        migrations.AddField(
            model_name='panelimage',
            name='is_panorama',
            field=models.BooleanField(default=False, verbose_name='is-panorama'),
        ),
        migrations.AddField(
            model_name='panelvideo',
            name='is_panorama',
            field=models.BooleanField(default=False, verbose_name='is-panorama'),
        ),
    ]