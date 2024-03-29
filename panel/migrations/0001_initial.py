# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-01-14 03:29
from __future__ import unicode_literals

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PanelImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('views', models.BigIntegerField(default=0)),
                ('title', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True, max_length=128, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('content', models.FileField(upload_to='images')),
                ('related_tag', models.CharField(blank=True, max_length=16, null=True)),
                ('order', models.IntegerField(blank=True, null=True)),
                ('hotspots', jsonfield.fields.JSONField(null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PanelVideo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('views', models.BigIntegerField(default=0)),
                ('title', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True, max_length=128, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('content', models.FileField(upload_to='videos')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='images')),
                ('related_tag', models.CharField(blank=True, max_length=16, null=True)),
                ('order', models.IntegerField(blank=True, null=True)),
                ('hotspots', jsonfield.fields.JSONField(null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
