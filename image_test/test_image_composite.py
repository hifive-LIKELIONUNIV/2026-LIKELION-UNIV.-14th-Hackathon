"""
gpt-image-2 얼굴사진 + 레퍼런스사진 합성 테스트 스크립트
(gpt-image-1 접근이 막혀있어 별도 모델인 gpt-image-2로 우선 테스트)

목적: 텍스트 프롬프트만으로 시대/스타일을 설명하는 대신,
     실제 레퍼런스 사진(그 시대 분위기의 사진)을 함께 입력해서
     - 인물의 얼굴이 잘 유지되는지
     - 레퍼런스의 스타일/배경/분위기가 잘 반영되는지
     확인하기 위한 테스트.

사용법:
    1) .env.example을 .env로 복사하고 OPENAI_API_KEY=sk-... 값을 채워넣기
       (pip install python-dotenv 필요)
    2) 아래 두 이미지를 스크립트와 같은 폴더에 저장
       - face_photo.png  (테스트할 얼굴 사진, 본인 동의된 사진)
       - reference_photo.png  (재현하고 싶은 시대/스타일의 레퍼런스 사진)
    3) python3 test_image_composite.py
"""

import os
import sys
import base64
from dotenv import load_dotenv
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 이 스크립트가 있는 폴더
load_dotenv(os.path.join(BASE_DIR, ".env"))  # 스크립트 폴더 기준으로 .env 읽기

FACE_IMAGE_PATH = os.path.join(BASE_DIR, "face_photo.png")
REFERENCE_IMAGE_PATH = os.path.join(BASE_DIR, "reference_photo.png")
OUTPUT_IMAGE_PATH = os.path.join(BASE_DIR, "result_composite.png")

# gpt-image-1 접근이 막혀있다면 gpt-image-2로 먼저 테스트해볼 것
# (별도 모델이라 접근 권한 버킷이 다를 수 있음. OpenAI 공식 가이드 기준 신규 빌드 권장 모델)
MODEL = "gpt-image-2"

# OpenAI 공식 프롬프팅 가이드의 "Insert the Person Into a Scene" /
# "Virtual Clothing Try-On" 패턴을 따라 재작성:
# - Image 1 / Image 2를 인덱스로 명시적으로 참조
# - "무엇을 유지할지"와 "무엇을 바꿀지"를 분리해서 명시
# - photorealistic, 자연광 등 사실적 사진 키워드 포함
PROMPT = (
    "Image 1: a photo of a person (identity reference). "
    "Image 2: a style/scene reference photo representing a 1980s Hongdae street mood in Seoul. "
    "\n\n"
    "Generate a photorealistic photo where the person from Image 1 appears naturally in the "
    "setting, era, and atmosphere shown in Image 2. "
    "Do not change the person's face, facial features, skin tone, or identity in any way. "
    "Preserve their exact likeness, expression, and proportions from Image 1. "
    "Apply the clothing style, hairstyle, lighting, color grading, and background atmosphere "
    "from Image 2 so it looks like a real photograph taken in that era and place, not an "
    "overly stylized or cinematic image. Use natural, believable photographic lighting. "
    "Subtly reflect MCM's signature cognac brown color in the clothing or an accessory. "
    "\n\n"
    "Constraints: preserve identity and facial geometry exactly, no watermark, no extra text, "
    "no logos or trademarks, no unrelated added elements."
)


def run_test():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[에러] OPENAI_API_KEY가 설정되어 있지 않습니다.")
        print(".env.example을 .env로 복사하고 키 값을 채워넣으세요.")
        sys.exit(1)

    missing = [p for p in (FACE_IMAGE_PATH, REFERENCE_IMAGE_PATH) if not os.path.exists(p)]
    if missing:
        print(f"[에러] 다음 파일이 없습니다: {missing}")
        print("face_photo.png(얼굴 사진)과 reference_photo.png(레퍼런스 사진)를 준비하세요.")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    print(f"[진행] {MODEL} images.edit 호출 중 (2장 입력: 얼굴 + 레퍼런스)...")

    try:
        with open(FACE_IMAGE_PATH, "rb") as face_file, open(REFERENCE_IMAGE_PATH, "rb") as ref_file:
            response = client.images.edit(
                model=MODEL,
                image=[face_file, ref_file],   # 여러 장 입력 (최대 16장 지원)
                prompt=PROMPT,
                size="1024x1024",
                quality="medium",  # low/medium/high — 얼굴 디테일이 중요하니 medium 이상 권장
                # gpt-image-2는 항상 고화질 출력이라 input_fidelity 파라미터를 지원하지 않음
                # (gpt-image-1/1.5로 되돌릴 경우에만 input_fidelity="high" 추가)
            )

        result = response.data[0]

        if getattr(result, "b64_json", None):
            with open(OUTPUT_IMAGE_PATH, "wb") as out:
                out.write(base64.b64decode(result.b64_json))
            print(f"[성공] 결과 이미지를 저장했습니다: {OUTPUT_IMAGE_PATH}")
        elif getattr(result, "url", None):
            print(f"[성공] 결과 이미지 URL: {result.url}")
        else:
            print("[경고] 이미지 데이터를 찾을 수 없습니다. 응답 원문:")
            print(response)

    except Exception as e:
        print("[실패] API 호출 중 오류 발생 — 정책 위반 또는 다중이미지 처리 실패일 수 있습니다.")
        print(f"에러 내용: {e}")
        print()
        print(">>> content_policy_violation 관련 메시지라면 실제 얼굴 처리 제한 때문일 가능성이 높음.")
        print(">>> 그 외 에러라면 이미지 형식(png/webp/jpg, 각 50MB 이하)이나 리스트 전달 방식을 확인하세요.")


if __name__ == "__main__":
    run_test()