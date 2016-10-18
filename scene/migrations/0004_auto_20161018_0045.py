# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-18 00:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scene', '0003_auto_20161012_2349'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scene',
            name='order',
        ),
        migrations.AddField(
            model_name='scene',
            name='background',
            field=models.CharField(blank=True, max_length=32, null=True, verbose_name='background'),
        ),
        migrations.AddField(
            model_name='scene',
            name='is_panorama',
            field=models.BooleanField(default=False, verbose_name='is-panorama'),
        ),
    ]
