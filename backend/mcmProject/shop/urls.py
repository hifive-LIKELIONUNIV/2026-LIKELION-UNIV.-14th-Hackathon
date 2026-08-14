from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    path('select-bag/', views.select_bag, name='select_bag'),
    path('select-bag/done/', views.select_bag_done, name='select_bag_done'),

    path('capture/<int:selection_id>/', views.capture_photo, name='capture_photo'),
    path('capture/<int:selection_id>/save/', views.save_photo, name='save_photo'),
    path('capture/<int:selection_id>/choose/', views.choose_photo_page, name='choose_photo_page'),
    path('capture/<int:selection_id>/choose/submit/', views.choose_photo, name='choose_photo'),
]