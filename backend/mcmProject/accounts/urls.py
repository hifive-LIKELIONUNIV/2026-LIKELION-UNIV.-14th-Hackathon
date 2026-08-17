from django.urls import path
from .views import signup, login_view, me

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('me/', me, name='me'),
]