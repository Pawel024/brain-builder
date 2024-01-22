# Generated by Django 4.2.6 on 2024-01-20 21:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0012_row_error_list_row_network_biases_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='question_3',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_1_a',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_1_b',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_1_c',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_1_d',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_2_a',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_2_b',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_2_c',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_2_d',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_3_a',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_3_b',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_3_c',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_3_d',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_4_a',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_4_b',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_4_c',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_4_d',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_5_a',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_5_b',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_5_c',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='option_5_d',
            field=models.CharField(max_length=200),
        ),
    ]