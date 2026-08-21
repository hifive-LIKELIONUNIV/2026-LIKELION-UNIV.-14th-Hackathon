"""
시대별 메타데이터.

- mood: gpt-image-2 프롬프트에 들어가는 분위기 설명 (영어 프롬프트 조립용)
- title/subtitle/description: 결과 화면에 노출되는 카피 (임시 문구 — 기획팀 문구로 교체 필요)
"""

from django.conf import settings

ERA_ORDER = ['1976', '2005', '2016', '2026']

ERA_META = {
    '1976': {
        'label': '1976',
        'mood': "MCM 브랜드 탄생 시기의 클래식하고 고전적인 유럽 스트리트 분위기",
        'title': '1976, Munich',
        'subtitle': 'MCM의 출발',
        'description': '뮌헨에서 시작된 MCM의 첫 걸음. 클래식한 유럽 감성 속에서 브랜드의 정체성이 태어났습니다.',
    },
    '2005': {
        'label': '2005',
        'mood': "성주그룹 인수 이후 글로벌화되던 2000년대 도시적이고 세련된 분위기",
        'title': '2005, Global',
        'subtitle': '글로벌 도약',
        'description': '성주그룹 인수 이후, MCM은 아시아를 넘어 세계로 뻗어나가는 세련된 도시적 감성을 담았습니다.',
    },
    '2016': {
        'label': '2016',
        'mood': "스트리트 패션과 젊은 감성이 부상하던 시기의 캐주얼하고 트렌디한 분위기",
        'title': '2016, Street',
        'subtitle': '새로운 세대',
        'description': '창립 40주년을 맞은 MCM, 스트리트 감성과 젊은 에너지가 브랜드에 새로운 활력을 불어넣었습니다.',
    },
    '2026': {
        'label': '2026',
        'mood': '현재의 나, 합성 없이 그대로',
        'title': '2026, Now',
        'subtitle': '지금의 나',
        'description': '시간 여행을 마치고 돌아온 지금, 당신의 모습입니다.',
    },
}


def next_era(era: str):
    """다음 시대 코드를 반환. 마지막 시대면 None."""
    idx = ERA_ORDER.index(era)
    if idx + 1 < len(ERA_ORDER):
        return ERA_ORDER[idx + 1]
    return None


# ---- 네컷(passport) 프레임 설정 ----
# 디자인팀에서 받은 프레임 PNG v2 적용 (media/frames/time_passport_frame.png,
# 515x676, 사진 자리 4곳이 실제로 alpha=0으로 투명 처리되어 있는 것 확인함— 스탬프/로고/
# 하단 날짜 텍스트가 추가된 리뉴얼 버전이라 슬롯 좌표도 이전 프레임과 살짝 달라졌음).
# 순서는 1976 -> 2005 -> 2016 -> 2026 (좌상단 -> 우상단 -> 좌하단 -> 우하단).
#
# 2026-08-21: 사진과 매트(여백) 사이 틈이 너무 넓다는 피드백으로, 프레임 PNG 자체를
# 코드로 후처리해서 매트 색상(RGB 127,93,66)만 골라 각 슬롯 바깥으로 4px씩 투명 영역을
# 넓혔음(스탬프/로고/날짜는 색이 달라 안 건드려짐). 슬롯 좌표도 그만큼 확장해서 반영.
PASSPORT_FRAME_PATH = settings.MEDIA_ROOT / 'frames' / 'time_passport_frame.png'

PASSPORT_FRAME_SLOTS = [
    (35, 33, 217, 287),
    (263, 33, 217, 287),
    (35, 331, 217, 287),
    (263, 331, 217, 287),
]

# 프레임이 없을 때(PASSPORT_FRAME_PATH가 None) 쓰는 기본 캔버스 크기/배경색.
# 프레임이 생기면 프레임 이미지 자체의 크기를 그대로 캔버스 크기로 쓰므로 이 값은 안 쓰임.
PASSPORT_PLAIN_CANVAS_SIZE = (1008, 1328)
PASSPORT_PLAIN_BACKGROUND_COLOR = (20, 16, 12)
