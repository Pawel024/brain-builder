# Generated by Django 4.2.6 on 2024-01-19 08:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_alter_row_minidata'),
    ]

    operations = [
        migrations.AddField(
            model_name='progress',
            name='feature_names',
            field=models.CharField(default=[], max_length=2000),
            preserve_default=False,
        ),
    ]
