from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def csrf_view(request):
    """React가 앱 시작 시 한 번 호출해서 csrftoken 쿠키를 받아가는 용도.

    지금까지는 Django 템플릿의 {% csrf_token %} 태그가 페이지를 렌더링할 때마다
    자동으로 CSRF 쿠키를 심어줬는데, 화면 전체가 JSON API로 바뀌면서 그 경로가
    사라졌다. 이 엔드포인트가 없으면 React 쪽에서 로그인/사진 저장 등 POST
    요청을 보낼 CSRF 토큰을 아예 구할 방법이 없다.

    사용법(프론트):
      1) 앱 로드 시 GET /csrf/ 를 한 번 호출 (credentials: 'include')
      2) 이후 모든 POST 요청에 document.cookie에서 csrftoken 값을 읽어
         X-CSRFToken 헤더로 실어 보낸다 (기존 템플릿들의 getCookie() 패턴과 동일)
    """
    return JsonResponse({'success': True})
