"""
gpt-image-1 얼굴 스타일 변형 정책 테스트 스크립트

목적: 실제 인물 사진을 업로드해서 images.edit API가
     - 정상적으로 처리되는지
     - 정책 위반(content_policy_violation 등)으로 거부되는지
     - 얼굴이 심하게 왜곡되는지
     확인하기 위한 최소 테스트.

사용법:
    1) .env.example을 .env로 복사하고 OPENAI_API_KEY=sk-... 값을 채워넣기
       (pip install python-dotenv 필요)
    2) 테스트할 사진을 이 스크립트와 같은 폴더에 test_photo.png(또는 jpg)로 저장
    3) python3 test_image_edit.py
"""

import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 이 스크립트가 있는 폴더
load_dotenv(os.path.join(BASE_DIR, ".env"))  # 스크립트 폴더 기준으로 .env 읽기

# ---- 설정 ----
INPUT_IMAGE_PATH = os.path.join(BASE_DIR, "test_photo.png")   # 테스트용 사진 경로
OUTPUT_IMAGE_PATH = os.path.join(BASE_DIR, "result_1980s.png")
MODEL = "gpt-image-1"

PROMPT = (
    "이 인물을 1980년대 홍대 스트리트 감성의 사진으로 재해석해줘. "
    "세피아 톤 필름 그레인, 네온사인이 은은한 골목 배경. "
    "인물의 얼굴 특징(눈, 코, 입, 얼굴형)은 최대한 원본 그대로 유지하고 "
    "의상과 헤어스타일만 그 시대 스타일로 바꿔줘. "
    "MCM 브랜드를 상징하는 꼬냑 브라운 컬러를 의상이나 소품 중 한 곳에 반영해줘."
)


def run_test():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[에러] OPENAI_API_KEY가 설정되어 있지 않습니다.")
        print(".env.example을 .env로 복사하고 키 값을 채워넣으세요.")
        sys.exit(1)

    if not os.path.exists(INPUT_IMAGE_PATH):
        print(f"[에러] 테스트 이미지가 없습니다: {INPUT_IMAGE_PATH}")
        print("본인 사진(동의된) 또는 팀원 사진을 이 이름으로 저장한 뒤 다시 실행하세요.")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    print(f"[진행] {MODEL} images.edit 호출 중... (사진: {INPUT_IMAGE_PATH})")

    try:
        with open(INPUT_IMAGE_PATH, "rb") as img_file:
            response = client.images.edit(
                model=MODEL,
                image=img_file,
                prompt=PROMPT,
                size="1024x1024",
            )

        # 결과 저장 (base64 또는 url 형태 모두 대응)
        result = response.data[0]

        if getattr(result, "b64_json", None):
            import base64
            with open(OUTPUT_IMAGE_PATH, "wb") as out:
                out.write(base64.b64decode(result.b64_json))
            print(f"[성공] 결과 이미지를 저장했습니다: {OUTPUT_IMAGE_PATH}")
        elif getattr(result, "url", None):
            print(f"[성공] 결과 이미지 URL: {result.url}")
        else:
            print("[경고] 이미지 데이터를 찾을 수 없습니다. 응답 원문:")
            print(response)

    except Exception as e:
        print("[실패] API 호출 중 오류 발생 — 정책 위반으로 거부됐을 가능성이 있습니다.")
        print(f"에러 내용: {e}")
        print()
        print(">>> 만약 content_policy_violation, safety system 관련 메시지라면,")
        print(">>> 실제 얼굴 사진 업로드가 정책상 제한되는 것으로 판단하고")
        print(">>> 대안 경로(Replicate/fal.ai 또는 배경합성 방식)로 전환을 검토하세요.")


if __name__ == "__main__":
    run_test()