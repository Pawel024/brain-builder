# Generated by Django 4.2.6 on 2023-10-13 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='row',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]