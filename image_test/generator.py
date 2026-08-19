"""
핵심 합성 함수. (얼굴사진, 가방, 시대) 조합을 받아 gpt-image-2로 합성 이미지를 생성.
config.py / prompts.py 값만 바꾸면 이 파일은 그대로 재사용 가능.
"""

import base64
import os

from openai import OpenAI

from config import BAGS, ERAS, reference_image_path
from prompts import build_prompt

MODEL = "gpt-image-2"


def generate_era_photo(
    client: OpenAI,
    base_dir: str,
    face_photo_path: str,
    bag_id: str,
    era: str,
    output_path: str,
) -> str:
    """
    얼굴 사진 + (bag_id, era)에 해당하는 레퍼런스 이미지를 합성.
    성공 시 결과 이미지가 저장된 경로(또는 URL)를 반환.
    """
    if bag_id not in BAGS:
        raise ValueError(f"알 수 없는 bag_id: {bag_id} (사용 가능: {list(BAGS)})")
    if era not in ERAS:
        raise ValueError(f"알 수 없는 era: {era} (사용 가능: {list(ERAS)})")

    bag = BAGS[bag_id]
    era_info = ERAS[era]
    reference_path = reference_image_path(base_dir, bag_id, era)

    if not os.path.exists(face_photo_path):
        raise FileNotFoundError(f"얼굴 사진이 없습니다: {face_photo_path}")
    if not os.path.exists(reference_path):
        raise FileNotFoundError(f"레퍼런스 이미지가 없습니다: {reference_path}")

    prompt = build_prompt(bag["name"], era_info["label"], era_info["mood"])

    with open(face_photo_path, "rb") as face_file, open(reference_path, "rb") as ref_file:
        response = client.images.edit(
            model=MODEL,
            image=[face_file, ref_file],
            prompt=prompt,
            size="1152x1536",  # 3:4 비율 (1152/1536 = 0.75), 16의 배수 조건 충족
            quality="medium",
        )

    result = response.data[0]

    if getattr(result, "b64_json", None):
        with open(output_path, "wb") as out:
            out.write(base64.b64decode(result.b64_json))
        return output_path
    elif getattr(result, "url", None):
        return result.url

    raise RuntimeError("응답에서 이미지 데이터를 찾을 수 없습니다.")