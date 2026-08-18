import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0004_product_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='personaresult',
            name='regenerated',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='EraReference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('era', models.CharField(choices=[('1976', '1976'), ('2005', '2005'), ('2016', '2016')], max_length=4)),
                ('image', models.ImageField(upload_to='era_references/')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='era_references', to='shop.product')),
            ],
            options={
                'unique_together': {('product', 'era')},
            },
        ),
    ]
