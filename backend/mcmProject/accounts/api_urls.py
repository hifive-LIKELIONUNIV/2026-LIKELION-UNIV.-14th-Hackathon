from django.urls import path
from . import api_views

app_name = 'accounts_api'

urlpatterns = [
    path('csrf/', api_views.csrf_bootstrap, name='csrf_bootstrap'),
    path('signup/', api_views.signup_api, name='signup_api'),
    path('login/', api_views.login_api, name='login_api'),
    path('logout/', api_views.logout_api, name='logout_api'),
    path('me/', api_views.me_api, name='me_api'),
]
