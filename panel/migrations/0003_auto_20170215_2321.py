# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-15 23:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('panel', '0002_auto_20170114_0329'),
    ]

    operations = [
        migrations.AddField(
            model_name='panelimage',
            name='hotspot_type',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='panelvideo',
            name='hotspot_type',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
