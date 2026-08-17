"""
PersonaResult 한 건(선택된 가방 + 특정 시대)에 대해 합성 이미지를 생성하는 서비스 레이어.

image_test/generator.py + prompts.py의 로직을 실제 Django 모델
(EraReference / CapturedPhoto / PersonaResult) 기반으로 이식한 버전.
프롬프트 문구 자체는 image_test 쪽과 동일하게 유지 — 튜닝은 build_prompt()에서.
"""

import base64
import logging
import threading
import time

from django.conf import settings
from django.core.files.base import ContentFile
from openai import (
    APIConnectionError,
    APITimeoutError,
    InternalServerError,
    OpenAI,
    RateLimitError,
)

from .constants import ERA_META
from .face_utils import detect_face_height_ratio
from .models import EraReference, PersonaResult

logger = logging.getLogger(__name__)

MODEL = "gpt-image-2"

# 재시도 대상: 일시적인 네트워크/서버 문제로 보이는 에러만 (요청 자체가 잘못된
# BadRequestError, 인증 문제인 AuthenticationError 등은 재시도해도 계속 실패하므로 제외)
_RETRYABLE_ERRORS = (APIConnectionError, APITimeoutError, InternalServerError, RateLimitError)
_MAX_ATTEMPTS = 3
_RETRY_BACKOFF_SECONDS = 2  # 1차 실패 후 2초, 2차 실패 후 4초 대기

# 여러 시대를 동시에 백그라운드로 미리 생성하다 보니, 프로세스 전체에서 실제로
# OpenAI에 동시에 나가는 이미지 생성 요청 수를 제한해서 rate limit을 피한다.
# (여러 방문자가 동시에 체험 중이어도 이 값을 넘는 요청은 줄을 서서 기다림)
_GENERATION_SEMAPHORE = threading.Semaphore(2)

# 감지된 원본 얼굴 비율보다 이 정도 배율만큼 작게 지정 (여전히 크다는 피드백으로 0.9 -> 0.8 -> 0.7로 축소)
FACE_SIZE_SHRINK_FACTOR = 0.7

# "다시 생성"에서 기존 결과와 다른 결과가 나오도록 매번 하나씩 뽑아서 프롬프트에 추가하는 변주 후보.
# 표정/조명 같은 임의 변화 대신, 기존 핵심 요구사항(헤어스타일/각도/피부톤/얼굴크기/목길이) 중 하나를
# 이번 시도에는 더 자연스럽게 다듬는 데 집중하도록 재강조하는 방식.
VARIATION_HINTS = [
    "a noticeably more natural hairstyle blend this time — pay extra attention to how individual hair strands "
    "and the hairline meet the head and background, avoiding any stiff, wig-like, or cut-out look",
    "an even more precisely natural head angle match to Image 2 this time — double-check the exact rotation and "
    "tilt so the face doesn't look flat, off-angle, or pasted on",
    "a more natural, seamlessly matched skin tone this time — blend the replaced face's skin tone and texture more "
    "closely with Image 2's lighting and color grading so there's no visible mismatch at the edges",
    "a more naturally proportioned face size this time relative to the body and frame in Image 2 — avoid a face "
    "that looks too large or too small for the person's build",
    "a more natural neck length this time — pay extra attention to the chin-to-shoulder distance so it is not "
    "compressed or shortened when fitting the new face in",
]


def _get_ref_face_ratio(reference: EraReference):
    """EraReference의 얼굴 높이 비율을 반환. DB에 캐싱된 값이 있으면 그대로 쓰고,
    없으면(최초 계산 또는 이미지 교체 후) 한 번 계산해서 저장해둔다.
    (같은 레퍼런스로 여러 방문자가 동시에 처음 생성할 수도 있지만, 계산 자체가
    가벼운 연산이라 약간 중복 계산되는 정도는 문제없음)"""
    if reference.face_height_ratio_computed:
        return reference.face_height_ratio

    try:
        ratio = detect_face_height_ratio(reference.image.path)
    except Exception:
        ratio = None

    reference.face_height_ratio = ratio
    reference.face_height_ratio_computed = True
    reference.save(update_fields=['face_height_ratio', 'face_height_ratio_computed'])
    return ratio


