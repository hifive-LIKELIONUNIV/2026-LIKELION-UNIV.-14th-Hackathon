from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0006_erareference_detail_prompt'),
    ]

    operations = [
        migrations.AddField(
            model_name='personaresult',
            name='regen_candidate_image',
            field=models.ImageField(blank=True, null=True, upload_to='persona_results/'),
        ),
    ]
