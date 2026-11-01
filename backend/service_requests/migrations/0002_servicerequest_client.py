import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
        ('service_requests', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='client',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='service_requests', to='clients.client'),
        ),
    ]
