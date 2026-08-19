from django.contrib.auth import logout
from django.shortcuts import render, redirect

def onboarding_view(request):
    return render(request, 'onboarding/onboarding.html')


def restart_view(request):
    """'처음으로' — 로그인 여부와 상관없이 세션을 완전히 초기화하고 처음 화면(온보딩)으로 되돌린다."""
    logout(request)          # 로그인되어 있었으면 로그아웃
    request.session.flush()  # 비회원 세션(session_key 등)도 함께 초기화
    return redirect('onboarding')