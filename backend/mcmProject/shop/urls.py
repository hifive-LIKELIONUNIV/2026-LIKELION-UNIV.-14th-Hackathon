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

    path('capture/<int:selection_id>/era/<str:era>/loading/', views.era_loading, name='era_loading'),
    path('capture/<int:selection_id>/era/<str:era>/status/', views.era_status, name='era_status'),
    path('capture/<int:selection_id>/era/<str:era>/generate/', views.era_generate, name='era_generate'),
    path('capture/<int:selection_id>/era/<str:era>/result/', views.era_result, name='era_result'),
    path('capture/<int:selection_id>/era/<str:era>/regenerate/', views.era_regenerate, name='era_regenerate'),
    path('capture/<int:selection_id>/era/<str:era>/regenerate/choose/', views.era_regen_choose, name='era_regen_choose'),
    path('capture/<int:selection_id>/era/<str:era>/regenerate/confirm/', views.era_regen_confirm, name='era_regen_confirm'),

    path('capture/<int:selection_id>/era/2026/capture/', views.era_2026_capture, name='era_2026_capture'),
    path('capture/<int:selection_id>/era/2026/capture/save/', views.era_2026_capture_save, name='era_2026_capture_save'),

    path('capture/<int:selection_id>/passport/', views.passport_result, name='passport_result'),
    path('capture/<int:selection_id>/passport/download/', views.passport_download, name='passport_download'),
    path('capture/<int:selection_id>/passport/qrcode/', views.passport_qrcode, name='passport_qrcode'),
]