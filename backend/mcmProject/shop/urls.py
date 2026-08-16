from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    path('select/', views.select_bag, name='select_bag'),
    path('select/done/', views.select_bag_done, name='select_bag_done'),

    path('capture/<int:selection_id>/', views.capture_photo, name='capture_photo'),
    path('capture/<int:selection_id>/save/', views.save_photo, name='save_photo'),

    path('capture/<int:selection_id>/choose/', views.choose_photo_page, name='choose_photo_page'),
    path('capture/<int:selection_id>/choose/submit/', views.choose_photo, name='choose_photo'),

    path('capture/<int:selection_id>/finish/', views.finish_selection, name='finish_selection'),

    path('capture/<int:selection_id>/recommend/', views.recommend_products, name='recommend_products'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
]