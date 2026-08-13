from django.urls import path
from .views import signup, EmailLoginView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', EmailLoginView.as_view(), name='login'),
]