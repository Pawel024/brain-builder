# Generated by Django 4.2.6 on 2024-02-21 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Intro',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('intro_id', models.IntegerField(unique=True)),
                ('visibility', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=200)),
                ('content', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Progress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(max_length=100)),
                ('task_id', models.IntegerField()),
                ('progress', models.FloatField(max_length=10)),
                ('error_list', models.CharField(max_length=2000)),
                ('network_weights', models.CharField(max_length=1000000)),
                ('network_biases', models.CharField(max_length=1000000)),
                ('plots', models.CharField(max_length=1000000)),
                ('feature_names', models.CharField(max_length=2000)),
                ('timestamp', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Quiz',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quiz_id', models.IntegerField(unique=True)),
                ('visibility', models.BooleanField(default=False)),
                ('question_1', models.TextField(blank=True, null=True)),
                ('code_1', models.TextField(blank=True, null=True)),
                ('option_1_a', models.CharField(blank=True, max_length=200, null=True)),
                ('option_1_b', models.CharField(blank=True, max_length=200, null=True)),
                ('option_1_c', models.CharField(blank=True, max_length=200, null=True)),
                ('option_1_d', models.CharField(blank=True, max_length=200, null=True)),
                ('answer_1', models.CharField(blank=True, max_length=200, null=True)),
                ('question_2', models.TextField(blank=True, null=True)),
                ('code_2', models.TextField(blank=True, null=True)),
                ('option_2_a', models.CharField(blank=True, max_length=200, null=True)),
                ('option_2_b', models.CharField(blank=True, max_length=200, null=True)),
                ('option_2_c', models.CharField(blank=True, max_length=200, null=True)),
                ('option_2_d', models.CharField(blank=True, max_length=200, null=True)),
                ('answer_2', models.CharField(blank=True, max_length=200, null=True)),
                ('question_3', models.TextField(blank=True, null=True)),
                ('code_3', models.TextField(blank=True, null=True)),
                ('option_3_a', models.CharField(blank=True, max_length=200, null=True)),
                ('option_3_b', models.CharField(blank=True, max_length=200, null=True)),
                ('option_3_c', models.CharField(blank=True, max_length=200, null=True)),
                ('option_3_d', models.CharField(blank=True, max_length=200, null=True)),
                ('answer_3', models.CharField(blank=True, max_length=200, null=True)),
                ('question_4', models.TextField(blank=True, null=True)),
                ('code_4', models.TextField(blank=True, null=True)),
                ('option_4_a', models.CharField(blank=True, max_length=200, null=True)),
                ('option_4_b', models.CharField(blank=True, max_length=200, null=True)),
                ('option_4_c', models.CharField(blank=True, max_length=200, null=True)),
                ('option_4_d', models.CharField(blank=True, max_length=200, null=True)),
                ('answer_4', models.CharField(blank=True, max_length=200, null=True)),
                ('question_5', models.TextField(blank=True, null=True)),
                ('code_5', models.TextField(blank=True, null=True)),
                ('option_5_a', models.CharField(blank=True, max_length=200, null=True)),
                ('option_5_b', models.CharField(blank=True, max_length=200, null=True)),
                ('option_5_c', models.CharField(blank=True, max_length=200, null=True)),
                ('option_5_d', models.CharField(blank=True, max_length=200, null=True)),
                ('answer_5', models.CharField(blank=True, max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Row',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.IntegerField()),
                ('user_id', models.CharField(max_length=100)),
                ('task_id', models.IntegerField()),
                ('progress_pk', models.IntegerField(null=True)),
                ('learning_rate', models.FloatField(max_length=10)),
                ('epochs', models.IntegerField()),
                ('normalization', models.BooleanField()),
                ('network_input', models.CharField(max_length=200)),
                ('games_data', models.CharField(default='[]', max_length=1000000)),
                ('timestamp', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='TaskDescription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.IntegerField(unique=True)),
                ('name', models.CharField(max_length=200)),
                ('short_description', models.TextField()),
                ('description', models.TextField()),
                ('dataset', models.TextField()),
                ('type', models.IntegerField()),
                ('n_inputs', models.IntegerField()),
                ('n_outputs', models.IntegerField()),
                ('max_epochs', models.IntegerField()),
                ('max_layers', models.IntegerField()),
                ('max_nodes', models.IntegerField()),
                ('normalization_visibility', models.BooleanField()),
                ('iterations_slider_visibility', models.BooleanField()),
                ('lr_slider_visibility', models.BooleanField()),
            ],
        ),
    ]
