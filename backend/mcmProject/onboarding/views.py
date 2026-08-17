from django.contrib.auth import logout
from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_POST


def onboarding_view(request):
    """첫 진입 화면(정적 카피). 데이터 자체는 고정이라 프론트에 하드코딩해도 되지만,
    문구 변경 시 배포 없이 바꿀 수 있도록 서버에서 내려준다."""
    return JsonResponse({
        'title': 'Time PORTAL',
        'eyebrow': 'MCM Heritage Experience',
        'subtitle': 'MCM의 시간을 건너, 그 시대 속 당신을 만나보세요.',
        'start_url': reverse('login'),
    })


@require_POST
def restart_view(request):
    """'처음으로' — 로그인 여부와 상관없이 세션을 완전히 초기화하고 처음 화면(온보딩)으로 되돌린다.
    상태를 바꾸는 동작이라 GET 링크가 아니라 POST로만 받는다(React에서 버튼 클릭 시 fetch)."""
    logout(request)          # 로그인되어 있었으면 로그아웃
    request.session.flush()  # 비회원 세션(session_key 등)도 함께 초기화
    return JsonResponse({
        'success': True,
        'redirect': reverse('onboarding'),
    })