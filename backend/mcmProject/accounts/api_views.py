import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from .forms import SignUpForm


@ensure_csrf_cookie
def csrf_bootstrap(request):
    """SPA는 Django 템플릿을 거치지 않아 csrftoken 쿠키가 자동으로 안 심어지므로,
    앱 진입 시 이 엔드포인트를 한 번 호출해 쿠키를 심어둔다."""
    return JsonResponse({})


@require_POST
def signup_api(request):
    """signup(HTML) POST와 동일한 SignUpForm 검증/생성 로직 — 성공하면 바로 로그인 처리."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

    form = SignUpForm(data)
    if not form.is_valid():
        return JsonResponse({'errors': form.errors.get_json_data()}, status=400)

    user = form.save()
    login(request, user)
    return JsonResponse({'email': user.email})


@require_POST
def login_api(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

    email = data.get('email', '')
    password = data.get('password', '')

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}, status=401)

    login(request, user)
    return JsonResponse({'email': user.email})


@require_POST
def logout_api(request):
    logout(request)
    return JsonResponse({})


def me_api(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'email': request.user.email})
    return JsonResponse({'authenticated': False, 'email': None})
