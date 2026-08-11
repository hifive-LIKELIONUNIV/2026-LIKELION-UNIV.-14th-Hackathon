"""
gpt-image-1 순수 텍스트→이미지 생성 테스트 (입력 이미지 없음)

목적: images.edit(입력 이미지 필요)가 "input-images per min: Limit 0"으로
     막혔을 때, 입력 이미지가 필요 없는 images.generate도 막히는지 확인해서
     - 계정 전체가 막힌 건지
     - "이미지 입력" 기능만 별도로 더 제한되어 있는 건지
     구분하기 위한 테스트.

사용법:
    1) .env 파일에 OPENAI_API_KEY가 이미 설정되어 있어야 함 (이전 스크립트와 동일 폴더)
    2) python3 test_image_generate.py
"""

import os
from dotenv import load_dotenv
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

OUTPUT_IMAGE_PATH = os.path.join(BASE_DIR, "result_generate_only.png")
MODEL = "gpt-image-1"

PROMPT = (
    "1980년대 홍대 스트리트 감성의 사진. 세피아 톤 필름 그레인, "
    "네온사인이 은은한 골목 배경. 꼬냑 브라운 컬러의 가방을 든 사람이 걷고 있는 모습."
)


def run_test():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[에러] OPENAI_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인하세요.")
        return

    client = OpenAI(api_key=api_key)

    print(f"[진행] {MODEL} images.generate 호출 중 (입력 이미지 없음, 텍스트만)...")

    try:
        response = client.images.generate(
            model=MODEL,
            prompt=PROMPT,
            size="1024x1024",
        )

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
        print("[실패] 순수 생성도 막혔습니다 — 계정/조직 자체의 접근 권한 문제로 보입니다.")
        print(f"에러 내용: {e}")


if __name__ == "__main__":
    run_test()