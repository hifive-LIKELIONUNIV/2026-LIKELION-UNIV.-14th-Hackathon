"""
가방 3종 x 시대 3종 조합에 대한 메타데이터 정의.

레퍼런스 이미지는 아래 폴더 구조로 준비해야 함:

references/
├── bag1/
│   ├── 1976-1.png
│   ├── 2005-1.png
│   └── 2016-1.png
├── bag2/
│   ├── 1976-2.png
│   ├── 2005-2.png
│   └── 2016-2.png
└── bag3/
    ├── 1976-3.png
    ├── 2005-3.png
    └── 2016-3.png
"""

import os

# ---- 가방 정보 (실제 제품명/설명으로 교체 필요) ----
BAGS = {
    "bag1": {
        "name": "Ella 비세토스 보스턴 백",
    },
    "bag2": {
        "name": "Pina 비세토스 탬버린 백",
    },
    "bag3": {
        "name": "스타크 사이드 스터드 비세토스 백팩",
    },
}

# ---- 시대 정보 (mood 문구는 실제 브랜드 히스토리에 맞게 다듬기) ----
ERAS = {
    "1976": {
        "label": "1976년",
        "mood": "MCM 브랜드 탄생 시기의 클래식하고 고전적인 유럽 스트리트 분위기",
    },
    "2005": {
        "label": "2005년",
        "mood": "성주그룹 인수 이후 글로벌화되던 2000년대 도시적이고 세련된 분위기",
    },
    "2016": {
        "label": "2016년",
        "mood": "스트리트 패션과 젊은 감성이 부상하던 시기의 캐주얼하고 트렌디한 분위기",
    },
}


def reference_image_path(base_dir: str, bag_id: str, era: str) -> str:
    """base_dir(스크립트 위치) 기준으로 레퍼런스 이미지 경로를 반환.
    실제 파일명이 '1976-1.png'처럼 bag 번호 접미사가 붙어있어 bag_id 끝자리를 붙여줌."""
    bag_num = bag_id[-1]  # "bag1" -> "1"
    return os.path.join(base_dir, "references", bag_id, f"{era}-{bag_num}.png")