def _call_images_edit_with_retry(client, face_path, ref_path, prompt):
    """OpenAI images.edit 호출을 감싸서, 네트워크 순단이나 5xx/rate limit처럼
    일시적일 가능성이 높은 에러에 한해 짧은 대기 후 최대 _MAX_ATTEMPTS번까지 재시도한다.
    (요청 자체가 잘못된 경우 등은 재시도해도 의미가 없으므로 즉시 올림)
    파일은 시도마다 새로 열어야 함 — 이미 한 번 읽은 파일 객체는 재사용할 수 없음."""
    last_error = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            with open(face_path, 'rb') as face_file, open(ref_path, 'rb') as ref_file:
                return client.images.edit(
                    model=MODEL,
                    image=[face_file, ref_file],
                    prompt=prompt,
                    size="1152x1536",  # 3:4 비율
                    quality="medium",
                )
        except _RETRYABLE_ERRORS as exc:
            last_error = exc
            logger.warning(
                "OpenAI images.edit 호출 실패 (시도 %d/%d): %s", attempt, _MAX_ATTEMPTS, exc
            )
            if attempt < _MAX_ATTEMPTS:
                time.sleep(_RETRY_BACKOFF_SECONDS * attempt)
    raise last_error


def build_prompt(bag_name: str, era: str, ref_face_ratio=None, detail_prompt=None, variation_hint=None) -> str:
    meta = ERA_META[era]

    if ref_face_ratio is not None:
        original_pct = round(ref_face_ratio * 100)
        target_pct = round(ref_face_ratio * FACE_SIZE_SHRINK_FACTOR * 100)
        size_instruction = (
            f"As a concrete size reference: in Image 2, the original face occupies approximately "
            f"{original_pct}% of the image height. Size the replaced face to approximately {target_pct}% "
            "of the image height — slightly smaller than the original, not larger, and not an exact 1:1 match. "
            "This size must also stay proportionate to the body and frame of the person in Image 2 — the face "
            "should look like it naturally belongs to that person's build (a larger frame should carry a "
            "proportionally larger face, a slighter frame a proportionally smaller face), not a face pasted at "
            "a fixed size regardless of the body underneath it. Also preserve the natural neck length shown in "
            "Image 2 — keep the same distance between the chin and the shoulders/collar as in Image 2. Do not "
            "compress, shorten, or hide the neck when fitting the new face in; a too-short neck is a common "
            "mistake to avoid here."
        )
    else:
        size_instruction = (
            "Size the replaced face slightly smaller than the head size shown in Image 2, not an exact "
            "1:1 match, and keep it proportionate to the body and frame of the person in Image 2 so it looks "
            "like it naturally belongs to that person's build, not a face pasted at a fixed size. Also preserve "
            "the natural neck length shown in Image 2 — keep the same distance between the chin and the "
            "shoulders/collar as in Image 2, and do not compress or shorten the neck when fitting the new face in."
        )

    detail_block = f"\n\nAdditional details to emphasize for this bag and era: {detail_prompt.strip()}" if detail_prompt else ""

    variation_block = (
        f"\n\nRegeneration focus: this is a re-generation attempt of the same photo. Compared to a straightforward "
        f"first attempt, pay extra attention to making ALL of the following more natural: {variation_hint} Keep "
        "every change subtle and photorealistic, and do not violate any of the requirements above (identity, "
        "hairstyle content, clothing, bag, composition) while applying them."
        if variation_hint else ""
    )

    return (
        "Image 1: a reference photo of a person's face and hairstyle (identity source).\n"
        f"Image 2: the target photo — a {meta['label']} era MCM photo already showing the {bag_name}, with the "
        f"following mood/atmosphere: {meta['mood']}. Reproduce Image 2's composition, background, clothing, "
        "pose, body, and bag with maximum fidelity. Only the face and hairstyle should change.\n\n"
        "MOST IMPORTANT REQUIREMENT — head angle: first, look carefully at exactly how the head is turned, "
        "tilted, and rotated in Image 2 (for example: turned to the left or right, chin up or down, "
        "three-quarter view, profile, or straight-on). The replaced face and hair must be drawn at that exact "
        "same head angle and rotation, in 3D perspective consistent with Image 2's camera viewpoint — never "
        "render the new face flat or straight-on if the head in Image 2 is turned or tilted. Getting this head "
        "angle right matters more than any other part of this edit; a face at the wrong angle will look pasted "
        "on and fake even if everything else is correct.\n\n"
        "Task: replace the face AND the hairstyle of the person in Image 2 with the face and hairstyle "
        f"from Image 1, at the head angle described above. {size_instruction} Blend the new face and hair into "
        "Image 2 so the skin tone, lighting direction, color grading, and film grain match Image 2 "
        "seamlessly — the result should look like one single, untouched photograph, not a collage. "
        "Apply the same era-appropriate photo filter as the rest of Image 2 to the replaced face and hair as "
        "well — matching color grading, contrast, saturation, film grain, and overall mood/atmosphere — so the "
        "face does not look like a crisp modern photo pasted onto an older or differently toned image; the "
        "filter must be consistent across the entire photo, face included.\n\n"
        "Preserve the facial identity, bone structure, and distinctive features from Image 1 exactly, and "
        "preserve Image 1's hairstyle (length, texture, color, and style) exactly.\n\n"
        "Do NOT change anything else in Image 2: keep the exact same body shape, pose, and background as "
        "shown. Reproduce the outfit's fabric texture and color exactly, and reproduce the bag exactly as it "
        "appears in Image 2 — same shape, same monogram/pattern, same hardware, same stitching and material "
        "texture, with no simplification or redesign of any of these details."
        f"{detail_block}"
        f"{variation_block}\n\n"
        "Constraints: head angle must match Image 2 exactly (see above — this is the top priority), seamless "
        "blending at the face/hair boundary (no visible seams, no mismatched edges), photorealistic result, "
        "consistent color grading/filter across the whole image including the face, no watermark, no extra "
        "text, no new logos or trademarks beyond what is already visible in Image 2, no unrelated added "
        "elements."
    )


