# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-17 20:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scene', '0004_auto_20170303_2009'),
    ]

    operations = [
        migrations.AddField(
            model_name='scene',
            name='hotspot_type',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
