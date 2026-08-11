"""
gpt-image-1 얼굴사진 + 레퍼런스사진 합성 테스트 스크립트

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
MODEL = "gpt-image-1"

PROMPT = (
    "첫 번째 이미지 속 인물의 얼굴 특징(눈, 코, 입, 얼굴형)을 최대한 그대로 유지하면서, "
    "두 번째 이미지의 시대적 분위기, 배경, 색감, 스타일링을 그 인물에게 자연스럽게 입혀줘. "
    "결과물은 마치 그 인물이 실제로 두 번째 사진과 같은 시대·장소에 있었던 것처럼 자연스러워야 해. "
    "MCM 브랜드의 꼬냑 브라운 컬러 톤을 의상이나 소품 중 한 곳에 은은하게 반영해줘."
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