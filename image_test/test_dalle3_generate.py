"""
dall-e-3로 생성 테스트 (gpt-image-1과 별도 모델)

목적: gpt-image-1이 조직 접근 제한으로 막혀있을 때,
     dall-e-3도 똑같이 막히는지 확인해서
     - 이미지 생성 기능 전체가 막힌 건지
     - gpt-image-1 모델에만 해당하는 제한인지
     구분하기 위한 테스트.
"""

import os
from dotenv import load_dotenv
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

OUTPUT_IMAGE_PATH = os.path.join(BASE_DIR, "result_dalle3.png")

PROMPT = (
    "1980s Hongdae street style photo, sepia film grain, neon signs in a back alley, "
    "a person walking with a cognac brown leather bag."
)


def run_test():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[에러] OPENAI_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인하세요.")
        return

    client = OpenAI(api_key=api_key)

    print("[진행] dall-e-3 images.generate 호출 중...")

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=PROMPT,
            size="1024x1024",
            n=1,
        )

        result = response.data[0]
        print(f"[성공] 결과 이미지 URL: {result.url}")

    except Exception as e:
        print("[실패] dall-e-3도 막혔습니다 — 계정 전체의 이미지 생성 권한 문제로 보입니다.")
        print(f"에러 내용: {e}")


if __name__ == "__main__":
    run_test()