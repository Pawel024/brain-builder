# Generated by Django 4.2.6 on 2024-01-24 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='taskdescription',
            name='iterations_slider_visibility',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='taskdescription',
            name='lr_slider_visibility',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]