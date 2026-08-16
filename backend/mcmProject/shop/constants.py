"""
시대별 메타데이터.

- mood: gpt-image-2 프롬프트에 들어가는 분위기 설명 (영어 프롬프트 조립용)
- title/subtitle/description: 결과 화면에 노출되는 카피 (임시 문구 — 기획팀 문구로 교체 필요)
"""

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
