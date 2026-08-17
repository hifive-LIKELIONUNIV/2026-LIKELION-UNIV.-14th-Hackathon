from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_POST
from .forms import SignUpForm

# React(별도 오리진) 연동을 위해 폼 렌더링 대신 JSON으로 전환.
# 인증 방식 자체는 그대로 Django 세션/쿠키 기반 유지 — 프론트는 fetch에
# credentials: 'include'를 붙이고, 로그인 페이지 진입 전 /csrf/ 를 한 번 호출해서
# CSRF 쿠키를 먼저 받아둬야 한다 (settings.py, mcmProject/views.py 참고).


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({
                'success': True,
                'email': user.email,
                'redirect': reverse('shop:select_bag'),
            })
        return JsonResponse({'errors': form.errors}, status=400)

    # GET: 프론트가 어떤 필드를 받아야 하는지 알 수 있게 간단한 안내만 반환
    return JsonResponse({'fields': ['email', 'password1', 'password2']})


@require_POST
def login_view(request):
    email = request.POST.get('email')
    password = request.POST.get('password')

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}, status=401)

    login(request, user)
    return JsonResponse({
        'success': True,
        'email': user.email,
        'redirect': reverse('shop:select_bag'),
    })


def me(request):
    """현재 로그인 상태 확인용 — 프론트가 앱 진입 시 호출해서 로그인 화면을
    건너뛸지, 장바구니 버튼을 보여줄지 등을 판단하는 데 쓴다."""
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'email': request.user.email})
    return JsonResponse({'authenticated': False, 'email': None})