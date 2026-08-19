"""
가방 3종 x 시대 3종 = 9가지 조합을 한 번에 생성해서 비교하기 위한 배치 테스트 스크립트.
(이 파일은 저장소 루트에 있고, 실제 리소스는 image_test/ 안에 있어 경로를 image_test 기준으로 맞춤)

사용법:
    1) image_test/.env 파일에 OPENAI_API_KEY 설정
    2) image_test/face_photo.png 저장
    3) image_test/references/bag1~3/1976-N.png, 2005-N.png, 2016-N.png 총 9장 준비
    4) python3 test_generate_all.py
       (특정 조합만 테스트하려면 아래 TARGET_BAGS / TARGET_ERAS를 좁혀서 실행)
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_TEST_DIR = os.path.join(ROOT_DIR, "image_test")
sys.path.insert(0, IMAGE_TEST_DIR)  # image_test/config.py, generator.py를 import하기 위함

from config import BAGS, ERAS  # noqa: E402
from generator import generate_era_photo  # noqa: E402

load_dotenv(os.path.join(IMAGE_TEST_DIR, ".env"))

FACE_PHOTO = os.path.join(IMAGE_TEST_DIR, "face_photo.png")
OUTPUT_DIR = os.path.join(IMAGE_TEST_DIR, "results")

# 전체 9종 대신 일부만 빠르게 테스트하고 싶으면 아래 리스트를 좁혀서 사용
TARGET_BAGS = list(BAGS)   # 예: ["bag1"]
TARGET_ERAS = list(ERAS)   # 예: ["1976"]


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[에러] OPENAI_API_KEY가 설정되어 있지 않습니다. image_test/.env 파일을 확인하세요.")
        return

    if not os.path.exists(FACE_PHOTO):
        print(f"[에러] 얼굴 사진이 없습니다: {FACE_PHOTO}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = OpenAI(api_key=api_key)

    results = []
    for bag_id in TARGET_BAGS:
        for era in TARGET_ERAS:
            output_path = os.path.join(OUTPUT_DIR, f"{bag_id}_{era}.png")
            print(f"[진행] {bag_id} x {era} 생성 중...")
            try:
                result = generate_era_photo(
                    client=client,
                    base_dir=IMAGE_TEST_DIR,
                    face_photo_path=FACE_PHOTO,
                    bag_id=bag_id,
                    era=era,
                    output_path=output_path,
                )
                print(f"  -> 성공: {result}")
                results.append((bag_id, era, "성공", result))
            except Exception as e:
                print(f"  -> 실패: {e}")
                results.append((bag_id, era, "실패", str(e)))

    print("\n===== 결과 요약 =====")
    for bag_id, era, status, detail in results:
        print(f"{bag_id} x {era}: {status}")


if __name__ == "__main__":
    main()
