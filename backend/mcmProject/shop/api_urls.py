from django.urls import path
from . import api_views

app_name = 'shop_api'

urlpatterns = [
    path('products/', api_views.products_list, name='products_list'),
    path('select/', api_views.select_bag_api, name='select_bag_api'),

    path('capture/<int:selection_id>/', api_views.capture_status, name='capture_status'),
    path('capture/<int:selection_id>/photos/', api_views.photos_list, name='photos_list'),

    path('capture/<int:selection_id>/era/<str:era>/result/', api_views.era_result_api, name='era_result_api'),
    path('capture/<int:selection_id>/era/<str:era>/regen-choice/', api_views.era_regen_choice_api, name='era_regen_choice_api'),

    path('capture/<int:selection_id>/era/2026/', api_views.era_2026_status, name='era_2026_status'),

    path('capture/<int:selection_id>/recommend/', api_views.recommend_products_api, name='recommend_products_api'),
    path('capture/<int:selection_id>/passport/', api_views.passport_api, name='passport_api'),
]
