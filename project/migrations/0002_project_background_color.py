# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-04 19:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='background_color',
            field=models.CharField(blank=True, max_length=32, null=True, verbose_name='background-color'),
        ),
    ]