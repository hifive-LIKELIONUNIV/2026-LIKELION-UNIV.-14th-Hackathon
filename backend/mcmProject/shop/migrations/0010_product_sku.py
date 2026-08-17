from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0009_erareference_face_height_ratio'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='sku',
            field=models.CharField(blank=True, db_index=True, max_length=50),
        ),
    ]
