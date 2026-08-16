"""
PersonaResult 한 건(선택된 가방 + 특정 시대)에 대해 합성 이미지를 생성하는 서비스 레이어.

image_test/generator.py + prompts.py의 로직을 실제 Django 모델
(EraReference / CapturedPhoto / PersonaResult) 기반으로 이식한 버전.
프롬프트 문구 자체는 image_test 쪽과 동일하게 유지 — 튜닝은 build_prompt()에서.
"""

import base64

from django.conf import settings
from django.core.files.base import ContentFile
from openai import OpenAI

from .constants import ERA_META
from .models import EraReference, PersonaResult

MODEL = "gpt-image-2"


def build_prompt(bag_name: str, era: str) -> str:
    meta = ERA_META[era]
    return (
        f"Image 1: a photo of a person (identity reference), to be shown carrying a {bag_name}.\n"
        f"Image 2: a style/scene reference photo representing the mood of {meta['label']} - {meta['mood']}.\n\n"
        f"Generate a photorealistic photo where the person from Image 1 appears naturally in the "
        f"setting, era, and atmosphere shown in Image 2 ({meta['label']}). "
        "Do not change the person's face, facial features, skin tone, or identity in any way. "
        "Preserve their exact likeness, expression, and body proportions from Image 1. "
        "Do NOT copy body shape, pose, or gender presentation from Image 2 - only use Image 2 for "
        "clothing style, color palette, lighting, and background atmosphere. "
        f"The person should be naturally carrying or wearing the {bag_name}. "
        "Use natural, believable photographic lighting, not an overly stylized or cinematic look. "
        "Subtly reflect MCM's signature cognac brown color in the clothing or an accessory if it fits naturally.\n\n"
        "Constraints: preserve identity and facial geometry exactly, no watermark, no extra text, "
        "no logos or trademarks, no unrelated added elements."
    )


def generate_result(result: PersonaResult) -> PersonaResult:
    """
    result.selection에서 선택된 촬영 사진 + result.era에 맞는 EraReference를 gpt-image-2로 합성해서
    result.generated_image에 저장하고 status='done'으로 갱신한다.

    2026(현재)은 합성 없이 선택된 촬영 사진을 그대로 결과로 사용한다.

    실패 시 예외를 그대로 올린다 — 호출하는 뷰에서 status='failed' 처리와
    사용자에게 보여줄 에러 메시지를 책임진다.
    """
    selection = result.selection
    chosen_photo = selection.captured_photos.filter(is_chosen=True).first()
    if not chosen_photo:
        raise ValueError("선택된 촬영 사진이 없습니다.")

    if result.era == '2026':
        with open(chosen_photo.image.path, 'rb') as f:
            result.generated_image.save(
                f"result_{selection.id}_2026.png",
                ContentFile(f.read()),
                save=False,
            )
        result.status = 'done'
        result.save()
        return result

    try:
        reference = EraReference.objects.get(product=selection.product, era=result.era)
    except EraReference.DoesNotExist:
        raise ValueError(
            f"'{selection.product.name}' - {result.era} 레퍼런스 이미지가 등록되어 있지 않습니다. "
            "관리자 페이지에서 EraReference를 먼저 업로드해주세요."
        )

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다. 저장소 루트 .env를 확인하세요.")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = build_prompt(selection.product.name, result.era)

    # openai SDK가 bytes/io.IOBase/PathLike/tuple만 받기 때문에
    # Django의 FieldFile을 그대로 넘기면 안 되고, 실제 파일 경로를 open()으로 열어서 넘겨야 함
    with open(chosen_photo.image.path, 'rb') as face_file, open(reference.image.path, 'rb') as ref_file:
        response = client.images.edit(
            model=MODEL,
            image=[face_file, ref_file],
            prompt=prompt,
            size="1152x1536",  # 3:4 비율
            quality="medium",
        )

    data = response.data[0]
    if not getattr(data, "b64_json", None):
        raise RuntimeError("응답에서 이미지 데이터를 찾을 수 없습니다.")

    result.generated_image.save(
        f"result_{selection.id}_{result.era}.png",
        ContentFile(base64.b64decode(data.b64_json)),
        save=False,
    )
    result.status = 'done'
    result.save()
    return result
