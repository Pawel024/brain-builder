from django.db import migrations

def create_data(apps, schema_editor):
    Row = apps.get_model('my_backend', 'Row')
    Row(learning_rate=0.1, epochs=2, network_setup="", nn_input="", action=0, error_list="", timestamp=None).save()

class Migration(migrations.Migration):

    dependencies = [
        ('my_backend', '0001_initial'),
    ]

    operations = [
    	migrations.RunPython(create_data),
    ]