from django.contrib.auth import logout
from django.http import JsonResponse
from django.views.decorators.http import require_POST


def onboarding_api(request):
    """onboarding_view(HTML)와 동일한 카피. 지금은 고정 문구라 그대로 반환하지만,
    기획팀 문구가 바뀌면 여기 값만 수정하면 됨(프론트가 하드코딩할 필요 없게)."""
    return JsonResponse({
        'brand': 'MCM Heritage Experience',
        'title': 'Time PORTAL',
        'subtitle': 'MCM의 시간을 건너, 그 시대 속 당신을 만나보세요.',
    })


@require_POST
def restart_api(request):
    """'처음으로' — 로그인 여부와 상관없이 세션을 완전히 초기화하고 처음 화면(온보딩)으로.
    restart_view(HTML, redirect)와 동일한 로직이지만 SPA에서 fetch로 호출하도록 JSON으로 응답."""
    logout(request)          # 로그인되어 있었으면 로그아웃
    request.session.flush()  # 비회원 세션(session_key 등)도 함께 초기화
    return JsonResponse({'success': True})
