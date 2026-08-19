from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0005_erareference_personaresult_regenerated'),
    ]

    operations = [
        migrations.AddField(
            model_name='erareference',
            name='detail_prompt',
            field=models.TextField(
                blank=True,
                help_text="이 가방×시대 조합에서 강조하고 싶은 디테일(선택사항). "
                          "작성하면 생성 프롬프트에 그대로 추가됩니다. (영어 권장)",
            ),
        ),
    ]
