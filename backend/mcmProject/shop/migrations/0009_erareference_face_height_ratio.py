from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0008_personaselection_passport_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='erareference',
            name='face_height_ratio',
            field=models.FloatField(blank=True, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='erareference',
            name='face_height_ratio_computed',
            field=models.BooleanField(default=False, editable=False),
        ),
    ]
