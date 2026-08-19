from django.urls import path
from . import api_views

app_name = 'onboarding_api'

urlpatterns = [
    path('', api_views.onboarding_api, name='onboarding_api'),
    path('restart/', api_views.restart_api, name='restart_api'),
]
