from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0007_personaresult_regen_candidate_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='personaselection',
            name='passport_image',
            field=models.ImageField(blank=True, null=True, upload_to='passports/'),
        ),
    ]