def generate_result(result: PersonaResult, target_field: str = 'generated_image') -> PersonaResult:
    """
    result.selection에서 선택된 촬영 사진 + result.era에 맞는 EraReference를 gpt-image-2로 합성해서
    result의 target_field(기본 generated_image)에 저장하고 status='done'으로 갱신한다.

    target_field='regen_candidate_image'로 넘기면 "다시 생성" 후보 이미지 용도로,
    기존 generated_image는 건드리지 않고 별도 필드에만 저장한다
    (사용자가 기존/새 사진 중 하나를 고를 때까지 결과 화면에 반영되지 않게 하기 위함).

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
            getattr(result, target_field).save(
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

    # 레퍼런스 사진에서 얼굴 크기 비율을 감지해서 프롬프트에 구체적인 힌트로 넣어줌.
    # 감지 실패해도(얼굴 인식 안 됨 등) 생성 자체는 막지 않고 일반 문구로 대체
    ref_face_ratio = _get_ref_face_ratio(reference)

    # "다시 생성"(regen_candidate_image로 저장하는 경우)일 때만 변주 항목을 전부 넣어서
    # 최초 생성과 눈에 띄게 다른 결과가 나오도록 함. 최초 생성은 그대로 유지.
    variation_hint = (
        " ".join(f"({i}) {hint};" for i, hint in enumerate(VARIATION_HINTS, start=1))
        if target_field != 'generated_image' else None
    )

    prompt = build_prompt(
        selection.product.name, result.era, ref_face_ratio, reference.detail_prompt, variation_hint
    )

    # openai SDK가 bytes/io.IOBase/PathLike/tuple만 받기 때문에
    # Django의 FieldFile을 그대로 넘기면 안 되고, 실제 파일 경로를 open()으로 열어서 넘겨야 함.
    # 세마포어로 실제 API 호출 자체의 동시 실행 개수를 제한 (파일을 열어둔 채로 대기하지
    # 않도록, open()은 세마포어를 획득한 뒤에 함)
    with _GENERATION_SEMAPHORE:
        response = _call_images_edit_with_retry(client, chosen_photo.image.path, reference.image.path, prompt)

    data = response.data[0]
    if not getattr(data, "b64_json", None):
        raise RuntimeError("응답에서 이미지 데이터를 찾을 수 없습니다.")

    filename_suffix = '' if target_field == 'generated_image' else f'_{target_field}'
    getattr(result, target_field).save(
        f"result_{selection.id}_{result.era}{filename_suffix}.png",
        ContentFile(base64.b64decode(data.b64_json)),
        save=False,
    )
    result.status = 'done'
    result.save()
    return result
