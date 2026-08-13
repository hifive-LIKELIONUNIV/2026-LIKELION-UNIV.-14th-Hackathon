from django.urls import path
from . import views

urlpatterns = [
    path('', views.onboarding_view, name='onboarding'),
]