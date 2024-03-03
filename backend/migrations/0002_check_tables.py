from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE  table_name   = 'backend_feedback'
                ) THEN
                    CREATE TABLE backend_feedback (
                        id serial PRIMARY KEY,
                        feedback jsonb NOT NULL,
                        timestamp timestamp with time zone NOT NULL
                    );
                END IF;
            END
            $$;
            """,
            reverse_sql=migrations.RunSQL.noop
        ),
    ]